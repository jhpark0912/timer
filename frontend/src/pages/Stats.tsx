import { useState, useEffect } from 'react';
import { useStats } from '../hooks/useStats';
import { timetreeApi, activityLogApi } from '../api/client';
import type { StatsPeriod, StatsTab, DailyTimeTreeResponse, ActivityLog } from '../types';
import TimeTree from '../components/TimeTree';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line,
} from 'recharts';

/** 초를 "Xh Ym" 또는 "Ym Xs" 형태로 변환 */
function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}초`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}시간 ${m}분`;
  return `${m}분`;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const PERIOD_OPTIONS: { value: StatsPeriod; label: string }[] = [
  { value: 'daily', label: '일별' },
  { value: 'weekly', label: '주별' },
  { value: 'monthly', label: '월별' },
  { value: 'custom', label: '기간 지정' },
];

const TAB_OPTIONS: { value: StatsTab; label: string }[] = [
  { value: 'chart', label: '차트' },
  { value: 'timetree', label: '타임 트리' },
  { value: 'detail', label: '상세 테이블' },
];

export default function Stats() {
  const {
    stats, sourceStats,
    loading, error,
    period, setPeriod,
    date, setDate,
    customFrom, setCustomFrom,
    customTo, setCustomTo,
    tab, setTab,
  } = useStats();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-800">시간 통계</h1>

      {/* 기간 선택 */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {PERIOD_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                period === opt.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {period !== 'custom' ? (
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="border border-slate-300 rounded px-3 py-1.5 text-sm"
          />
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customFrom}
              onChange={e => setCustomFrom(e.target.value)}
              className="border border-slate-300 rounded px-3 py-1.5 text-sm"
            />
            <span className="text-slate-400">~</span>
            <input
              type="date"
              value={customTo}
              onChange={e => setCustomTo(e.target.value)}
              className="border border-slate-300 rounded px-3 py-1.5 text-sm"
            />
          </div>
        )}
      </div>

      {/* 탭 */}
      <div className="flex border-b border-slate-200">
        {TAB_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setTab(opt.value)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === opt.value
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-center text-slate-400 py-8">로딩 중...</p>}
      {error && <p className="text-center text-red-500 py-8">{error}</p>}

      {stats && !loading && (
        <>
          {/* 요약 */}
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-slate-500">조회 기간</span>
              <span className="text-sm font-medium text-slate-700">{stats.from} ~ {stats.to}</span>
            </div>
            <p className="text-2xl font-bold text-slate-800 mt-1">
              총 {formatDuration(stats.totalSeconds)}
            </p>
            {/* 출처별 요약 */}
            {sourceStats && sourceStats.sources.length > 0 && (
              <div className="flex gap-4 mt-2">
                {sourceStats.sources.map(s => (
                  <span key={s.source} className="text-xs text-slate-500">
                    {s.source === 'TIMER' ? '🕐 타이머' : '✏️ 수동'}: {formatDuration(s.totalSeconds)} ({s.percentage.toFixed(1)}%)
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 차트 탭 */}
          {tab === 'chart' && <ChartTab stats={stats} sourceStats={sourceStats} />}

          {/* 타임 트리 탭 */}
          {tab === 'timetree' && <TimeTreeTab from={stats.from} to={stats.to} />}

          {/* 상세 테이블 탭 */}
          {tab === 'detail' && <DetailTab from={stats.from} to={stats.to} />}
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// 차트 탭
// ─────────────────────────────────────────

function ChartTab({ stats, sourceStats }: {
  stats: NonNullable<ReturnType<typeof useStats>['stats']>;
  sourceStats: ReturnType<typeof useStats>['sourceStats'];
}) {
  if (stats.taskStats.length === 0) {
    return <p className="text-center text-slate-400 py-8">해당 기간에 활동 기록이 없습니다.</p>;
  }

  return (
    <div className="space-y-6">
      {/* 출처별 비율 */}
      {sourceStats && sourceStats.sources.length > 1 && (
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">기록 출처별 비율</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={sourceStats.sources.map(s => ({
                  ...s,
                  label: s.source === 'TIMER' ? '타이머' : '수동 입력',
                }))}
                dataKey="totalSeconds"
                nameKey="label"
                cx="50%" cy="50%"
                outerRadius={70}
                label={(props) => {
                  const p = props as unknown as { label: string; percentage: number };
                  return `${p.label} ${p.percentage.toFixed(1)}%`;
                }}
              >
                <Cell fill="#3b82f6" />
                <Cell fill="#10b981" />
              </Pie>
              <Tooltip formatter={(value: unknown) => formatDuration(Number(value))} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 항목별 막대 차트 */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">항목별 소요 시간</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.taskStats}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="taskName" tick={{ fontSize: 12 }} />
            <YAxis tickFormatter={v => formatDuration(v)} tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value: unknown) => [formatDuration(Number(value)), '소요 시간']} />
            <Bar dataKey="totalSeconds" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 일별 추이 라인 차트 */}
      {stats.dailyTrend.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">일별 추이</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={buildLineData(stats.dailyTrend)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={v => formatDuration(v)} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: unknown) => formatDuration(Number(value))} />
              <Legend />
              {getUniqueTaskNames(stats.dailyTrend).map((name, i) => (
                <Line
                  key={name}
                  type="monotone"
                  dataKey={name}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 항목별 테이블 */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 overflow-x-auto">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">항목별 요약</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="pb-2 font-medium">항목</th>
              <th className="pb-2 font-medium text-right">기록 수</th>
              <th className="pb-2 font-medium text-right">소요 시간</th>
              <th className="pb-2 font-medium text-right">비율</th>
            </tr>
          </thead>
          <tbody>
            {stats.taskStats.map(item => (
              <tr key={item.taskId} className="border-b border-slate-100">
                <td className="py-2 font-medium text-slate-700">{item.taskName}</td>
                <td className="py-2 text-right text-slate-600">{item.sessionCount}</td>
                <td className="py-2 text-right text-slate-600">{formatDuration(item.totalSeconds)}</td>
                <td className="py-2 text-right text-slate-600">{item.percentage.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// 타임 트리 탭
// ─────────────────────────────────────────

function TimeTreeTab({ from, to }: { from: string; to: string }) {
  const [treeDate, setTreeDate] = useState(from);
  const [treeData, setTreeData] = useState<DailyTimeTreeResponse | null>(null);
  const [treeLoading, setTreeLoading] = useState(false);

  const fetchTree = async (d: string) => {
    setTreeLoading(true);
    try {
      const data = await timetreeApi.getDaily(d);
      setTreeData(data);
    } catch { /* ignore */ }
    finally { setTreeLoading(false); }
  };

  // 초기 조회
  useEffect(() => { fetchTree(treeDate); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDateChange = (d: string) => {
    setTreeDate(d);
    fetchTree(d);
  };

  const handleDateNav = (offset: number) => {
    const d = new Date(treeDate);
    d.setDate(d.getDate() + offset);
    const next = d.toISOString().slice(0, 10);
    // 조회 기간 범위 내에서만 이동
    if (next >= from && next <= to) {
      handleDateChange(next);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => handleDateNav(-1)}
          disabled={treeDate <= from}
          className="text-slate-400 hover:text-slate-600 px-2 py-1 disabled:opacity-30"
        >◀</button>
        <input
          type="date"
          value={treeDate}
          min={from}
          max={to}
          onChange={e => handleDateChange(e.target.value)}
          className="border border-slate-300 rounded px-3 py-1.5 text-sm"
        />
        <button
          onClick={() => handleDateNav(1)}
          disabled={treeDate >= to}
          className="text-slate-400 hover:text-slate-600 px-2 py-1 disabled:opacity-30"
        >▶</button>
      </div>

      {treeLoading && <p className="text-center text-slate-400 py-8">로딩 중...</p>}

      {!treeLoading && treeData && (
        <TimeTree
          date={treeData.date}
          blocks={treeData.blocks}
          summary={treeData.summary}
          viewMode="full"
        />
      )}

      {!treeLoading && treeData && treeData.blocks.length === 0 && (
        <p className="text-center text-slate-400 py-8">이 날짜에 활동 기록이 없습니다.</p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// 상세 테이블 탭
// ─────────────────────────────────────────

type SortKey = 'startedAt' | 'endedAt' | 'durationSeconds' | 'taskName';
type SortDir = 'asc' | 'desc';

function DetailTab({ from, to }: { from: string; to: string }) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('startedAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  // 초기 데이터 로드
  useEffect(() => {
    setDetailLoading(true);
    activityLogApi.findByDateRange(from, to)
      .then(setLogs)
      .catch(() => {})
      .finally(() => setDetailLoading(false));
  }, [from, to]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const filteredLogs = sourceFilter === 'all'
    ? logs
    : logs.filter(l => l.source === sourceFilter);

  const sortedLogs = [...filteredLogs].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case 'startedAt': cmp = a.startedAt.localeCompare(b.startedAt); break;
      case 'endedAt': cmp = a.endedAt.localeCompare(b.endedAt); break;
      case 'durationSeconds': cmp = a.durationSeconds - b.durationSeconds; break;
      case 'taskName': cmp = a.taskName.localeCompare(b.taskName); break;
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const sortIcon = (key: SortKey) => {
    if (sortKey !== key) return ' ↕';
    return sortDir === 'asc' ? ' ↑' : ' ↓';
  };

  if (detailLoading) {
    return <p className="text-center text-slate-400 py-8">로딩 중...</p>;
  }

  return (
    <div className="space-y-4">
      {/* 필터 */}
      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-500">출처 필터:</span>
        {['all', 'TIMER', 'MANUAL'].map(f => (
          <button
            key={f}
            onClick={() => setSourceFilter(f)}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
              sourceFilter === f
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f === 'all' ? '전체' : f === 'TIMER' ? '🕐 타이머' : '✏️ 수동'}
          </button>
        ))}
        <span className="text-xs text-slate-400 ml-auto">{sortedLogs.length}건</span>
      </div>

      {sortedLogs.length === 0 ? (
        <p className="text-center text-slate-400 py-8">해당 기간에 활동 기록이 없습니다.</p>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 p-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="pb-2 font-medium">날짜</th>
                <th
                  className="pb-2 font-medium cursor-pointer hover:text-slate-700"
                  onClick={() => handleSort('taskName')}
                >
                  항목{sortIcon('taskName')}
                </th>
                <th
                  className="pb-2 font-medium cursor-pointer hover:text-slate-700"
                  onClick={() => handleSort('startedAt')}
                >
                  시작{sortIcon('startedAt')}
                </th>
                <th
                  className="pb-2 font-medium cursor-pointer hover:text-slate-700"
                  onClick={() => handleSort('endedAt')}
                >
                  종료{sortIcon('endedAt')}
                </th>
                <th
                  className="pb-2 font-medium text-right cursor-pointer hover:text-slate-700"
                  onClick={() => handleSort('durationSeconds')}
                >
                  소요{sortIcon('durationSeconds')}
                </th>
                <th className="pb-2 font-medium">출처</th>
                <th className="pb-2 font-medium">메모</th>
              </tr>
            </thead>
            <tbody>
              {sortedLogs.map(log => (
                <tr key={log.id} className="border-b border-slate-100">
                  <td className="py-2 text-slate-600">{log.startedAt.slice(0, 10)}</td>
                  <td className="py-2">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: log.colorCode || '#6B7280' }}
                      />
                      <span className="font-medium text-slate-700">{log.taskName}</span>
                    </div>
                  </td>
                  <td className="py-2 text-slate-600">{log.startedAt.slice(11, 16)}</td>
                  <td className="py-2 text-slate-600">{log.endedAt.slice(11, 16)}</td>
                  <td className="py-2 text-right text-slate-600">{formatDuration(log.durationSeconds)}</td>
                  <td className="py-2">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      log.source === 'TIMER'
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-green-50 text-green-600'
                    }`}>
                      {log.source === 'TIMER' ? '🕐' : '✏️'}
                    </span>
                  </td>
                  <td className="py-2 text-slate-500 truncate max-w-[150px]">{log.memo ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// 유틸
// ─────────────────────────────────────────

/** dailyTrend 데이터를 라인 차트용 피벗 형태로 변환 */
function buildLineData(dailyTrend: { date: string; taskName: string; totalSeconds: number }[]) {
  const dateMap = new Map<string, Record<string, number>>();
  for (const item of dailyTrend) {
    if (!dateMap.has(item.date)) dateMap.set(item.date, {});
    dateMap.get(item.date)![item.taskName] = item.totalSeconds;
  }
  return Array.from(dateMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, tasks]) => ({ date, ...tasks }));
}

/** dailyTrend에서 고유 taskName 추출 */
function getUniqueTaskNames(dailyTrend: { taskName: string }[]): string[] {
  return [...new Set(dailyTrend.map(d => d.taskName))];
}
