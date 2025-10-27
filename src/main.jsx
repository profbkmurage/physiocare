import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css'; // <- Import Bootstrap CSS
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // optional for Bootstrap JS components
// import './index.css'; // your custom styles if any

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
