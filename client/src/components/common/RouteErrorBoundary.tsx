import React from 'react';
import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import { RefreshCw, Home, AlertTriangle } from 'lucide-react';

export const RouteErrorBoundary: React.FC = () => {
  const error = useRouteError();
  const errorMessage =
    isRouteErrorResponse(error)
      ? `${error.status} ${error.statusText}`
      : error instanceof Error
      ? error.message
      : 'An unexpected application error occurred.';

  const isChunkError =
    errorMessage.includes('Failed to fetch dynamically imported module') ||
    errorMessage.includes('Importing a module script failed') ||
    errorMessage.includes('error loading dynamically imported module');

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6 bg-cream-50">
      <div className="max-w-md w-full bg-cream-100 border border-sand-300 rounded-[12px] p-6 sm:p-8 shadow-plinth text-center space-y-5">
        <div className="mx-auto w-14 h-14 rounded-full bg-navy-800 text-cream-50 flex items-center justify-center shadow-sm">
          {isChunkError ? (
            <RefreshCw className="w-7 h-7 text-brass animate-spin-slow" />
          ) : (
            <AlertTriangle className="w-7 h-7 text-crimson-600" />
          )}
        </div>

        <div className="space-y-2">
          <h2 className="font-serif font-bold text-xl sm:text-2xl text-navy-800">
            {isChunkError ? 'Application Updated' : 'Something went wrong'}
          </h2>
          <p className="text-xs sm:text-sm text-slate leading-relaxed">
            {isChunkError
              ? 'A newer version of Indraprasth Uniforms has been deployed. Please refresh to load the latest catalog, products, and admin tools.'
              : 'We encountered an unexpected error while loading this page. Please try refreshing or return to the home page.'}
          </p>
        </div>

        {!isChunkError && (
          <div className="text-[11px] font-mono bg-cream-50 border border-sand-300 rounded p-2.5 text-slate/80 text-left overflow-x-auto max-h-24">
            {errorMessage}
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleReload}
            className="w-full sm:w-auto px-5 py-2.5 rounded-[8px] bg-navy-800 hover:bg-navy-700 active:bg-navy-900 text-cream-50 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm min-h-[44px]"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{isChunkError ? 'Refresh Application' : 'Try Again'}</span>
          </button>
          <Link
            to="/"
            className="w-full sm:w-auto px-5 py-2.5 rounded-[8px] bg-cream-50 hover:bg-sand-200 text-navy-800 border border-sand-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all min-h-[44px]"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
