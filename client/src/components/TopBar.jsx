import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const announcements = [
  'Free pickup for first 3 shipments this month 🚚',
  'Now offering same-day delivery in select cities ⚡',
  'Earn rewards on every shipment 🎁',
];

export default function TopBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex(i => (i + 1) % announcements.length), 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="w-full bg-gradient-to-r from-primary to-secondary text-primary-content">
      <div className="container mx-auto px-4 py-2 overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ x: 60, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -60, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="text-sm font-medium"
                aria-live="polite"
              >
                {announcements[index]}
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="hidden sm:block text-xs opacity-80">Delivering delight — every parcel counts.</div>
        </div>
      </div>
    </div>
  );
}
