interface Props {
  permission: string;
  onRequestPermission: () => void;
}

/**
 * 알림 권한 요청 배너
 *
 * Notification 권한이 'default'(미결정)일 때 표시하여 사용자에게 권한 요청을 안내한다.
 * 'denied'(거부)일 때는 인앱 알림 안내를 표시한다.
 */
export default function NotificationBanner({ permission, onRequestPermission }: Props) {
  if (permission === 'granted') return null;

  if (permission === 'denied') {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center gap-3">
        <span className="text-amber-500 text-lg">⚠️</span>
        <p className="text-sm text-amber-700 flex-1">
          시스템 알림이 차단되었습니다. 브라우저 설정에서 알림을 허용하거나, 인앱 알림을 사용합니다.
        </p>
      </div>
    );
  }

  // permission === 'default'
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center gap-3">
      <span className="text-blue-500 text-lg">🔔</span>
      <p className="text-sm text-blue-700 flex-1">
        타이머 완료 알림을 받으려면 알림 권한을 허용해주세요.
      </p>
      <button
        onClick={onRequestPermission}
        className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-700 whitespace-nowrap"
      >
        알림 허용
      </button>
    </div>
  );
}
