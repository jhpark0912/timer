import { useState } from 'react';
import type { TaskCreateRequest } from '../types';

interface Props {
  onSubmit: (data: TaskCreateRequest) => Promise<void>;
}

export default function TaskForm({ onSubmit }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        category: category.trim() || undefined,
      });
      setName('');
      setDescription('');
      setCategory('');
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
    <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
      <h3 className="font-semibold text-slate-800">새 항목 추가</h3>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <input
        type="text"
        placeholder="항목 이름 *"
        value={name}
        onChange={e => setName(e.target.value)}
        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        required
      />
      <input
        type="text"
        placeholder="설명 (선택)"
        value={description}
        onChange={e => setDescription(e.target.value)}
        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="text"
        placeholder="카테고리 (선택)"
        value={category}
        onChange={e => setCategory(e.target.value)}
        className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        disabled={submitting || !name.trim()}
        className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? '추가 중...' : '추가'}
      </button>
    </form>
  );
}
