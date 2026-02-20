import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const initTheme = () => {
  const saved = localStorage.getItem('evp-theme');
  if (saved === 'nature') {
    document.documentElement.classList.add('nature');
  } else if (saved !== 'light') {
    document.documentElement.classList.add('dark');
  }
};
initTheme();

// Global error handler for catching runtime errors during initialization
window.onerror = function(message, source, lineno, colno, error) {
  const errorDiv = document.createElement('div');
  errorDiv.style.position = 'fixed';
  errorDiv.style.top = '0';
  errorDiv.style.left = '0';
  errorDiv.style.width = '100%';
  errorDiv.style.height = '100%';
  errorDiv.style.backgroundColor = 'white';
  errorDiv.style.color = 'red';
  errorDiv.style.padding = '20px';
  errorDiv.style.zIndex = '9999';
  errorDiv.style.overflow = 'auto';
  errorDiv.innerHTML = `
    <h1>Runtime Error</h1>
    <p><strong>Message:</strong> ${message}</p>
    <p><strong>Source:</strong> ${source}</p>
    <p><strong>Line:</strong> ${lineno}</p>
    <p><strong>Column:</strong> ${colno}</p>
    <pre>${error?.stack || ''}</pre>
  `;
  document.body.appendChild(errorDiv);
  return false;
};

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
} else {
  console.error("Root element not found");
}
