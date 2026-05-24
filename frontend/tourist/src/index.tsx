import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

const reportWebVitals = async () => {
  try {
    const { getCLS, getFCP, getFID, getLCP, getTTFB } = await import('web-vitals');
    getCLS(console.log);
    getFCP(console.log);
    getFID(console.log);
    getLCP(console.log);
    getTTFB(console.log);
  } catch (e) {
    // web-vitals logging is non-critical
  }
};

reportWebVitals();
