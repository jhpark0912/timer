import { useStats } from '../hooks/useStats';
import type { StatsPeriod } from '../types';
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

export default function Stats() {
  const {
    stats, loading, error,
    period, setPeriod,
    date, setDate,
    customFrom, setCustomFrom,
    customTo, setCustomTo,
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
          </div>

          {stats.taskStats.length === 0 ? (
            <p className="text-center text-slate-400 py-8">해당 기간에 완료된 타이머 세션이 없습니다.</p>
          ) : (
            <>
              {/* 항목별 막대 차트 */}
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <h2 className="text-sm font-semibold text-slate-700 mb-3">항목별 소요 시간</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.taskStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="taskName" tick={{ fontSize: 12 }} />
                    <YAxis
                      tickFormatter={v => formatDuration(v)}
                      tick={{ fontSize: 12 }}
                    />
                    <Tooltip
                      formatter={(value: unknown) => [formatDuration(Number(value)), '소요 시간']}
                    />
                    <Bar dataKey="totalSeconds" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* 비율 파이 차트 */}
              <div className="bg-white rounded-lg border border-slate-200 p-4">
                <h2 className="text-sm font-semibold text-slate-700 mb-3">비율</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={stats.taskStats}
                      dataKey="totalSeconds"
                      nameKey="taskName"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={(props) => {
                        const p = props as unknown as { taskName: string; percentage: number };
                        return `${p.taskName} ${p.percentage.toFixed(1)}%`;
                      }}
                    >
                      {stats.taskStats.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: unknown) => formatDuration(Number(value))} />
                    <Legend />
                  </PieChart>
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
                      <YAxis
                        tickFormatter={v => formatDuration(v)}
                        tick={{ fontSize: 12 }}
                      />
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

              {/* 테이블 */}
              <div className="bg-white rounded-lg border border-slate-200 p-4 overflow-x-auto">
                <h2 className="text-sm font-semibold text-slate-700 mb-3">상세 테이블</h2>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-slate-500">
                      <th className="pb-2 font-medium">항목</th>
                      <th className="pb-2 font-medium">카테고리</th>
                      <th className="pb-2 font-medium text-right">세션 수</th>
                      <th className="pb-2 font-medium text-right">소요 시간</th>
                      <th className="pb-2 font-medium text-right">비율</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.taskStats.map(item => (
                      <tr key={item.taskId} className="border-b border-slate-100">
                        <td className="py-2 font-medium text-slate-700">{item.taskName}</td>
                        <td className="py-2 text-slate-500">{item.category ?? '-'}</td>
                        <td className="py-2 text-right text-slate-600">{item.sessionCount}</td>
                        <td className="py-2 text-right text-slate-600">{formatDuration(item.totalSeconds)}</td>
                        <td className="py-2 text-right text-slate-600">{item.percentage.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

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
