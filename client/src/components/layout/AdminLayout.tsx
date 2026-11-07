import React, { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  GraduationCap,
  FolderTree,
  ShoppingBag,
  MessageSquare,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Shield,
  Users,
} from 'lucide-react';
import { useAuthStore } from '../../store/auth';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Products', path: '/admin/products', icon: Package },
  { label: 'Schools', path: '/admin/schools', icon: GraduationCap },
  { label: 'Categories', path: '/admin/categories', icon: FolderTree },
  { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
  { label: 'Inquiries', path: '/admin/inquiries', icon: MessageSquare },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
  { label: 'Staff', path: '/admin/staff', icon: Users, ownerOnly: true },
];

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, checkAuth } = useAuthStore();
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col md:flex-row text-ink">
      {/* Mobile Top Header */}
      <div className="md:hidden bg-navy-900 text-white p-4 flex items-center justify-between z-30 border-b border-navy-800">
        <div className="flex items-center gap-2.5">
          <div className="bg-cream-50 rounded-lg p-1.5 border border-sand-300">
            <img src="/logo.png" alt="Indraprasth Uniforms" className="h-6 w-auto object-contain" width="100" height="50" />
          </div>
          <span className="font-serif font-bold text-sm tracking-tight text-cream-50">Staff Administration</span>
        </div>
        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-sand-300 hover:text-white"
          aria-label="Toggle navigation menu"
        >
          {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-navy-900 text-sand-300 border-r border-navy-800 flex flex-col justify-between p-4 transform transition-transform duration-200 md:translate-x-0 md:static ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          {/* Brand header */}
          <div className="flex items-center justify-between px-2 pt-2">
            <Link
              to="/admin/dashboard"
              className="bg-cream-50 rounded-lg p-2 border border-sand-300 block shadow-sm hover:bg-white transition-colors"
              aria-label="Admin Dashboard"
            >
              <img
                src="/logo.png"
                alt="Indraprasth Uniforms"
                className="h-9 w-auto object-contain"
                width="160"
                height="80"
              />
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {NAV_ITEMS.filter((item) => !(item as any).ownerOnly || user?.role === 'owner').map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all btn-tactile ${
                    isActive
                      ? 'bg-navy-800 text-white border-l-[3px] border-crimson-600 font-semibold shadow-sm'
                      : 'text-sand-300 hover:text-white hover:bg-navy-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-400' : 'text-sand-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="pt-4 border-t border-navy-800 space-y-3">
          <div className="flex items-center justify-between px-2 text-xs">
            <div>
              <p className="font-serif font-bold text-white truncate max-w-[130px]">{user?.name || 'Admin'}</p>
              <div className="flex items-center gap-1 text-[11px] text-brass mt-0.5 font-mono">
                <Shield className="w-3 h-3 text-brass" />
                <span className="capitalize">{user?.role || 'Staff'}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-sand-300 hover:text-crimson-400 hover:bg-navy-800 transition-colors btn-tactile"
              title="Log out"
              aria-label="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-center gap-1.5 w-full py-2 bg-navy-800 hover:bg-navy-700 text-cream-50 rounded-lg text-xs font-serif italic transition-colors border border-navy-700 btn-tactile"
          >
            <span>View Public Storefront</span>
            <ExternalLink className="w-3.5 h-3.5 text-sand-300" />
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 overflow-x-hidden min-h-[calc(100vh-60px)] md:min-h-screen bg-cream-100">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
