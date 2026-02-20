// Custom service worker additions for ShiftMaster notifications
// This file is loaded alongside the Workbox-generated SW

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const url = event.notification.data?.url || '/roster';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Focus existing window if open
            for (const client of windowClients) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    client.focus();
                    client.navigate(url);
                    return;
                }
            }
            // Otherwise open new window
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});

self.addEventListener('notificationclose', (event) => {
    // Optional: track notification dismissals
    console.log('[SW] Notification closed:', event.notification.tag);
});
