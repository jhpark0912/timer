import { useState, useEffect } from 'react';
import type { Task, ActivityLogCreateRequest } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ActivityLogCreateRequest) => Promise<void>;
  tasks: Task[];
  date: string;
  initialStartTime?: string;
}

export default function ManualLogModal({
  isOpen, onClose, onSubmit,
  tasks, date, initialStartTime,
}: Props) {
  const [selectedTaskId, setSelectedTaskId] = useState<number | ''>('');
  const [startedAt, setStartedAt] = useState('');
  const [endedAt, setEndedAt] = useState('');
  const [memo, setMemo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStartedAt(initialStartTime || '');
      setEndedAt('');
      setMemo('');
      setSelectedTaskId('');
      setError(null);
    }
  }, [isOpen, initialStartTime]);

  if (!isOpen) return null;

  const activeTasks = tasks.filter(t => t.isActive);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskId || !startedAt || !endedAt) return;

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        taskId: selectedTaskId as number,
        startedAt: `${date}T${startedAt}:00`,
        endedAt: `${date}T${endedAt}:00`,
        memo: memo.trim() || undefined,
      });
      onClose();
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setError(axiosErr.response?.data?.message ?? '생성 실패');
      } else {
        setError('생성 실패');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg border border-slate-200 p-5 w-full max-w-md shadow-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">수동 기록 추가</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg">&times;</button>
        </div>

        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-slate-500 mb-1 block">항목 *</label>
            <select
              value={selectedTaskId}
              onChange={e => setSelectedTaskId(Number(e.target.value))}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">항목 선택</option>
              {activeTasks.map(task => (
                <option key={task.id} value={task.id}>{task.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-xs text-slate-500 mb-1 block">시작 *</label>
              <input
                type="time"
                value={startedAt}
                onChange={e => setStartedAt(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <span className="text-slate-400 mt-5">~</span>
            <div className="flex-1">
              <label className="text-xs text-slate-500 mb-1 block">종료 *</label>
              <input
                type="time"
                value={endedAt}
                onChange={e => setEndedAt(e.target.value)}
                className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-500 mb-1 block">메모</label>
            <input
              type="text"
              placeholder="메모 입력 (선택)"
              value={memo}
              onChange={e => setMemo(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800">
              취소
            </button>
            <button
              type="submit"
              disabled={submitting || !selectedTaskId || !startedAt || !endedAt}
              className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
