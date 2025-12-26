import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import BannerSlider from '../components/BannerSlider';
import TestimonialCarousel from '../components/TestimonialCarousel';
import Footer from '../components/Footer';

const fadeUp = (reduce) =>
  reduce
    ? {}
    : { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

export default function Home() {
  const reduce = useReducedMotion();

  return (
    <>
      <BannerSlider />

      <section id="services" className="py-12">
        <motion.div {...fadeUp(reduce)} className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Key Highlights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card bg-base-100 shadow p-6">
              <div className="text-3xl">⚡</div>
              <h3 className="font-semibold mt-3">Speed</h3>
              <p className="text-sm text-muted mt-2">Optimized routing for faster delivery windows.</p>
            </div>
            <div className="card bg-base-100 shadow p-6">
              <div className="text-3xl">🔒</div>
              <h3 className="font-semibold mt-3">Secure</h3>
              <p className="text-sm text-muted mt-2">End-to-end tracking and secure handoffs.</p>
            </div>
            <div className="card bg-base-100 shadow p-6">
              <div className="text-3xl">📈</div>
              <h3 className="font-semibold mt-3">Transparent</h3>
              <p className="text-sm text-muted mt-2">Real-time status and analytics for teams.</p>
            </div>
          </div>
        </motion.div>
      </section>

      <section id="features" className="py-12 bg-base-200">
        <motion.div {...fadeUp(reduce)} className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-white rounded shadow">
              <h4 className="font-semibold">Auto-scheduling</h4>
              <p className="text-sm text-muted mt-2">Automatically pick best time slots for delivery.</p>
            </div>
            <div className="p-6 bg-white rounded shadow">
              <h4 className="font-semibold">Bulk Upload</h4>
              <p className="text-sm text-muted mt-2">Upload thousands of shipments via CSV/API.</p>
            </div>
            <div className="p-6 bg-white rounded shadow">
              <h4 className="font-semibold">Notifications</h4>
              <p className="text-sm text-muted mt-2">Email/SMS/Push updates for customers and teams.</p>
            </div>
          </div>
        </motion.div>
      </section>

      <section id="compare" className="py-12">
        <motion.div {...fadeUp(reduce)} className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Why choose Vive vs Competitors</h2>
          <div className="overflow-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Vive Delivery</th>
                  <th>Competitor</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Real-time tracking</td>
                  <td><span className="badge badge-primary">Yes</span></td>
                  <td><span className="opacity-60">Delayed</span></td>
                </tr>
                <tr>
                  <td>Same-day option</td>
                  <td><span className="badge badge-success">Yes</span></td>
                  <td><span className="opacity-60">No</span></td>
                </tr>
                <tr>
                  <td>Transparent pricing</td>
                  <td><span className="badge badge-primary">Yes</span></td>
                  <td><span className="opacity-60">Hidden fees</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      </section>

      <section id="testimonials" className="py-12 bg-base-200">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold mb-6">Testimonials</h2>
          <TestimonialCarousel />
        </div>
      </section>

      <Footer />
    </>
  );
}
