import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '@ui/styles/theme.css';

// Entry point for the single-page app; keeps React root setup minimal so we can plug in more features later.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
