import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from '../cart/CartDrawer';
import { MessageCircle } from 'lucide-react';
import { usePublicSettings } from '../../api';

export const PublicLayout: React.FC = () => {
  const { pathname } = useLocation();
  const { data: settings } = usePublicSettings();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const whatsappNum = settings?.whatsappNumber || '919826025211';

  return (
    <div className="min-h-screen flex flex-col bg-cream-100 text-ink font-sans selection:bg-blue-100 selection:text-navy-900">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />

      {/* Floating WhatsApp Action Button */}
      <a
        href={`https://wa.me/${whatsappNum}?text=${encodeURIComponent(
          'Hello Indraprasth Uniforms, I need assistance with school/college uniforms.'
        )}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Indraprasth Uniforms on WhatsApp"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-4 py-3 rounded-full shadow-xl shadow-emerald-950/20 btn-tactile hover:scale-105 active:scale-95 group focus:outline-none focus:ring-4 focus:ring-emerald-400/40"
      >
        <MessageCircle className="w-5 h-5 fill-current" />
        <span className="text-xs font-serif font-bold tracking-tight hidden sm:inline-block">
          Order on WhatsApp
        </span>
      </a>
    </div>
  );
};
