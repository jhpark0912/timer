import { useState } from 'react';
import type { Task } from '../types';
import { useTimerPresets } from '../hooks/useTimerPresets';

interface Props {
  tasks: Task[];
  onDelete: (id: number) => Promise<void>;
  onStartTimer: (taskId: number, duration: number) => Promise<void>;
  activeTaskId: number | null;
}

export default function TaskList({ tasks, onDelete, onStartTimer, activeTaskId }: Props) {
  const [customMinutes, setCustomMinutes] = useState<Record<number, string>>({});
  const [actionId, setActionId] = useState<number | null>(null);
  const { presets } = useTimerPresets();

  if (tasks.length === 0) {
    return <p className="text-slate-400 text-sm text-center py-8">등록된 항목이 없습니다</p>;
  }

  const handleCustomStart = async (taskId: number) => {
    const minutes = parseInt(customMinutes[taskId] || '0', 10);
    if (minutes <= 0) return;
    setActionId(taskId);
    try {
      await onStartTimer(taskId, minutes * 60);
      setCustomMinutes(prev => ({ ...prev, [taskId]: '' }));
    } finally {
      setActionId(null);
    }
  };

  const handlePresetStart = async (taskId: number, seconds: number) => {
    setActionId(taskId);
    try {
      await onStartTimer(taskId, seconds);
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (taskId: number) => {
    setActionId(taskId);
    try {
      await onDelete(taskId);
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-3">
      {tasks.map(task => {
        const isActive = task.id === activeTaskId;
        const isBusy = actionId === task.id;
        return (
          <div
            key={task.id}
            className={`bg-white rounded-lg border p-4 ${
              isActive ? 'border-blue-400 ring-2 ring-blue-100' : 'border-slate-200'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-slate-800">
                  {task.name}
                  {isActive && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      타이머 동작 중
                    </span>
                  )}
                </h3>
                {task.description && (
                  <p className="text-sm text-slate-500 mt-0.5">{task.description}</p>
                )}
                {task.colorCode && (
                  <span
                    className="inline-block mt-1 w-3 h-3 rounded-full"
                    style={{ backgroundColor: task.colorCode }}
                  />
                )}
              </div>
              <button
                onClick={() => handleDelete(task.id)}
                disabled={isBusy}
                className="text-slate-400 hover:text-red-500 text-sm disabled:opacity-50"
              >
                삭제
              </button>
            </div>

            {/* 타이머 시작 버튼들 */}
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              {presets.map(preset => (
                <button
                  key={preset.minutes}
                  onClick={() => handlePresetStart(task.id, preset.minutes * 60)}
                  disabled={isBusy}
                  className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded text-xs font-medium hover:bg-slate-200 disabled:opacity-50"
                >
                  {preset.label}
                </button>
              ))}
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="1"
                  placeholder="분"
                  value={customMinutes[task.id] || ''}
                  onChange={e => setCustomMinutes(prev => ({ ...prev, [task.id]: e.target.value }))}
                  className="w-16 border border-slate-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => handleCustomStart(task.id)}
                  disabled={isBusy}
                  className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  시작
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
