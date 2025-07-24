// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', () => {
//     navigator.serviceWorker
//       .register('/dev-sw.js?dev-sw', {
//         scope: '/',
//         type: 'classic', 
//       })
//       .then((registration) => {
//         console.log('[SW] Service Worker registered');
//         console.log('[SW] Scope:', registration.scope);
//       })
//       .catch((error) => {
//         console.error('[SW] Registration failed:', error);
//       });
//   });
// } else {
//   console.warn('[SW] Service Worker is not supported in this browser.');
// }
