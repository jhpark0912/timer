import { useState } from 'react';
import { useTasks } from '../hooks/useTasks';
import TaskForm from '../components/TaskForm';
import ColorPicker from '../components/ColorPicker';
import type { Task } from '../types';

export default function TaskManage() {
  const { tasks, loading, error, createTask, deleteTask, updateTask } = useTasks();
  const [actionId, setActionId] = useState<number | null>(null);
  /** 색상 편집 중인 태스크 ID */
  const [colorEditId, setColorEditId] = useState<number | null>(null);

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

  const handleToggleFavorite = async (task: Task) => {
    setActionId(task.id);
    try {
      await updateTask(task.id, { isFavorite: !task.isFavorite });
    } finally {
      setActionId(null);
    }
  };

  const handleColorChange = async (taskId: number, colorCode: string) => {
    setActionId(taskId);
    try {
      await updateTask(taskId, { colorCode });
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

      {/* 항목 추가 폼 */}
      <TaskForm
        onSubmit={async data => { await createTask(data); }}
      />

      {/* 항목 목록 */}
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">등록된 항목이 없습니다</p>
        ) : (
          tasks.map(task => {
            const isBusy = actionId === task.id;
            const isEditingColor = colorEditId === task.id;
            return (
              <div
                key={task.id}
                className={`bg-white rounded-lg border border-slate-200 p-3 ${
                  !task.isActive ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* 색상 점 클릭 → 색상 편집 토글 */}
                    <button
                      type="button"
                      onClick={() => setColorEditId(isEditingColor ? null : task.id)}
                      className="w-4 h-4 rounded-full flex-shrink-0 border border-slate-200 hover:ring-2 hover:ring-blue-300 transition-all cursor-pointer"
                      style={{ backgroundColor: task.colorCode || '#6B7280' }}
                      title="색상 변경"
                    />
                    <div>
                      <h4 className="text-sm font-medium text-slate-800">{task.name}</h4>
                      {task.description && (
                        <p className="text-xs text-slate-500">{task.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleFavorite(task)}
                      disabled={isBusy}
                      className={`text-xs px-2 py-1.5 rounded disabled:opacity-50 ${
                        task.isFavorite
                          ? 'text-amber-500 hover:text-amber-600'
                          : 'text-slate-300 hover:text-slate-400'
                      }`}
                      title={task.isFavorite ? '즐겨찾기 해제' : '즐겨찾기'}
                    >
                      {task.isFavorite ? '★' : '☆'}
                    </button>
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

                {/* 색상 편집 패널 */}
                {isEditingColor && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <label className="text-xs text-slate-500 mb-1.5 block">색상 변경</label>
                    <ColorPicker
                      value={task.colorCode || '#6B7280'}
                      onChange={color => handleColorChange(task.id, color)}
                      size="sm"
                    />
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
