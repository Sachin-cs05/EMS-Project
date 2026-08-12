// ── main.jsx ──────────────────────────────────────────────────────────────────
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './app/store';
import App from './App';
import './index.css';

// Apply dark mode on initial load
const dark = localStorage.getItem('ems_dark') === 'true';
if (dark) document.documentElement.classList.add('dark');

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
