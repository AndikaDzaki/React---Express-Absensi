import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { registerSW } from 'virtual:pwa-register';

registerSW({
  onOfflineReady() {
    console.log(' PWA siap digunakan offline!');
  },
  onNeedRefresh() {
    console.log(' Update tersedia!');
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
