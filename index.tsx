
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const mountApp = () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) return;
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

// Start the app immediately
mountApp();

// Register Service Worker in the background
// Updated to handle origin/scope issues in various hosting environments
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Using a simple relative path 'sw.js' instead of './sw.js' and removing explicit scope.
    // Explicitly setting scope: '/' often triggers a SecurityError in environments where the app
    // is served from a subdirectory or via a proxy (like many dev-preview tools).
    navigator.serviceWorker.register('sw.js')
      .then(registration => {
        console.log('Elysium: Engine Online (Scope: ' + registration.scope + ')');
      })
      .catch(err => {
        // Service workers are often restricted in specific preview origins.
        // We log this as a warning to notify the developer without breaking the app experience.
        console.warn('Elysium: Engine Offline - Service Worker registration is restricted in this environment. This is expected in some sandboxes and won\'t affect app performance.', err.message);
      });
  });
}
