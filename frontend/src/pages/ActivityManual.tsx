import { useState, useEffect } from 'react';
import { useActivityLogs } from '../hooks/useActivityLogs';
import { useTasks } from '../hooks/useTasks';
import type { Task } from '../types';

/** 초를 "Xh Ym" 형태로 변환 */
function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}초`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}시간 ${m}분`;
  return `${m}분`;
}

/** 오늘 날짜를 YYYY-MM-DD 형식으로 반환 */
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function ActivityManual() {
  const { logs, loading, error, fetchByDate, createLog, deleteLog } = useActivityLogs();
  const { tasks } = useTasks();

  const [date, setDate] = useState(today());
  const [selectedTaskId, setSelectedTaskId] = useState<number | ''>('');
  const [startedAt, setStartedAt] = useState('');
  const [endedAt, setEndedAt] = useState('');
  const [memo, setMemo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);

  useEffect(() => {
    fetchByDate(date);
  }, [date, fetchByDate]);

  const activeTasks: Task[] = tasks.filter(t => t.isActive);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTaskId || !startedAt || !endedAt) return;

    setSubmitting(true);
    setFormError(null);
    try {
      const result = await createLog({
        taskId: selectedTaskId as number,
        startedAt: `${date}T${startedAt}:00`,
        endedAt: `${date}T${endedAt}:00`,
        memo: memo.trim() || undefined,
      });
      // 폼 초기화
      setStartedAt('');
      setEndedAt('');
      setMemo('');
      // warning이 있으면 표시
      if (result.warning) {
        setFormError(result.warning);
      }
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setFormError(axiosErr.response?.data?.message ?? '생성 실패');
      } else {
        setFormError('생성 실패');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    setActionId(id);
    try {
      await deleteLog(id);
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-800">수동 기록 입력</h1>

      {/* 날짜 선택 */}
      <div className="flex items-center gap-3">
        <label className="text-sm text-slate-600">날짜</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="border border-slate-300 rounded px-3 py-1.5 text-sm"
        />
      </div>

      {/* 수동 입력 폼 */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
        <h3 className="font-semibold text-slate-800">새 활동 기록</h3>
        {formError && (
          <p className={`text-sm ${formError.includes('겹칩니다') ? 'text-amber-600' : 'text-red-600'}`}>
            {formError}
          </p>
        )}

        {/* 항목 선택 */}
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
              <option key={task.id} value={task.id}>
                {task.name}
              </option>
            ))}
          </select>
        </div>

        {/* 시간 입력 */}
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="text-xs text-slate-500 mb-1 block">시작 시각 *</label>
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
            <label className="text-xs text-slate-500 mb-1 block">종료 시각 *</label>
            <input
              type="time"
              value={endedAt}
              onChange={e => setEndedAt(e.target.value)}
              className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        {/* 메모 */}
        <div>
          <label className="text-xs text-slate-500 mb-1 block">메모 (선택)</label>
          <input
            type="text"
            placeholder="메모 입력"
            value={memo}
            onChange={e => setMemo(e.target.value)}
            className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || !selectedTaskId || !startedAt || !endedAt}
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? '저장 중...' : '저장'}
        </button>
      </form>

      {/* 해당 일자 활동 기록 목록 */}
      <div>
        <h2 className="text-lg font-semibold text-slate-700 mb-3">{date} 활동 기록</h2>
        {loading && <p className="text-slate-400 text-sm py-4">로딩 중...</p>}
        {error && <p className="text-red-500 text-sm py-4">{error}</p>}
        {!loading && logs.length === 0 && (
          <p className="text-slate-400 text-sm text-center py-8">해당 일자에 기록이 없습니다</p>
        )}
        {!loading && logs.length > 0 && (
          <div className="space-y-2">
            {logs.map(log => {
              const isBusy = actionId === log.id;
              const startTime = log.startedAt.slice(11, 16);
              const endTime = log.endedAt.slice(11, 16);
              return (
                <div
                  key={log.id}
                  className="bg-white rounded-lg border border-slate-200 px-4 py-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: log.colorCode || '#6B7280' }}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-800">{log.taskName}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          log.source === 'TIMER'
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-green-50 text-green-600'
                        }`}>
                          {log.source === 'TIMER' ? '타이머' : '수동'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {startTime} ~ {endTime} ({formatDuration(log.durationSeconds)})
                        {log.memo && <span className="ml-2 text-slate-400">- {log.memo}</span>}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(log.id)}
                    disabled={isBusy}
                    className="text-xs text-slate-400 hover:text-red-500 disabled:opacity-50"
                  >
                    삭제
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
