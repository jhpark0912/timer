import { useState, useCallback } from 'react';
import type { ActivityLog, ActivityLogCreateRequest, ActivityLogUpdateRequest } from '../types';
import { activityLogApi } from '../api/client';

export function useActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchByDate = useCallback(async (date: string) => {
    try {
      setLoading(true);
      const data = await activityLogApi.findByDate(date);
      setLogs(data);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '활동 기록 조회 실패');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchByDateRange = useCallback(async (from: string, to: string) => {
    try {
      setLoading(true);
      const data = await activityLogApi.findByDateRange(from, to);
      setLogs(data);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '활동 기록 조회 실패');
    } finally {
      setLoading(false);
    }
  }, []);

  const createLog = async (request: ActivityLogCreateRequest) => {
    const created = await activityLogApi.create(request);
    setLogs(prev => [...prev, created].sort((a, b) => a.startedAt.localeCompare(b.startedAt)));
    return created;
  };

  const updateLog = async (id: number, request: ActivityLogUpdateRequest) => {
    const updated = await activityLogApi.update(id, request);
    setLogs(prev => prev.map(l => (l.id === id ? updated : l)));
    return updated;
  };

  const deleteLog = async (id: number) => {
    await activityLogApi.delete(id);
    setLogs(prev => prev.filter(l => l.id !== id));
  };

  return { logs, loading, error, fetchByDate, fetchByDateRange, createLog, updateLog, deleteLog };
}
