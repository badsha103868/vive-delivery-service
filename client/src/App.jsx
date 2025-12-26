import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateParcel from './pages/CreateParcel';

export default function App() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-base-200">
      <a href="#main" className="skip-link sr-only focus:not-sr-only">Skip to content</a>
      <Navbar />
      <main id="main" className="container mx-auto p-6">
        <AnimatePresence mode="wait" initial={false}>
          {/* Routes keyed by location so AnimatePresence can manage exit/enter */}
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/create-parcel" element={<CreateParcel />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* ...other routes... */}
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}
