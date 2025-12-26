import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Swal from 'sweetalert2';

export default function Login() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  async function submit(e) {
    e.preventDefault();
    setErr('');
    try {
      await auth.login({ email, password });
      await Swal.fire({ icon: 'success', title: 'Signed in', text: 'Welcome back!', timer: 1400, showConfirmButton: false });
      navigate('/');
    } catch (error) {
      setErr(error.message || 'Login failed');
      Swal.fire({ icon: 'error', title: 'Login failed', text: error.message || 'Check credentials' });
    }
  }

  return (
    <div className="container mx-auto py-12">
      <div className="mx-auto max-w-md bg-white p-6 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        {err && <div className="text-red-600 mb-3">{err}</div>}
        <form onSubmit={submit} className="space-y-4">
          <input required type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="input input-bordered w-full" />
          <input required type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="input input-bordered w-full" />
          <div className="flex items-center justify-between">
            <button type="submit" className="btn btn-primary">Sign in</button>
            <Link to="/register" className="text-sm text-muted">Create account</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
