import { useState, useEffect, useCallback } from 'react';
import type { Task, TaskCreateRequest, TaskUpdateRequest } from '../types';
import { taskApi } from '../api/client';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await taskApi.findAll();
      setTasks(data);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '태스크 목록 조회 실패');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (request: TaskCreateRequest) => {
    const created = await taskApi.create(request);
    setTasks(prev => [...prev, created]);
    return created;
  };

  const updateTask = async (id: number, request: TaskUpdateRequest) => {
    const updated = await taskApi.update(id, request);
    setTasks(prev => prev.map(t => (t.id === id ? updated : t)));
    return updated;
  };

  const deleteTask = async (id: number) => {
    await taskApi.delete(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  return { tasks, loading, error, fetchTasks, createTask, updateTask, deleteTask };
}
