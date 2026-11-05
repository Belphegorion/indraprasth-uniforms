import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { routes } from './routes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 60 * 1000,
    },
  },
});

const router = createBrowserRouter(routes);

export const App: React.FC = () => {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#0E2747',
              color: '#FBF8F2',
              fontSize: '13px',
              fontWeight: 500,
              borderRadius: '10px',
              border: '1px solid #14407A',
              padding: '12px 18px',
              boxShadow: '0 8px 24px rgba(10, 31, 58, 0.24)',
            },
            success: {
              iconTheme: {
                primary: '#2F7D5B',
                secondary: '#FFFFFF',
              },
            },
            error: {
              iconTheme: {
                primary: '#C8233F',
                secondary: '#FFFFFF',
              },
            },
          }}
        />
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
