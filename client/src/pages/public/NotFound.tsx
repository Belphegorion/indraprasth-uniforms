import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center space-y-6">
      <Helmet>
        <title>Page Not Found | Indraprasth Uniforms Bhopal</title>
      </Helmet>

      <div className="w-20 h-20 rounded-2xl bg-sand-200 border border-sand-300 text-navy-800 font-serif font-black text-3xl flex items-center justify-center mx-auto shadow-sm">
        404
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-serif font-bold text-navy-800">Docket Not Found</h1>
        <p className="text-xs sm:text-sm text-slate font-sans">
          The uniform catalog page or link you requested cannot be located.
        </p>
      </div>

      <div className="flex justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-navy-800 text-cream-50 font-medium text-xs sm:text-sm hover:bg-navy-700 transition-colors shadow-sm btn-tactile"
        >
          <Home className="w-4 h-4 text-cream-50" />
          <span>Home</span>
        </Link>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-cream-50 border border-sand-300 text-navy-800 font-medium text-xs sm:text-sm hover:bg-sand-200 transition-colors shadow-sm btn-tactile"
        >
          <ArrowLeft className="w-4 h-4 text-slate" />
          <span>Uniform Catalog</span>
        </Link>
      </div>
    </div>
  );
};
