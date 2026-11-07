import React, { Suspense, lazy } from 'react';
import { RouteObject, Navigate } from 'react-router-dom';
import { PublicLayout } from './components/layout/PublicLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { Skeleton } from './components/ui/Skeleton';

// Public storefront entry pages
import { Home } from './pages/public/Home';
import { Shop } from './pages/public/Shop';

// Code-split subpages for lightweight storefront initial load
const ProductDetail = lazy(() => import('./pages/public/ProductDetail').then((m) => ({ default: m.ProductDetail })));
const SchoolPage = lazy(() => import('./pages/public/SchoolPage').then((m) => ({ default: m.SchoolPage })));
const Cart = lazy(() => import('./pages/public/Cart').then((m) => ({ default: m.Cart })));
const Checkout = lazy(() => import('./pages/public/Checkout').then((m) => ({ default: m.Checkout })));
const OrderSuccess = lazy(() => import('./pages/public/OrderSuccess').then((m) => ({ default: m.OrderSuccess })));
const TrackOrder = lazy(() => import('./pages/public/TrackOrder').then((m) => ({ default: m.TrackOrder })));
const About = lazy(() => import('./pages/public/About').then((m) => ({ default: m.About })));
const Contact = lazy(() => import('./pages/public/Contact').then((m) => ({ default: m.Contact })));
const BulkInquiry = lazy(() => import('./pages/public/BulkInquiry').then((m) => ({ default: m.BulkInquiry })));
const NotFound = lazy(() => import('./pages/public/NotFound').then((m) => ({ default: m.NotFound })));

// Code-splitting Admin routes for optimal storefront performance
const Login = lazy(() => import('./pages/admin/Login').then((m) => ({ default: m.Login })));
const Dashboard = lazy(() =>
  import('./pages/admin/Dashboard').then((m) => ({ default: m.Dashboard }))
);
const Products = lazy(() =>
  import('./pages/admin/Products').then((m) => ({ default: m.Products }))
);
const ProductForm = lazy(() =>
  import('./pages/admin/ProductForm').then((m) => ({ default: m.ProductForm }))
);
const Schools = lazy(() =>
  import('./pages/admin/Schools').then((m) => ({ default: m.Schools }))
);
const Categories = lazy(() =>
  import('./pages/admin/Categories').then((m) => ({ default: m.Categories }))
);
const Orders = lazy(() =>
  import('./pages/admin/Orders').then((m) => ({ default: m.Orders }))
);
const OrderDetail = lazy(() =>
  import('./pages/admin/OrderDetail').then((m) => ({ default: m.OrderDetail }))
);
const Inquiries = lazy(() =>
  import('./pages/admin/Inquiries').then((m) => ({ default: m.Inquiries }))
);
const Settings = lazy(() =>
  import('./pages/admin/Settings').then((m) => ({ default: m.Settings }))
);
const Staff = lazy(() =>
  import('./pages/admin/Staff').then((m) => ({ default: m.Staff }))
);

const PageSuspense: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense
    fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    }
  >
    {children}
  </Suspense>
);

const AdminSuspense: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Suspense
    fallback={
      <div className="p-8 max-w-7xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    }
  >
    {children}
  </Suspense>
);

export const routes: RouteObject[] = [
  // Public Storefront Routes
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'shop', element: <Shop /> },
      { path: 'products/:slug', element: <PageSuspense><ProductDetail /></PageSuspense> },
      { path: 'product/:slug', element: <PageSuspense><ProductDetail /></PageSuspense> }, // alias support
      { path: 'schools/:slug', element: <PageSuspense><SchoolPage /></PageSuspense> },
      { path: 'school/:slug', element: <PageSuspense><SchoolPage /></PageSuspense> }, // alias support
      { path: 'cart', element: <PageSuspense><Cart /></PageSuspense> },
      { path: 'checkout', element: <PageSuspense><Checkout /></PageSuspense> },
      { path: 'order-success', element: <PageSuspense><OrderSuccess /></PageSuspense> },
      { path: 'order-success/:orderNumber', element: <PageSuspense><OrderSuccess /></PageSuspense> },
      { path: 'track-order', element: <PageSuspense><TrackOrder /></PageSuspense> },
      { path: 'about', element: <PageSuspense><About /></PageSuspense> },
      { path: 'contact', element: <PageSuspense><Contact /></PageSuspense> },
      { path: 'bulk-inquiry', element: <PageSuspense><BulkInquiry /></PageSuspense> },
      { path: '*', element: <PageSuspense><NotFound /></PageSuspense> },
    ],
  },

  // Admin Auth Route (Standalone full page)
  {
    path: '/admin/login',
    element: (
      <AdminSuspense>
        <Login />
      </AdminSuspense>
    ),
  },

  // Admin Portal Routes (Protected via AdminLayout)
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      {
        path: 'dashboard',
        element: (
          <AdminSuspense>
            <Dashboard />
          </AdminSuspense>
        ),
      },
      {
        path: 'products',
        element: (
          <AdminSuspense>
            <Products />
          </AdminSuspense>
        ),
      },
      {
        path: 'products/new',
        element: (
          <AdminSuspense>
            <ProductForm />
          </AdminSuspense>
        ),
      },
      {
        path: 'products/:id',
        element: (
          <AdminSuspense>
            <ProductForm />
          </AdminSuspense>
        ),
      },
      {
        path: 'schools',
        element: (
          <AdminSuspense>
            <Schools />
          </AdminSuspense>
        ),
      },
      {
        path: 'categories',
        element: (
          <AdminSuspense>
            <Categories />
          </AdminSuspense>
        ),
      },
      {
        path: 'orders',
        element: (
          <AdminSuspense>
            <Orders />
          </AdminSuspense>
        ),
      },
      {
        path: 'orders/:id',
        element: (
          <AdminSuspense>
            <OrderDetail />
          </AdminSuspense>
        ),
      },
      {
        path: 'inquiries',
        element: (
          <AdminSuspense>
            <Inquiries />
          </AdminSuspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <AdminSuspense>
            <Settings />
          </AdminSuspense>
        ),
      },
      {
        path: 'staff',
        element: (
          <AdminSuspense>
            <Staff />
          </AdminSuspense>
        ),
      },
    ],
  },
];
