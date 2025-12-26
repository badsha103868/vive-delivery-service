import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import Swal from 'sweetalert2';
import logo from '../assets/logo.svg';

function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('theme', t);
}

export default function Navbar() {
  const [theme, setTheme] = useState('vive');
  const auth = useAuth();

  useEffect(() => {
    const stored = localStorage.getItem('theme') || 'vive';
    setTheme(stored);
    applyTheme(stored);
  }, []);

  function toggle() {
    const next = theme === 'dark' ? 'vive' : theme === 'vive' ? 'dark' : 'vive';
    setTheme(next);
    applyTheme(next);
  }

  return (
    <nav className="w-full bg-transparent">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <motion.div whileHover={{ scale: 1.02 }} className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="Vive Delivery" className="h-8 w-auto" />
            <span className="hidden sm:inline font-bold text-xl normal-case">Vive Delivery</span>
          </Link>
        </motion.div>

        <div className="hidden md:flex items-center gap-4">
          <a href="#services" className="btn btn-ghost">Services</a>
          <Link to="/create-parcel" className="btn btn-primary">Create Parcel</Link>
          <a href="#features" className="btn btn-ghost">Features</a>
          <a href="#compare" className="btn btn-ghost">Why Us</a>
          <a href="#testimonials" className="btn btn-ghost">Testimonials</a>

          {auth?.user ? (
            <>
              <span className="text-sm opacity-80">Hi, {auth.user.name || auth.user.email}</span>
              <button
                className="btn btn-ghost"
                onClick={() => {
                  Swal.fire({
                    title: 'Logout',
                    text: 'Do you want to logout?',
                    icon: 'question',
                    showCancelButton: true,
                  }).then(result => {
                    if (result.isConfirmed) {
                      auth.logout();
                      Swal.fire({ icon: 'success', title: 'Logged out', timer: 1200, showConfirmButton: false });
                    }
                  });
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Login</Link>
              <Link to="/register" className="btn btn-primary">Get Started</Link>
            </>
          )}

          <button aria-label="Toggle theme" className="btn btn-ghost btn-square" onClick={toggle}>
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
        </div>

        <div className="md:hidden">
          {/* minimal mobile menu */}
          <details className="dropdown">
            <summary className="btn btn-ghost">☰</summary>
            <ul className="menu p-2 shadow bg-base-100 rounded-box">
              <li><a href="#services">Services</a></li>
              <li><a href="#features">Features</a></li>
              <li><a href="#compare">Why Us</a></li>
              {auth?.user ? (
                <li>
                  <button onClick={() => {
                    Swal.fire({ title: 'Logout', text: 'Do you want to logout?', icon: 'question', showCancelButton: true })
                      .then(res => {
                        if (res.isConfirmed) { auth.logout(); Swal.fire({ icon: 'success', title: 'Logged out', timer: 1200, showConfirmButton: false }); }
                      });
                  }}>Logout</button>
                </li>
              ) : (
                <>
                  <li><Link to="/login">Login</Link></li>
                  <li><Link to="/register">Get Started</Link></li>
                </>
              )}
            </ul>
          </details>
        </div>
      </div>
    </nav>
  );
}
