import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-base-100 mt-16">
      <div className="container mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="font-bold text-xl">Vive Delivery</h3>
          <p className="text-sm text-muted mt-2">Fast, reliable parcel delivery with transparent tracking and modern tooling for businesses.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="footer-col">Company</h4>
            <ul className="text-sm text-muted space-y-2">
              <li>About</li>
              <li>Careers</li>
              <li>Press</li>
            </ul>
          </div>
          <div>
            <h4 className="footer-col">Resources</h4>
            <ul className="text-sm text-muted space-y-2">
              <li>Developers</li>
              <li>Pricing</li>
              <li>Support</li>
            </ul>
          </div>
        </div>

        <div>
          <h4 className="footer-col">Get updates</h4>
          <p className="text-sm text-muted">Subscribe to our newsletter for product updates and offers.</p>
          <form className="mt-4 flex gap-2" onSubmit={(e)=>e.preventDefault()}>
            <input aria-label="Email" type="email" placeholder="you@company.com" className="input input-bordered w-full" />
            <button className="btn btn-primary">Subscribe</button>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 footer-legal">
        <div className="flex flex-col md:flex-row md:justify-between items-center gap-3">
          <div>© {new Date().getFullYear()} Vive Delivery — All rights reserved.</div>
          <div className="flex gap-4 text-sm text-muted">
            <div>Privacy</div>
            <div>Terms</div>
            <div>Security</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
