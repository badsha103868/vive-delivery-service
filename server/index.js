require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
app.use(express.json());
app.use(cors());

// Helpful environment debug + validation
const PORT = process.env.PORT || 4000;
let MONGO_URI = (process.env.MONGO_URI || '').trim();
const JWT_SECRET = process.env.JWT_SECRET || 'secret-placeholder';

if (MONGO_URI && /mongodb\+srv:\/\//.test(MONGO_URI)) {
  console.log('Detected mongodb+srv URI (Atlas). Ensure Atlas Network Access and DB user are configured.');
}

let mongoClient = null;
async function connectDb() {
  if (!MONGO_URI) {
    console.warn('DB connection skipped because MONGO_URI not set; DB routes will return an error.');
    return;
  }

  async function tryConnect(uri) {
    const client = new MongoClient(uri);
    await client.connect();
    return client;
  }

  try {
    mongoClient = await tryConnect(MONGO_URI);
    console.log('Connected to MongoDB');
    return;
  } catch (err) {
    console.error('Mongo connection error:', err?.name, '-', err?.message);

    if (/mongodb\+srv:\/\//.test(MONGO_URI)) {
      console.warn('Using Atlas (mongodb+srv). Check: DB user/pwd, Network Access (IP whitelist), and DNS.');
      console.warn('- Test locally with mongosh:');
      console.warn(`  mongosh "${MONGO_URI}"`);
      console.warn('- If password contains @/:/? etc, URL-encode it (encodeURIComponent).');
    }

    console.warn('Could not connect to MongoDB. See the above message for details.');
  }
}
connectDb().catch(err => console.error('Mongo connection error:', err?.name, err?.message));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api/hello', (req, res) => res.json({ msg: 'Hello from server' }));

app.get('/api/parcel-count', async (req, res) => {
  if (!mongoClient) return res.status(500).json({ error: 'DB not connected' });
  const dbName = process.env.MONGO_DB || 'vive_delivery';
  const db = mongoClient.db(dbName);
  const count = await db.collection('parcels').countDocuments();
  res.json({ count });
});

// helper middleware to verify JWT
function authenticateToken(req, res, next) {
  const auth = req.headers['authorization'];
  if (!auth) return res.status(401).json({ error: 'Missing authorization' });
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'Invalid auth format' });
  const token = parts[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload; // contains sub (userId) and email
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Register
app.post('/api/auth/register', async (req, res) => {
  if (!mongoClient) return res.status(500).json({ error: 'DB not connected' });
  const { name, email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  const db = mongoClient.db(process.env.MONGO_DB || 'vive_delivery');
  const users = db.collection('users');

  const existing = await users.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(409).json({ error: 'User already exists' });

  const hash = await bcrypt.hash(password, 10);
  const now = new Date();
  const result = await users.insertOne({ name: name || '', email: email.toLowerCase(), passwordHash: hash, createdAt: now });

  const userId = result.insertedId.toString();
  const token = jwt.sign({ sub: userId, email }, JWT_SECRET, { expiresIn: '7d' });

  res.json({ token, user: { id: userId, name: name || '', email } });
});

// Login
app.post('/api/auth/login', async (req, res) => {
  if (!mongoClient) return res.status(500).json({ error: 'DB not connected' });
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  const db = mongoClient.db(process.env.MONGO_DB || 'vive_delivery');
  const users = db.collection('users');

  const user = await users.findOne({ email: email.toLowerCase() });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.passwordHash || '');
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const userId = user._id.toString();
  const token = jwt.sign({ sub: userId, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

  res.json({ token, user: { id: userId, name: user.name || '', email: user.email } });
});

// Get current user
app.get('/api/me', authenticateToken, async (req, res) => {
  if (!mongoClient) return res.status(500).json({ error: 'DB not connected' });
  const db = mongoClient.db(process.env.MONGO_DB || 'vive_delivery');
  const users = db.collection('users');

  const user = await users.findOne({ _id: new ObjectId(req.user.sub) }, { projection: { passwordHash: 0 } });
  if (!user) return res.status(404).json({ error: 'User not found' });

  res.json({ user: { id: user._id.toString(), name: user.name || '', email: user.email } });
});

// new: diagnostic route to verify DB ping
app.get('/api/db-status', async (req, res) => {
  if (!mongoClient) return res.status(500).json({ ok: false, msg: 'DB not connected' });
  try {
    // ping the configured DB
    const db = mongoClient.db(process.env.MONGO_DB || 'vive_delivery');
    await db.command({ ping: 1 });
    res.json({ ok: true, msg: 'DB ping ok' });
  } catch (err) {
    console.error('DB status error:', err?.name, err?.message);
    res.status(500).json({ ok: false, error: err?.message || 'unknown' });
  }
});

// Pricing helper (simple, transparent)
function computePrice({ weightKg = 0, dims = { l:0,w:0,h:0 }, service = 'standard', insured=false, declaredValue=0 }) {
	// Strategy (proposal):
	// - base fee (flat)
	// - charge by max(actual weight, volumetric weight)
	// - volumetric weight = (L * W * H) / 5000 (cm -> kg heuristic)
	// - service multiplier: express -> 1.5, standard -> 1.0
	// - large volume surcharge for volume > 0.5 m^3
	// - insurance: max(minFee, percent of declaredValue)
	const baseFee = 30;
	const perKg = 12;
	const volumetricKg = ((dims.l || 0) * (dims.w || 0) * (dims.h || 0)) / 5000; // dims in cm
	const chargeWeight = Math.max(weightKg, volumetricKg, 0.1); // min small
	const serviceMultiplier = service === 'express' ? 1.5 : 1.0;
	const volumeCubic = ((dims.l || 0) * (dims.w || 0) * (dims.h || 0)) / 1000000; // m^3
	const volumeSurcharge = volumeCubic > 0.5 ? 100 : 0;
	const insuranceFee = insured ? Math.max(5, 0.02 * (declaredValue || 0)) : 0;

	let subtotal = baseFee + (perKg * chargeWeight) + volumeSurcharge;
	let total = (subtotal * serviceMultiplier) + insuranceFee;
	total = Math.round(total * 100) / 100;

	// Currency for Bangladesh
	const currency = 'BDT';
	const currencySymbol = '৳';

	return {
		total,
		currency,
		currencySymbol,
		breakdown: {
			baseFee,
			perKg,
			chargeWeight: Math.round(chargeWeight * 100) / 100,
			volumetricKg: Math.round(volumetricKg * 100) / 100,
			volumeSurcharge,
			serviceMultiplier,
			insuranceFee,
			subtotal: Math.round(subtotal * 100) / 100,
			total
		}
	};
}

// Create a parcel (protected)
app.post('/api/parcels', authenticateToken, async (req, res) => {
	if (!mongoClient) return res.status(500).json({ error: 'DB not connected' });

	const { pickupAddress, deliveryAddress, weightKg, dims, service, insured, declaredValue, notes } = req.body;
	if (!pickupAddress || !deliveryAddress) return res.status(400).json({ error: 'pickupAddress and deliveryAddress are required' });

	// Normalize / default
	const w = Number(weightKg) || 0;
	const dimensions = {
		l: Number(dims?.l) || 0,
		w: Number(dims?.w) || 0,
		h: Number(dims?.h) || 0,
	};

	const svc = ['standard','express'].includes(service) ? service : 'standard';
	const ins = Boolean(insured);
	const dec = Number(declaredValue) || 0;

	// Compute price
	const pricing = computePrice({ weightKg: w, dims: dimensions, service: svc, insured: ins, declaredValue: dec });

     try {
       const db = mongoClient.db(process.env.MONGO_DB || 'vive_delivery');
       const parcels = db.collection('parcels');

       const doc = {
         userId: req.user.sub,
         pickupAddress,
         deliveryAddress,
         weightKg: w,
         dims: dimensions,
         service: svc,
         insured: ins,
         declaredValue: dec,
         notes: notes || '',
         pricing: pricing.breakdown,
         tentativePrice: pricing.total,
         currency: pricing.currency,
         currencySymbol: pricing.currencySymbol,
         status: 'created',
         createdAt: new Date()
       };

       const result = await parcels.insertOne(doc);
       res.json({
         parcelId: result.insertedId.toString(),
         tentativePrice: pricing.total,
         currency: pricing.currency,
         currencySymbol: pricing.currencySymbol,
         breakdown: pricing.breakdown
       });
     } catch (err) {
       console.error('Create parcel error:', err?.message || err);
       res.status(500).json({ error: 'Could not create parcel' });
     }
   });

// Public estimate endpoint (no auth, no DB write)
app.post('/api/estimate', (req, res) => {
  try {
    const { weightKg = 0, dims = {}, service = 'standard', insured = false, declaredValue = 0 } = req.body || {};
    const pricing = computePrice({ weightKg: Number(weightKg) || 0, dims, service, insured: Boolean(insured), declaredValue: Number(declaredValue) || 0 });
    res.json({
      ok: true,
      pricing: {
        total: pricing.total,
        breakdown: pricing.breakdown,
        currency: pricing.currency || 'BDT',
        currencySymbol: pricing.currencySymbol || '৳'
      }
    });
  } catch (err) {
    console.error('Estimate error:', err?.message || err);
    res.status(500).json({ ok: false, error: 'Could not compute estimate' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
