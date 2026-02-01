import { useState, useEffect, useCallback } from 'react';
import { statsApi } from '../api/client';
import type { StatsResponse, StatsPeriod } from '../types';

/** 오늘 날짜를 YYYY-MM-DD 형식으로 반환 */
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function useStats() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<StatsPeriod>('weekly');
  const [date, setDate] = useState(today());
  const [customFrom, setCustomFrom] = useState(today());
  const [customTo, setCustomTo] = useState(today());

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = period === 'custom'
        ? { from: customFrom, to: customTo }
        : { period, date };
      const data = await statsApi.get(params);
      setStats(data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '통계 조회 실패';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [period, date, customFrom, customTo]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    period,
    setPeriod,
    date,
    setDate,
    customFrom,
    setCustomFrom,
    customTo,
    setCustomTo,
    refresh: fetchStats,
  };
}
