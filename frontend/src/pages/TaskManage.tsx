import { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import TaskForm from '../components/TaskForm';
import type { Task } from '../types';

export default function TaskManage() {
  const { tasks, loading, error, createTask, deleteTask, updateTask } = useTasks();
  const [actionId, setActionId] = useState<number | null>(null);

  if (loading) return <p className="text-center text-slate-400 py-8">로딩 중...</p>;
  if (error) return <p className="text-center text-red-500 py-8">{error}</p>;

  const handleToggleActive = async (task: Task) => {
    setActionId(task.id);
    try {
      await updateTask(task.id, { isActive: !task.isActive });
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (taskId: number) => {
    setActionId(taskId);
    try {
      await deleteTask(taskId);
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-800">항목 관리</h1>

      <TaskForm onSubmit={async data => { await createTask(data); }} />

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">등록된 항목이 없습니다</p>
        ) : (
          tasks.map(task => {
            const isBusy = actionId === task.id;
            return (
              <div
                key={task.id}
                className={`bg-white rounded-lg border border-slate-200 p-4 flex items-center justify-between ${
                  !task.isActive ? 'opacity-50' : ''
                }`}
              >
                <div>
                  <h3 className="font-medium text-slate-800">{task.name}</h3>
                  {task.description && (
                    <p className="text-sm text-slate-500">{task.description}</p>
                  )}
                  {task.category && (
                    <span className="inline-block mt-1 text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {task.category}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(task)}
                    disabled={isBusy}
                    className={`text-xs px-3 py-1.5 rounded font-medium disabled:opacity-50 ${
                      task.isActive
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {task.isActive ? '활성' : '비활성'}
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    disabled={isBusy}
                    className="text-xs text-red-500 hover:text-red-700 px-3 py-1.5 disabled:opacity-50"
                  >
                    삭제
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
