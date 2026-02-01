import { useState, useEffect, useCallback } from 'react';
import { statsApi } from '../api/client';
import type {
  StatsResponse, StatsPeriod, StatsTab,
  SourceStatsResponse,
} from '../types';

/** 오늘 날짜를 YYYY-MM-DD 형식으로 반환 */
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** 7일 전 날짜를 YYYY-MM-DD 형식으로 반환 */
function weekAgo(): string {
  const d = new Date();
  d.setDate(d.getDate() - 6);
  return d.toISOString().slice(0, 10);
}

export function useStats() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [sourceStats, setSourceStats] = useState<SourceStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<StatsPeriod>('weekly');
  const [date, setDate] = useState(today());
  const [customFrom, setCustomFrom] = useState(weekAgo());
  const [customTo, setCustomTo] = useState(today());
  const [tab, setTab] = useState<StatsTab>('chart');

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = period === 'custom'
        ? { from: customFrom, to: customTo }
        : { period, date };
      const data = await statsApi.get(params);
      setStats(data);

      // 출처별 통계 조회
      const from = data.from;
      const to = data.to;
      const srcData = await statsApi.getBySource(from, to);
      setSourceStats(srcData);
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
    sourceStats,
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
    tab,
    setTab,
    refresh: fetchStats,
  };
}
