import { useState, useEffect, useCallback } from 'react';
import { timetreeApi, activityLogApi } from '../api/client';
import { useTasks } from '../hooks/useTasks';
import TimeTree from '../components/TimeTree';
import ManualLogModal from '../components/ManualLogModal';
import type {
  DailyTimeTreeResponse, WeeklyTimeTreeResponse, MonthlyTimeTreeResponse,
  TimeTreeBlock, ActivityLogCreateRequest, MonthlyDayEntry,
} from '../types';

type ViewMode = 'daily' | 'weekly' | 'monthly';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function currentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

/** 초를 "Xh Ym" 형태로 변환 */
function formatDuration(seconds: number): string {
  if (seconds === 0) return '-';
  if (seconds < 60) return `${seconds}초`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

/** 날짜 요일 이름 */
const DAY_NAMES = ['월', '화', '수', '목', '금', '토', '일'];

export default function TimeTreePage() {
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [date, setDate] = useState(today());
  const [month, setMonth] = useState(currentMonth());

  const [dailyData, setDailyData] = useState<DailyTimeTreeResponse | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyTimeTreeResponse | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyTimeTreeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 월간 뷰 선택된 날짜
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // 수동 기록 모달 상태
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStartTime, setModalStartTime] = useState<string | undefined>();
  const [selectedBlock, setSelectedBlock] = useState<TimeTreeBlock | null>(null);

  const { tasks } = useTasks();

  const fetchDaily = useCallback(async (d: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await timetreeApi.getDaily(d);
      setDailyData(data);
    } catch { setError('일별 타임 트리 조회 실패'); }
    finally { setLoading(false); }
  }, []);

  const fetchWeekly = useCallback(async (d: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await timetreeApi.getWeekly(d);
      setWeeklyData(data);
    } catch { setError('주간 타임 트리 조회 실패'); }
    finally { setLoading(false); }
  }, []);

  const fetchMonthly = useCallback(async (m: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await timetreeApi.getMonthly(m);
      setMonthlyData(data);
    } catch { setError('월간 타임 트리 조회 실패'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (viewMode === 'daily') fetchDaily(date);
    else if (viewMode === 'weekly') fetchWeekly(date);
    else fetchMonthly(month);
  }, [viewMode, date, month, fetchDaily, fetchWeekly, fetchMonthly]);

  const handleEmptySlotClick = (time: string) => {
    setModalStartTime(time);
    setModalOpen(true);
  };

  const handleBlockClick = (block: TimeTreeBlock) => {
    setSelectedBlock(block);
  };

  const handleModalSubmit = async (data: ActivityLogCreateRequest) => {
    await activityLogApi.create(data);
    // 새 기록 추가 후 현재 뷰 새로고침
    if (viewMode === 'daily') await fetchDaily(date);
    else if (viewMode === 'weekly') await fetchWeekly(date);
  };

  const handleDateNav = (offset: number) => {
    const d = new Date(date);
    if (viewMode === 'daily') d.setDate(d.getDate() + offset);
    else d.setDate(d.getDate() + offset * 7);
    setDate(d.toISOString().slice(0, 10));
  };

  const handleMonthNav = (offset: number) => {
    const [y, m] = month.split('-').map(Number);
    const d = new Date(y, m - 1 + offset, 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  /** 주간 뷰에서 특정 날짜 클릭 → 일별 뷰로 전환 */
  const handleWeekDayClick = (d: string) => {
    setDate(d);
    setViewMode('daily');
  };

  /** 월간 뷰에서 특정 날짜 클릭 → 선택/일별 전환 */
  const handleMonthDayClick = (d: string) => {
    if (selectedDate === d) {
      // 같은 셀 재클릭 → 일별 뷰로 전환
      setDate(d);
      setViewMode('daily');
      setSelectedDate(null);
    } else {
      setSelectedDate(d);
    }
  };

  /** 히트맵 인라인 스타일 (hex colorCode 지원) */
  const getHeatmapBgStyle = (day: MonthlyDayEntry): React.CSSProperties => {
    if (day.totalSeconds === 0) return { backgroundColor: '#f3f4f6' }; // gray-100
    const dominantTask = day.taskBreakdown[0];
    const color = dominantTask?.colorCode || '#3b82f6'; // 기본 blue-500
    const hours = day.totalSeconds / 3600;
    const opacity = hours < 1 ? 0.2 : hours < 3 ? 0.35 : hours < 5 ? 0.55 : 0.75;
    return { backgroundColor: `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}` };
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-800">타임 트리</h1>

      {/* 뷰 모드 탭 */}
      <div className="flex gap-2">
        {(['daily', 'weekly', 'monthly'] as ViewMode[]).map(mode => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              viewMode === mode
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {{ daily: '일별', weekly: '주간', monthly: '월간' }[mode]}
          </button>
        ))}
      </div>

      {/* 날짜 네비게이션 */}
      {viewMode !== 'monthly' ? (
        <div className="flex items-center gap-3">
          <button onClick={() => handleDateNav(-1)} className="text-slate-400 hover:text-slate-600 px-2 py-1">◀</button>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="border border-slate-300 rounded px-3 py-1.5 text-sm"
          />
          <button onClick={() => handleDateNav(1)} className="text-slate-400 hover:text-slate-600 px-2 py-1">▶</button>
          <button onClick={() => setDate(today())} className="text-xs text-blue-600 hover:text-blue-800">오늘</button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <button onClick={() => handleMonthNav(-1)} className="text-slate-400 hover:text-slate-600 px-2 py-1">◀</button>
          <input
            type="month"
            value={month}
            onChange={e => setMonth(e.target.value)}
            className="border border-slate-300 rounded px-3 py-1.5 text-sm"
          />
          <button onClick={() => handleMonthNav(1)} className="text-slate-400 hover:text-slate-600 px-2 py-1">▶</button>
          <button onClick={() => setMonth(currentMonth())} className="text-xs text-blue-600 hover:text-blue-800">이번 달</button>
        </div>
      )}

      {loading && <p className="text-center text-slate-400 py-8">로딩 중...</p>}
      {error && <p className="text-center text-red-500 py-8">{error}</p>}

      {/* 일별 뷰 */}
      {!loading && viewMode === 'daily' && dailyData && (
        <TimeTree
          date={dailyData.date}
          blocks={dailyData.blocks}
          summary={dailyData.summary}
          onBlockClick={handleBlockClick}
          onEmptySlotClick={handleEmptySlotClick}
          viewMode="full"
        />
      )}

      {/* 주간 뷰 */}
      {!loading && viewMode === 'weekly' && weeklyData && (
        <div>
          <div className="text-sm text-slate-500 mb-2">
            {weeklyData.weekStart} ~ {weeklyData.weekEnd}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {weeklyData.days.map((day, idx) => {
              const isToday = day.date === today();
              return (
                <div
                  key={day.date}
                  className={`bg-white rounded-lg border p-2 cursor-pointer hover:border-blue-300 transition-colors ${
                    isToday ? 'border-blue-400 ring-1 ring-blue-100' : 'border-slate-200'
                  }`}
                  onClick={() => handleWeekDayClick(day.date)}
                >
                  <div className="text-center mb-1">
                    <div className="text-[10px] text-slate-400">{DAY_NAMES[idx]}</div>
                    <div className={`text-xs font-medium ${isToday ? 'text-blue-600' : 'text-slate-700'}`}>
                      {day.date.slice(8, 10)}
                    </div>
                  </div>
                  {day.blocks.length > 0 ? (
                    <TimeTree
                      date={day.date}
                      blocks={day.blocks}
                      viewMode="compact"
                    />
                  ) : (
                    <div className="h-20 flex items-center justify-center">
                      <span className="text-[10px] text-slate-300">기록 없음</span>
                    </div>
                  )}
                  <div className="text-center mt-1">
                    <span className="text-[10px] text-slate-500">{formatDuration(day.totalSeconds)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 월간 캘린더 뷰 */}
      {!loading && viewMode === 'monthly' && monthlyData && (() => {
        // 이전 달 / 다음 달 빈 날짜 계산
        const firstDate = new Date(monthlyData.days[0].date + 'T00:00:00');
        const firstDayOfWeek = firstDate.getDay(); // 0=일 1=월 ...
        const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1; // 월요일 기준

        const lastDate = new Date(monthlyData.days[monthlyData.days.length - 1].date + 'T00:00:00');
        const lastDayOfWeek = lastDate.getDay();
        const endOffset = lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek;

        // 이전 달 날짜 배열
        const prevMonthDays: number[] = [];
        for (let i = startOffset; i > 0; i--) {
          const d = new Date(firstDate);
          d.setDate(d.getDate() - i);
          prevMonthDays.push(d.getDate());
        }

        // 다음 달 날짜 배열
        const nextMonthDays: number[] = [];
        for (let i = 1; i <= endOffset; i++) {
          nextMonthDays.push(i);
        }

        return (
          <div>
            <div className="grid grid-cols-7 gap-1">
              {/* 요일 헤더 */}
              {DAY_NAMES.map((name, idx) => (
                <div
                  key={name}
                  className={`text-center text-[10px] py-1 font-medium ${
                    idx >= 5 ? 'text-red-400' : 'text-slate-400'
                  }`}
                >
                  {name}
                </div>
              ))}

              {/* 이전 달 빈 날짜 */}
              {prevMonthDays.map((dayNum, i) => (
                <div
                  key={`prev-${i}`}
                  className="aspect-square rounded flex flex-col items-center justify-center bg-gray-50"
                >
                  <span className="text-xs text-slate-300 opacity-30">{dayNum}</span>
                </div>
              ))}

              {/* 현재 달 날짜 셀 */}
              {monthlyData.days.map(day => {
                const isToday = day.date === today();
                const isSelected = day.date === selectedDate;
                const dateObj = new Date(day.date + 'T00:00:00');
                const dayOfWeek = dateObj.getDay(); // 0=일
                const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                const dayNum = parseInt(day.date.slice(8, 10));

                return (
                  <div
                    key={day.date}
                    className={`aspect-square rounded-lg p-1.5 cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all flex flex-col ${
                      isToday ? 'ring-2 ring-blue-500' : ''
                    } ${isSelected ? 'bg-blue-50 ring-2 ring-blue-400' : ''}`}
                    style={!isSelected ? getHeatmapBgStyle(day) : undefined}
                    onClick={() => handleMonthDayClick(day.date)}
                    title={`${day.date}: ${formatDuration(day.totalSeconds)}`}
                  >
                    {/* 상단: 날짜 */}
                    <div className="flex items-start justify-between">
                      <span className={`text-xs leading-tight font-semibold ${
                        isToday ? 'text-blue-700' :
                        isWeekend ? 'text-red-400' : 'text-slate-700'
                      }`}>
                        {dayNum}
                      </span>
                    </div>

                    {/* 중앙: 총 시간 */}
                    {day.totalSeconds > 0 ? (
                      <div className="flex-1 flex items-center justify-center">
                        <span className="text-xs font-bold text-slate-700 leading-tight">
                          {formatDuration(day.totalSeconds)}
                        </span>
                      </div>
                    ) : (
                      <div className="flex-1" />
                    )}

                    {/* 하단: 카테고리별 비율 바 + 대표 태스크 */}
                    {day.totalSeconds > 0 && day.taskBreakdown.length > 0 && (
                      <div className="space-y-0.5">
                        <div className="w-full h-2 rounded-full overflow-hidden flex">
                          {day.taskBreakdown.map((task, idx) => {
                            const pct = (task.totalSeconds / day.totalSeconds) * 100;
                            return (
                              <div
                                key={task.taskId}
                                className={idx === 0 ? 'rounded-l-full' : idx === day.taskBreakdown.length - 1 ? 'rounded-r-full' : ''}
                                style={{
                                  width: `${pct}%`,
                                  backgroundColor: task.colorCode || '#6B7280',
                                  minWidth: pct > 0 ? '2px' : '0',
                                }}
                                title={`${task.taskName}: ${formatDuration(task.totalSeconds)}`}
                              />
                            );
                          })}
                        </div>
                        <div className="truncate text-[9px] text-slate-500 leading-tight">
                          {day.taskBreakdown[0].taskName}
                          {day.taskBreakdown.length > 1 && ` +${day.taskBreakdown.length - 1}`}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* 다음 달 빈 날짜 */}
              {nextMonthDays.map((dayNum, i) => (
                <div
                  key={`next-${i}`}
                  className="aspect-square rounded flex flex-col items-center justify-center bg-gray-50"
                >
                  <span className="text-xs text-slate-300 opacity-30">{dayNum}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* 블록 상세 패널 */}
      {selectedBlock && (
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-slate-800">활동 상세</h3>
            <button onClick={() => setSelectedBlock(null)} className="text-slate-400 hover:text-slate-600 text-sm">&times;</button>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedBlock.colorCode || '#6B7280' }} />
              <span className="font-medium text-slate-800">{selectedBlock.taskName}</span>
            </div>
            <div className="text-slate-600">
              {selectedBlock.startedAt.slice(11, 16)} ~ {selectedBlock.endedAt.slice(11, 16)}
              ({formatDuration(selectedBlock.durationSeconds)})
            </div>
            <div className="text-slate-500">
              출처: {selectedBlock.source === 'TIMER' ? '🕐 타이머' : '✏️ 수동'}
              {selectedBlock.memo && <span className="ml-2">메모: {selectedBlock.memo}</span>}
            </div>
          </div>
        </div>
      )}

      {/* 수동 기록 모달 */}
      <ManualLogModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        tasks={tasks}
        date={date}
        initialStartTime={modalStartTime}
      />
    </div>
  );
}
