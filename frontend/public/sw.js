/**
 * Service Worker - 백그라운드 알림 발행
 *
 * 타이머 완료 시 OS 수준 시스템 알림을 표시한다.
 * 브라우저가 백그라운드에 있어도 알림이 표시되며,
 * 알림 클릭 시 해당 탭으로 포커스를 이동시킨다.
 */

// Service Worker 설치
self.addEventListener('install', () => {
  self.skipWaiting();
});

// Service Worker 활성화
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// 메인 스레드로부터 알림 요청 수신
self.addEventListener('message', (event) => {
  const { type, title, body, tag } = event.data;

  if (type === 'SHOW_NOTIFICATION') {
    self.registration.showNotification(title || '타이머 완료', {
      body: body || '설정한 시간이 완료되었습니다.',
      icon: '/timer-icon.png',
      badge: '/timer-icon.png',
      tag: tag || 'timer-completed',
      requireInteraction: true,
      vibrate: [200, 100, 200],
    });
  }
});

// 알림 클릭 시 해당 탭으로 포커스 이동
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // 이미 열린 탭이 있으면 포커스
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // 없으면 새 탭 열기
      return self.clients.openWindow('/');
    })
  );
});
