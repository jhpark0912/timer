import { useState, useEffect, useCallback, useRef } from 'react';

type PermissionState = 'default' | 'granted' | 'denied';

/**
 * 브라우저 Notification API 및 Service Worker 관리 훅
 *
 * - 시스템 알림 권한 요청/상태 관리
 * - Service Worker 등록
 * - 알림 발행 (SW 경유 또는 직접)
 */
export function useNotification() {
  const [permission, setPermission] = useState<PermissionState>(
    typeof Notification !== 'undefined' ? (Notification.permission as PermissionState) : 'denied'
  );
  const swRegistrationRef = useRef<ServiceWorkerRegistration | null>(null);

  // Service Worker 등록
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then(reg => {
          swRegistrationRef.current = reg;
        })
        .catch(() => {
          // SW 등록 실패 (개발 환경에서는 정상)
        });
    }
  }, []);

  /** 알림 권한 요청 */
  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return;
    const result = await Notification.requestPermission();
    setPermission(result as PermissionState);
  }, []);

  /**
   * 시스템 알림 발행
   * Service Worker가 등록되어 있으면 SW 경유, 아니면 직접 생성
   */
  const showNotification = useCallback((title: string, body: string) => {
    if (permission !== 'granted') return;

    const sw = swRegistrationRef.current;
    if (sw?.active) {
      // Service Worker 경유 (백그라운드 탭에서도 동작)
      sw.active.postMessage({
        type: 'SHOW_NOTIFICATION',
        title,
        body,
        tag: 'timer-completed',
      });
    } else {
      // 직접 알림 생성 (SW 미등록 시 대체)
      new Notification(title, {
        body,
        tag: 'timer-completed',
        requireInteraction: true,
      });
    }
  }, [permission]);

  return { permission, requestPermission, showNotification };
}
