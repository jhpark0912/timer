import { useState } from 'react';
import type { TimerSession } from '../types';

interface Props {
  session: TimerSession | null;
  displayRemaining: number;
  onPause: () => Promise<void>;
  onResume: () => Promise<void>;
  onStop: (completed?: boolean) => Promise<unknown>;
}

function formatTime(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function TimerDisplay({ session, displayRemaining, onPause, onResume, onStop }: Props) {
  const [busy, setBusy] = useState(false);

  if (!session) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-6 text-center">
        <p className="text-slate-400 text-sm">활성 타이머 없음</p>
        <p className="text-slate-400 text-xs mt-1">항목에서 타이머를 시작하세요</p>
      </div>
    );
  }

  const isRunning = session.status === 'RUNNING';
  const isPaused = session.status === 'PAUSED';
  const progress = session.duration > 0
    ? Math.max(0, Math.min(100, ((session.duration - displayRemaining) / session.duration) * 100))
    : 0;

  const handleAction = async (action: () => Promise<unknown>) => {
    setBusy(true);
    try { await action(); } finally { setBusy(false); }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="text-center">
        <p className="text-sm text-slate-500 mb-1">{session.taskName}</p>
        <p className="text-5xl font-mono font-bold text-slate-800 my-4">
          {formatTime(displayRemaining)}
        </p>
        <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-center gap-3">
          {isRunning && (
            <button
              onClick={() => handleAction(onPause)}
              disabled={busy}
              className="bg-yellow-500 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-yellow-600 disabled:opacity-50"
            >
              일시정지
            </button>
          )}
          {isPaused && (
            <button
              onClick={() => handleAction(onResume)}
              disabled={busy}
              className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              재개
            </button>
          )}
          <button
            onClick={() => handleAction(() => onStop(true))}
            disabled={busy}
            className="bg-red-500 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-red-600 disabled:opacity-50"
          >
            종료
          </button>
        </div>
      </div>
    </div>
  );
}
