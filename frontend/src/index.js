// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext'; // Make sure this import is correct

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* This AuthProvider tag is the crucial part. It must wrap your App. */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);