import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Capture and gracefully suppress any MetaMask/Web3 iframe-related injection errors
if (typeof window !== 'undefined') {
  const isWeb3OrMetaMaskError = (errorMsg: string) => {
    const msg = errorMsg.toLowerCase();
    return msg.includes('metamask') || msg.includes('ethereum') || msg.includes('web3') || msg.includes('wallet');
  };

  window.addEventListener('error', (event) => {
    const errorMsg = event.message || (event.error && event.error.message) || '';
    if (isWeb3OrMetaMaskError(errorMsg)) {
      console.warn('[Web3 Sandbox Guard] Suppressed MetaMask/Web3 error in iframe:', errorMsg);
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);

  window.addEventListener('unhandledrejection', (event) => {
    const errorMsg = (event.reason && (event.reason.message || event.reason.toString())) || '';
    if (isWeb3OrMetaMaskError(errorMsg)) {
      console.warn('[Web3 Sandbox Guard] Suppressed unhandled MetaMask/Web3 promise rejection in iframe:', errorMsg);
      event.preventDefault();
      event.stopPropagation();
    }
  }, true);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

