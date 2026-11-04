import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

// Khởi tạo Office Add-in khi Office.js đã nạp xong
if (typeof window !== 'undefined' && window.Office) {
  window.Office.onReady(() => {
    renderApp();
  });
} else {
  // Chạy độc lập trong trình duyệt thông thường
  renderApp();
}

function renderApp() {
  const rootElement = document.getElementById('root');
  if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
}
