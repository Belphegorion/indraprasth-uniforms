import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, ExternalLink } from 'lucide-react';
import { usePublicSettings } from '../../api';

export const Footer: React.FC = () => {
  const { data: settings } = usePublicSettings();
  const branches = settings?.branches || [];

  return (
    <>
      <footer className="bg-navy-900 text-sand-200 text-sm mt-24 border-t border-navy-800 relative">
        {/* Subtle decorative brass hairline */}
        <div className="brass-hairline" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            {/* Brand column */}
            <div className="lg:col-span-2 space-y-4">
              <div className="space-y-3">
                <Link
                  to="/"
                  className="inline-block bg-cream-50 rounded-[10px] p-2.5 shadow-md border border-sand-300 hover:bg-white transition-colors"
                  aria-label="Indraprasth Uniforms Home"
                >
                  <img
                    src="/logo.png"
                    alt="Indraprasth Uniforms - The Uniform Icons Since 1975"
                    className="h-12 w-auto object-contain"
                    width="200"
                    height="100"
                  />
                </Link>
              </div>

              <p className="text-sand-300 text-sm leading-relaxed max-w-sm font-sans">
                Bhopal’s most trusted retail & institutional uniform destination. Serving
                generations of students, physicians, healthcare workers, and corporate teams with
                uncompromised fabric quality and master tailoring for over five decades.
              </p>

              <div className="pt-2 text-xs text-sand-300 space-y-1 font-mono">
                <p>GSTIN: {settings?.gstin || '23AAAAA0000A1Z5'}</p>
                <p>Headquarters: {settings?.address || 'Plot 23, New MLA Colony, Jawahar Chowk, Bhopal 462003'}</p>
              </div>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="text-brass font-serif uppercase tracking-widest text-xs font-bold mb-4 pb-2 border-b border-navy-800">
                Explore Uniforms
              </h4>
              <ul className="space-y-2.5 text-sm font-sans">
                <li>
                  <Link to="/shop" className="text-sand-300 hover:text-white transition-colors">
                    All Uniforms
                  </Link>
                </li>
                <li>
                  <Link to="/school/dps-bhopal" className="text-sand-300 hover:text-white transition-colors">
                    Delhi Public School Bhopal
                  </Link>
                </li>
                <li>
                  <Link to="/school/dps-kolar" className="text-sand-300 hover:text-white transition-colors">
                    DPS Kolar Road
                  </Link>
                </li>
                <li>
                  <Link to="/shop?category=winter-ware" className="text-sand-300 hover:text-white transition-colors">
                    Winter Blazers & Woollens
                  </Link>
                </li>
                <li>
                  <Link to="/bulk-inquiry" className="text-brass hover:text-white transition-colors font-medium">
                    Institutional & Bulk Orders
                  </Link>
                </li>
              </ul>
            </div>

            {/* Customer Care */}
            <div>
              <h4 className="text-brass font-serif uppercase tracking-widest text-xs font-bold mb-4 pb-2 border-b border-navy-800">
                Client Services
              </h4>
              <ul className="space-y-2.5 text-sm font-sans">
                <li>
                  <Link to="/track-order" className="text-sand-300 hover:text-white transition-colors">
                    Track Your Order
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-sand-300 hover:text-white transition-colors">
                    50-Year Tailoring Legacy
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-sand-300 hover:text-white transition-colors">
                    Store Locations & Hours
                  </Link>
                </li>
                <li>
                  <a
                    href={`https://wa.me/${settings?.whatsappNumber || '919826025211'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Concierge</span>
                  </a>
                </li>
                <li>
                  <Link to="/admin/login" className="text-sand-300 hover:text-white text-xs transition-colors">
                    Staff Administration Portal
                  </Link>
                </li>
              </ul>
            </div>

            {/* Bhopal Retail Branches */}
            <div>
              <h4 className="text-brass font-serif uppercase tracking-widest text-xs font-bold mb-4 pb-2 border-b border-navy-800">
                4 Bhopal Branches
              </h4>
              <div className="space-y-3 text-xs">
                {branches.slice(0, 3).map((branch, idx) => (
                  <div key={idx} className="border-b border-navy-800 pb-2">
                    <p className="text-cream-50 font-serif font-medium">{branch.name}</p>
                    <p className="text-sand-300 text-[11px] truncate">{branch.address}</p>
                    <p className="text-brass font-mono text-[10px]">{branch.phone}</p>
                  </div>
                ))}
                <Link
                  to="/contact"
                  className="text-xs font-serif italic text-brass hover:text-cream-50 flex items-center gap-1 pt-1"
                >
                  <span>View all branch addresses & maps</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-16 pt-8 border-t border-navy-800 flex flex-col sm:flex-row items-center justify-between text-xs text-sand-300 gap-4">
            <p className="font-sans">
              © {new Date().getFullYear()} Indraprasth Uniforms Bhopal. All rights reserved. Master Tailors Since 1975.
            </p>
            <div className="flex items-center gap-6 font-serif italic text-brass">
              <span>Bespoke Quality Guarantee</span>
              <span>•</span>
              <span>Certified School Norms</span>
              <span>•</span>
              <span>Local Delivery & Pickup</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};
