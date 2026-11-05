import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  Phone,
  MessageCircle,
  Truck,
  ChevronDown,
} from 'lucide-react';
import { useCartStore } from '../../store/cart';
import { usePublicSettings, useSchools } from '../../api';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { data: settings } = usePublicSettings();
  const { data: schools } = useSchools();
  const { getTotalItems, openDrawer } = useCartStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [schoolsDropdownOpen, setSchoolsDropdownOpen] = useState(false);

  const totalCartCount = getTotalItems();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-cream-50/95 backdrop-blur-md border-b border-sand-300 transition-colors">
      {/* Announcement Bar */}
      {settings?.announcementBar?.enabled && settings.announcementBar.text && (
        <div className="bg-navy-800 text-cream-50 text-xs font-serif italic py-2 px-4 text-center tracking-wide border-b border-brass/30">
          <Link
            to={settings.announcementBar.link || '/shop'}
            className="hover:text-brass transition-colors inline-flex items-center gap-1.5 justify-center"
          >
            <span>{settings.announcementBar.text}</span>
          </Link>
        </div>
      )}

      {/* Top micro bar for phone / branches */}
      <div className="hidden lg:flex justify-between items-center px-6 py-2 bg-navy-900 text-sand-200 text-xs border-b border-navy-800">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5 font-medium text-cream-50">
            <Phone className="w-3.5 h-3.5 text-brass" />
            {settings?.phones?.[0] || '+91 98260 25211'} <span className="text-sand-300 font-normal">(Jawahar Chowk HQ)</span>
          </span>
          <span className="text-navy-700">|</span>
          <span className="flex items-center gap-1.5 font-normal text-sand-200">
            <Truck className="w-3.5 h-3.5 text-brass" />
            Bhopal Local Delivery & Store Pickup Across 4 Branches
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/track-order" className="text-sand-200 hover:text-white transition-colors">
            Track Order
          </Link>
          <span className="text-navy-700">|</span>
          <Link to="/bulk-inquiry" className="text-sand-200 hover:text-white transition-colors">
            Institutional & Bulk Inquiry
          </Link>
          <span className="text-navy-700">|</span>
          <a
            href={`https://wa.me/${settings?.whatsappNumber || '919826025211'}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-brass hover:text-cream-50 font-medium transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
            WhatsApp Orders
          </a>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center shrink-0 group py-1" aria-label="Indraprasth Uniforms Home">
            <img
              src="/logo.png"
              alt="Indraprasth Uniforms - The Uniform Icons Since 1975"
              className="h-12 sm:h-14 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.02]"
              width="240"
              height="120"
            />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-navy-800">
            <Link to="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <Link to="/shop" className="hover:text-blue-600 transition-colors">
              All Uniforms
            </Link>

            {/* School Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setSchoolsDropdownOpen(!schoolsDropdownOpen)}
                onBlur={() => setTimeout(() => setSchoolsDropdownOpen(false), 200)}
                className="flex items-center gap-1 hover:text-blue-600 transition-colors py-2 text-navy-800 font-medium"
              >
                <span>Partner Schools</span>
                <ChevronDown className="w-4 h-4 opacity-60" />
              </button>

              {schoolsDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-72 bg-cream-50 rounded-[10px] shadow-2xl border border-sand-300 py-2.5 z-50">
                  <div className="px-4 py-1.5 text-[11px] font-serif uppercase tracking-widest text-brass-text font-bold border-b border-sand-300">
                    Select Institution
                  </div>
                  <div className="py-1">
                    {schools?.map((school) => (
                      <Link
                        key={school._id || school.code}
                        to={`/school/${school.slug}`}
                        className="flex items-center justify-between px-4 py-2.5 text-sm text-ink hover:bg-sand-200 hover:text-navy-900 transition-colors"
                        onClick={() => setSchoolsDropdownOpen(false)}
                      >
                        <span className="font-serif font-medium">{school.name}</span>
                        <span className="text-[11px] font-mono font-semibold bg-blue-100 px-2 py-0.5 rounded text-navy-800">
                          {school.code}
                        </span>
                      </Link>
                    ))}
                  </div>
                  <div className="border-t border-sand-300 mt-1 pt-1.5 px-4">
                    <Link
                      to="/shop"
                      className="text-xs font-serif italic text-brass-text font-semibold hover:text-blue-600 transition-colors block py-1"
                      onClick={() => setSchoolsDropdownOpen(false)}
                    >
                      View complete school directory →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link to="/about" className="hover:text-blue-600 transition-colors">
              Heritage
            </Link>
            <Link to="/contact" className="hover:text-blue-600 transition-colors">
              Branches & Contact
            </Link>
          </nav>

          {/* Search bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden sm:flex relative items-center max-w-xs w-full"
          >
            <input
              type="text"
              placeholder="Search blazers, shirts, ties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs sm:text-sm pl-9 pr-4 py-2 rounded-full border border-sand-300 bg-cream-100 text-ink placeholder:text-taupe-500 focus:bg-cream-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-all"
            />
            <Search className="w-4 h-4 text-taupe-500 absolute left-3 pointer-events-none" />
          </form>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {/* Cart Trigger */}
            <button
              onClick={openDrawer}
              className="relative p-2.5 rounded-[10px] bg-navy-800 hover:bg-navy-700 active:bg-navy-900 text-cream-50 transition-all btn-tactile flex items-center justify-center border border-navy-700 shadow-sm focus-visible:ring-2 focus-visible:ring-blue-600"
              aria-label={`Cart with ${totalCartCount} items`}
            >
              <ShoppingBag className="w-5 h-5 text-cream-50" />
              {totalCartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-crimson-600 text-white text-[11px] font-mono font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-[10px] text-navy-800 hover:bg-sand-200 transition-colors btn-tactile focus-visible:ring-2 focus-visible:ring-blue-600"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-sand-300 bg-cream-50 px-4 pt-4 pb-6 space-y-4">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              placeholder="Search uniforms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-sm pl-9 pr-4 py-2.5 rounded-[10px] border border-sand-300 bg-cream-100 text-ink placeholder:text-taupe-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <Search className="w-4 h-4 text-taupe-500 absolute left-3 top-3.5" />
          </form>

          <nav className="flex flex-col space-y-1 text-base font-medium text-ink">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-[8px] hover:bg-sand-200 font-serif font-medium text-navy-800"
            >
              Home
            </Link>
            <Link
              to="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-[8px] hover:bg-sand-200"
            >
              Shop Uniforms
            </Link>
            <div className="px-3 py-2 bg-sand-200/50 rounded-[10px] border border-sand-300 my-1">
              <span className="text-[11px] font-serif uppercase tracking-widest text-brass-text font-bold block mb-2">
                Partner Institutions
              </span>
              <div className="grid grid-cols-2 gap-2">
                {schools?.map((s) => (
                  <Link
                    key={s.code}
                    to={`/school/${s.slug}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs font-serif font-medium text-ink bg-cream-50 hover:bg-sand-200 p-2 rounded-[8px] border border-sand-300 flex items-center justify-between"
                  >
                    <span className="truncate mr-1">{s.name}</span>
                    <span className="font-mono text-[10px] font-bold text-navy-800 bg-blue-100 px-1 rounded">{s.code}</span>
                  </Link>
                ))}
              </div>
            </div>
            <Link
              to="/bulk-inquiry"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-[8px] hover:bg-sand-200 text-brass-text font-serif font-semibold"
            >
              Bulk & Institutional Inquiries
            </Link>
            <Link
              to="/track-order"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-[8px] hover:bg-sand-200"
            >
              Track Order
            </Link>
            <Link
              to="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-[8px] hover:bg-sand-200"
            >
              Heritage & Craft Since 1975
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-[8px] hover:bg-sand-200"
            >
              Bhopal Branches & Hours
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
