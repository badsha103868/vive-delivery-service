# Frontend Plan — vive-delivery-service (client)

Goal: Create a React frontend (no TypeScript) using Vite, React Router, Tailwind CSS + daisyUI. Start by showing "Hello Delivery Parcel".

Step-by-step setup
1. Create project:
   - npm create vite@latest client -- --template react
   - cd client
2. Install dependencies:
   - npm install react-router-dom
   - npm install -D tailwindcss postcss autoprefixer
   - npm install daisyui
   - npx tailwindcss init -p
3. Update Tailwind config (see template below) to include daisyUI and point `content` to ./index.html and ./src.
4. Add Tailwind directives to src/index.css.
5. Create minimal app files (main.jsx, App.jsx, src/pages/Home.jsx) showing "Hello Delivery Parcel".
6. Run: npm run dev and open the URL shown (default http://localhost:5173).

Notes / future:
- Backend: Node + Express; MongoDB (native driver; no Mongoose now).
- Keep components simple and use react-router for pages.
- Add linting / prettier later if desired.

Files to create (minimal templates)
- Commands / instructions:
```
# filepath: c:\project\Mileston-13 -vive-coding\vive-delivery-service\client\README-setup.txt
# Create and set up
npm create vite@latest client -- --template react
cd client
npm install react-router-dom
npm install -D tailwindcss postcss autoprefixer
npm install daisyui
npx tailwindcss init -p
npm run dev
```

- src/main.jsx:
```javascript
// filepath: c:\project\Mileston-13 -vive-coding\vive-delivery-service\client\src\main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

- src/App.jsx:
```javascript
// filepath: c:\project\Mileston-13 -vive-coding\vive-delivery-service\client\src\App.jsx
import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Home from './pages/Home';

export default function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-base-200">
      <header className="w-full p-4 bg-white shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="font-bold text-xl">Vive Delivery</Link>
          <nav>
            <Link to="/" className="btn btn-ghost">Home</Link>
          </nav>
        </div>
      </header>

      <main className="container mx-auto p-6">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.key}>
            <Route path="/" element={<Home />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}
```

- src/pages/Home.jsx:
```javascript
// filepath: c:\project\Mileston-13 -vive-coding\vive-delivery-service\client\src\pages\Home.jsx
import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export default function Home() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <motion.h1
        className="text-4xl font-bold"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
      >
        Hello Delivery Parcel
      </motion.h1>
    </div>
  );
}
```

- src/index.css:
```css
/* filepath: c:\project\Mileston-13 -vive-coding\vive-delivery-service\client\src\index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Add any small project-specific utilities here */
```

- tailwind.config.cjs:
```javascript
// filepath: c:\project\Mileston-13 -vive-coding\vive-delivery-service\client\tailwind.config.cjs
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: { extend: {} },
  plugins: [require('daisyui')],
  daisyui: { themes: ['light', 'dark'] }
};
```

- postcss.config.cjs:
```javascript
// filepath: c:\project\Mileston-13 -vive-coding\vive-delivery-service\client\postcss.config.cjs
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

## Scaffold added to repo
I scaffolded a minimal client and server in this repo so you can run both locally.

- client: Vite + React (JS), react-router-dom, Tailwind CSS + daisyUI
- server: Node + Express, native MongoDB driver, dotenv

Quick run (from repo root)
1. Install dependencies
   - cd client && npm install
   - cd ../server && npm install
2. Start servers
   - cd client && npm run dev
   - cd ../server && npm run dev

See README.md and the files below for details.

Quick verification
- After starting dev server, open http://localhost:5173. You should see "Hello Delivery Parcel".
- From there extend routes/components and integrate API calls to the backend (Express + MongoDB) later.

That's the minimal plan and starter templates. Copy the snippets into the client folder created by Vite to get started quickly.

---

Add motion (Framer Motion)
- Install: cd client && npm install framer-motion
- Usage: wrap routes with AnimatePresence (useLocation) and add motion elements to pages to animate enter/exit and small UI micro-interactions. Respect prefers-reduced-motion via useReducedMotion.

UI & theme updates
- Added modern Home page with: Top announcement slider, Hero, Key highlights, Features, Competitor comparison, Testimonials, Footer.
- Added animated components using Framer Motion and a custom "vive" color theme (daisyUI).
- New components: TopBar, TestimonialCarousel, Footer; updated Navbar and Home.

Authentication
- Server: /api/auth/register, /api/auth/login, /api/me (JWT-based, bcrypt for hashing).
- Client: AuthProvider + Login/Register pages, token persistence in localStorage, Navbar updates to reflect auth state.

Parcel creation & pricing
- Added a Create Parcel page (client) that requires authentication, validates inputs, submits to POST /api/parcels and displays a tentative price.
- Server computes a transparent estimate using:
  - base fee + per-kg rate (charges by max(actual weight, volumetric weight)),
  - volumetric weight = (L*W*H)/5000,
  - service multiplier for express,
  - volume surcharge for very large parcels,
  - insurance fee = max(minFee, percent of declared value).
- Server stores parcel with userId, pricing breakdown and tentativePrice.

Pricing currency
- This service targets Bangladesh: all displayed and computed prices use BDT (৳ / BDT).
- Server returns currency and symbol with parcel responses, and client formats amounts using Intl when available.
