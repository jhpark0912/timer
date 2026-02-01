import { useState, useCallback, useRef, useEffect } from 'react';

interface ToastItem {
  id: number;
  message: string;
}

/**
 * 토스트 알림 훅 + 컴포넌트
 *
 * Notification 권한이 거부되었을 때 인앱 대체 알림으로 사용한다.
 */
export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const showToast = useCallback((message: string) => {
    const id = nextId.current++;
    setToasts(prev => [...prev, { id, message }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, showToast, removeToast };
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onRemove: (id: number) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map(toast => (
        <ToastMessage key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function ToastMessage({ toast, onRemove }: { toast: ToastItem; onRemove: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  return (
    <div className="bg-slate-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in min-w-72">
      <span className="text-lg">🔔</span>
      <p className="text-sm flex-1">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-slate-400 hover:text-white text-xs"
      >
        ✕
      </button>
    </div>
  );
}
