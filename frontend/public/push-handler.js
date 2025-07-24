self.addEventListener('push', (event) => {
  console.log('[SW] Push event received');

  let data = {};
  try {
    data = event.data?.json(); 
  } catch (e) {
    console.warn('[SW] Push data is not valid JSON. Fallback ke text.');
    data = {
      title: 'Notifikasi',
      body: event.data?.text() || 'Tidak ada isi',
      url: '/',
    };
  }

  const title = data.title || 'Notifikasi';
  const options = {
    body: data.body || 'Isi notifikasi',
    icon: '/pwa-192x192.png',
    data: data.url || '/', 
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(() => console.log('[SW] Notifikasi berhasil ditampilkan'))
      .catch(err => console.error('[SW] Gagal tampilkan notifikasi:', err))
  );
});


self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
