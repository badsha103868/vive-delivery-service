import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useAuth } from '../contexts/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export default function CreateParcel() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [estimating, setEstimating] = useState(false);
  const [form, setForm] = useState({
    pickupAddress: '',
    deliveryAddress: '',
    weightKg: 1,
    dims: { l: 20, w: 20, h: 10 },
    service: 'standard',
    insured: false,
    declaredValue: 0,
    notes: ''
  });

  // allow estimates without logging in; require login only on confirm submit
  useEffect(() => {
    // ...existing code...
  }, []);

  function updatePath(path, val) {
    if (path.includes('.')) {
      const [a,b] = path.split('.');
      setForm(prev => ({ ...prev, [a]: { ...prev[a], [b]: val } }));
    } else {
      setForm(prev => ({ ...prev, [path]: val }));
    }
  }

  async function getEstimate() {
    // basic validation before estimate
    if (!form.pickupAddress.trim() || !form.deliveryAddress.trim()) {
      return Swal.fire({ icon: 'error', title: 'Validation', text: 'Pickup and delivery addresses are required' });
    }

    setEstimating(true);
    try {
      const res = await fetch(`${API_BASE}/api/estimate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'Estimate failed');

      const currency = data.pricing.currency || 'BDT';
      const symbol = data.pricing.currencySymbol || '৳';
      let formatted;
      try {
        formatted = new Intl.NumberFormat('en-BD', { style: 'currency', currency }).format(data.pricing.total);
      } catch (_) {
        formatted = `${symbol}${data.pricing.total}`;
      }

      // show estimate modal with breakdown
      const html = `<p class="mb-2"><strong>Estimated: ${formatted}</strong></p>
        <ul style="text-align:left">
          <li>Base fee: ${symbol}${data.pricing.breakdown.baseFee}</li>
          <li>Charge weight: ${data.pricing.breakdown.chargeWeight} kg (volumetric ${data.pricing.breakdown.volumetricKg} kg)</li>
          <li>Per kg: ${symbol}${data.pricing.breakdown.perKg}</li>
          <li>Service multiplier: x${data.pricing.breakdown.serviceMultiplier}</li>
          <li>Insurance: ${symbol}${data.pricing.breakdown.insuranceFee}</li>
          <li>Volume surcharge: ${symbol}${data.pricing.breakdown.volumeSurcharge}</li>
        </ul>`;

      const result = await Swal.fire({
        icon: 'info',
        title: `Estimate ${formatted}`,
        html,
        showCancelButton: true,
        confirmButtonText: 'Confirm & Submit',
        cancelButtonText: 'Cancel',
        focusConfirm: false
      });

      if (result.isConfirmed) {
        // require login to actually create parcel
        if (!auth?.user) {
          await Swal.fire({ icon: 'info', title: 'Login required', text: 'Please sign in to confirm and submit your parcel.' });
          navigate('/login', { state: { from: '/create-parcel' } });
          return;
        }

        // create parcel
        setLoading(true);
        try {
          const res2 = await auth.fetchWithAuth(`${API_BASE}/api/parcels`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form)
          });
          const created = await res2.json();
          if (!res2.ok) throw new Error(created?.error || 'Failed to create parcel');

          // show final modal with only total price
          let formattedFinal;
          try {
            formattedFinal = new Intl.NumberFormat('en-BD', { style: 'currency', currency: created.currency || 'BDT' }).format(created.tentativePrice);
          } catch (_) {
            formattedFinal = `${created.currencySymbol || '৳'}${created.tentativePrice}`;
          }

          await Swal.fire({ icon: 'success', title: `Total ${formattedFinal}`, html: `<p>Parcel created (ID: ${created.parcelId})</p>`, showConfirmButton: true });
          // optional: navigate to parcel list / home
          navigate('/');
        } catch (err) {
          Swal.fire({ icon: 'error', title: 'Create failed', text: err.message || 'Could not create parcel' });
        } finally {
          setLoading(false);
        }
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Estimate failed', text: err.message || 'Could not get estimate' });
    } finally {
      setEstimating(false);
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mx-auto max-w-2xl bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Create a Parcel</h2>
        <form onSubmit={e => e.preventDefault()} className="space-y-4">
          <div>
            <label className="block text-sm">Pickup address</label>
            <input value={form.pickupAddress} onChange={e => updatePath('pickupAddress', e.target.value)} className="input input-bordered w-full" required />
          </div>

          <div>
            <label className="block text-sm">Delivery address</label>
            <input value={form.deliveryAddress} onChange={e => updatePath('deliveryAddress', e.target.value)} className="input input-bordered w-full" required />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm">Weight (kg)</label>
              <input type="number" min="0.1" step="0.1" value={form.weightKg} onChange={e => updatePath('weightKg', Number(e.target.value))} className="input input-bordered w-full" />
            </div>
            <div>
              <label className="block text-sm">Length (cm)</label>
              <input type="number" min="1" value={form.dims.l} onChange={e => updatePath('dims.l', Number(e.target.value))} className="input input-bordered w-full" />
            </div>
            <div>
              <label className="block text-sm">Width (cm)</label>
              <input type="number" min="1" value={form.dims.w} onChange={e => updatePath('dims.w', Number(e.target.value))} className="input input-bordered w-full" />
            </div>
            <div className="col-span-1">
              <label className="block text-sm">Height (cm)</label>
              <input type="number" min="1" value={form.dims.h} onChange={e => updatePath('dims.h', Number(e.target.value))} className="input input-bordered w-full" />
            </div>
          </div>

          <div>
            <label className="block text-sm">Service</label>
            <select value={form.service} onChange={e => updatePath('service', e.target.value)} className="select select-bordered w-full">
              <option value="standard">Standard</option>
              <option value="express">Express (faster)</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" checked={form.insured} onChange={e => updatePath('insured', e.target.checked)} className="checkbox" id="insured" />
            <label htmlFor="insured" className="text-sm">Add insurance</label>
            {form.insured && (
              <input type="number" min="0" value={form.declaredValue} onChange={e => updatePath('declaredValue', Number(e.target.value))} className="input input-bordered w-40 ml-auto" placeholder="Declared value" />
            )}
          </div>

          <div>
            <label className="block text-sm">Notes (optional)</label>
            <textarea value={form.notes} onChange={e => updatePath('notes', e.target.value)} className="textarea textarea-bordered w-full" rows="3" />
          </div>

          <div className="flex justify-end gap-3">
            <button type="button" className="btn btn-outline" onClick={() => { setForm({ pickupAddress: '', deliveryAddress: '', weightKg: 1, dims: { l: 20, w: 20, h: 10 }, service: 'standard', insured: false, declaredValue: 0, notes: '' }); }}>Reset</button>
            <button type="button" className="btn btn-primary" onClick={getEstimate} disabled={estimating || loading}>
              {estimating ? 'Estimating...' : 'Get Estimate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
