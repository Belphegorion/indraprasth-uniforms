import React, { Suspense } from 'react';
import { RouteObject, Navigate } from 'react-router-dom';
import { PublicLayout } from './components/layout/PublicLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { Skeleton } from './components/ui/Skeleton';
import { lazyWithRetry } from './utils/lazyWithRetry';
import { RouteErrorBoundary } from './components/common/RouteErrorBoundary';

// Public storefront entry pages
import { Home } from './pages/public/Home';
import { Shop } from './pages/public/Shop';

// Code-split subpages with automatic reload recovery on stale deployment chunks
const ProductDetail = lazyWithRetry(() => import('./pages/public/ProductDetail').then((m) => ({ default: m.ProductDetail })), 'ProductDetail');
const SchoolPage = lazyWithRetry(() => import('./pages/public/SchoolPage').then((m) => ({ default: m.SchoolPage })), 'SchoolPage');
const Cart = lazyWithRetry(() => import('./pages/public/Cart').then((m) => ({ default: m.Cart })), 'Cart');
const Checkout = lazyWithRetry(() => import('./pages/public/Checkout').then((m) => ({ default: m.Checkout })), 'Checkout');
const OrderSuccess = lazyWithRetry(() => import('./pages/public/OrderSuccess').then((m) => ({ default: m.OrderSuccess })), 'OrderSuccess');
const TrackOrder = lazyWithRetry(() => import('./pages/public/TrackOrder').then((m) => ({ default: m.TrackOrder })), 'TrackOrder');
const About = lazyWithRetry(() => import('./pages/public/About').then((m) => ({ default: m.About })), 'About');
const Contact = lazyWithRetry(() => import('./pages/public/Contact').then((m) => ({ default: m.Contact })), 'Contact');
const BulkInquiry = lazyWithRetry(() => import('./pages/public/BulkInquiry').then((m) => ({ default: m.BulkInquiry })), 'BulkInquiry');
const NotFound = lazyWithRetry(() => import('./pages/public/NotFound').then((m) => ({ default: m.NotFound })), 'NotFound');

// Code-splitting Admin routes with automatic reload recovery on stale deployment chunks
const Login = lazyWithRetry(() => import('./pages/admin/Login').then((m) => ({ default: m.Login })), 'Login');
const Dashboard = lazyWithRetry(
  () => import('./pages/admin/Dashboard').then((m) => ({ default: m.Dashboard })),
  'Dashboard'
);
const Products = lazyWithRetry(
  () => import('./pages/admin/Products').then((m) => ({ default: m.Products })),
  'Products'
);
const ProductForm = lazyWithRetry(
  () => import('./pages/admin/ProductForm').then((m) => ({ default: m.ProductForm })),
  'ProductForm'
);
const Schools = lazyWithRetry(
  () => import('./pages/admin/Schools').then((m) => ({ default: m.Schools })),
  'Schools'
);
const Categories = lazyWithRetry(
  () => import('./pages/admin/Categories').then((m) => ({ default: m.Categories })),
  'Categories'
);
const Orders = lazyWithRetry(
  () => import('./pages/admin/Orders').then((m) => ({ default: m.Orders })),
  'Orders'
);
const OrderDetail = lazyWithRetry(
  () => import('./pages/admin/OrderDetail').then((m) => ({ default: m.OrderDetail })),
  'OrderDetail'
);
const Inquiries = lazyWithRetry(
  () => import('./pages/admin/Inquiries').then((m) => ({ default: m.Inquiries })),
  'Inquiries'
);
const Settings = lazyWithRetry(
  () => import('./pages/admin/Settings').then((m) => ({ default: m.Settings })),
  'Settings'
);
const Staff = lazyWithRetry(
  () => import('./pages/admin/Staff').then((m) => ({ default: m.Staff })),
  'Staff'
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
    errorElement: <RouteErrorBoundary />,
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
    errorElement: <RouteErrorBoundary />,
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
    errorElement: <RouteErrorBoundary />,
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
