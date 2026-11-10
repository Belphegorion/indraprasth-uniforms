import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
// Listen for Vite preload errors triggered when a deployment replaces chunk hashes
window.addEventListener('vite:preloadError', (event) => {
  console.warn('[Vite] Preload error detected; reloading application to fetch latest build:', event);
  const key = 'indraprasth_vite_preload_reload';
  const lastReload = sessionStorage.getItem(key);
  const now = Date.now();
  // Prevent infinite loop if network or server is completely down
  if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
    sessionStorage.setItem(key, now.toString());
    window.location.reload();
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
