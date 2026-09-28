import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/react';
import { CLERK_PUBLISHABLE_KEY } from './services/clerk';
import { initPWAAutoUpdate } from './services/pwa';
import './index.css';
import App from './App';

// Start automatic PWA updates
initPWAAutoUpdate();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <App />
    </ClerkProvider>
  </StrictMode>
);
