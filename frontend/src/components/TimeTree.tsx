import type { TimeTreeBlock, DailySummary } from '../types';

/** 초를 "Xh Ym" 형태로 변환 */
function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}초`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

/** "2026-02-01T09:30:00" → 9.5 (시간 단위 소수) */
function timeToHour(dateTimeStr: string): number {
  const timePart = dateTimeStr.includes('T') ? dateTimeStr.split('T')[1] : dateTimeStr;
  const [h, m] = timePart.split(':').map(Number);
  return h + m / 60;
}

/** 시간(hour)을 "HH:MM" 형태로 변환 */
function hourToTimeStr(hour: number): string {
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

interface Props {
  date: string;
  blocks: TimeTreeBlock[];
  summary?: DailySummary;
  onBlockClick?: (block: TimeTreeBlock) => void;
  onEmptySlotClick?: (time: string) => void;
  viewMode?: 'compact' | 'full';
}

/** 시간 라벨 (0시~23시) */
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function TimeTree({
  blocks,
  summary,
  onBlockClick,
  onEmptySlotClick,
  viewMode = 'full',
}: Props) {
  const isCompact = viewMode === 'compact';
  const hourHeight = isCompact ? 20 : 48; // px per hour

  /** 활동이 있는 시간 범위 계산 (compact 모드에서 표시 범위 결정) */
  const getVisibleRange = () => {
    if (!isCompact || blocks.length === 0) return { startHour: 0, endHour: 24 };
    const startHours = blocks.map(b => Math.floor(timeToHour(b.startedAt)));
    const endHours = blocks.map(b => Math.ceil(timeToHour(b.endedAt)));
    return {
      startHour: Math.max(0, Math.min(...startHours) - 1),
      endHour: Math.min(24, Math.max(...endHours) + 1),
    };
  };

  const { startHour, endHour } = getVisibleRange();
  const visibleHours = isCompact
    ? Array.from({ length: endHour - startHour }, (_, i) => startHour + i)
    : HOURS;
  const visibleHeight = visibleHours.length * hourHeight;

  const handleSlotClick = (hour: number) => {
    if (!onEmptySlotClick) return;
    onEmptySlotClick(hourToTimeStr(hour));
  };

  return (
    <div className="flex flex-col">
      {/* 타임라인 */}
      <div className="relative border border-slate-200 rounded-lg bg-white overflow-hidden" style={{ height: visibleHeight }}>
        {/* 시간 그리드 라인 */}
        {visibleHours.map((hour, idx) => (
          <div
            key={hour}
            className="absolute w-full border-b border-slate-100 flex items-start"
            style={{ top: idx * hourHeight, height: hourHeight }}
          >
            <span className="text-[10px] text-slate-400 w-10 text-right pr-1 mt-[-6px] select-none">
              {String(hour).padStart(2, '0')}
            </span>
            {/* 빈 구간 클릭 영역 */}
            {onEmptySlotClick && (
              <div
                className="flex-1 h-full cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => handleSlotClick(hour)}
              />
            )}
          </div>
        ))}

        {/* 활동 블록 */}
        {blocks.map(block => {
          const startH = timeToHour(block.startedAt);
          const endH = timeToHour(block.endedAt);
          const topPx = (startH - (isCompact ? startHour : 0)) * hourHeight;
          const heightPx = Math.max((endH - startH) * hourHeight, isCompact ? 8 : 16);

          return (
            <div
              key={block.activityLogId}
              className={`absolute left-11 right-1 rounded overflow-hidden ${
                onBlockClick ? 'cursor-pointer hover:opacity-80' : ''
              }`}
              style={{
                top: topPx,
                height: heightPx,
                backgroundColor: block.colorCode ? `${block.colorCode}30` : '#e2e8f080',
                borderLeft: `3px solid ${block.colorCode || '#6B7280'}`,
              }}
              onClick={() => onBlockClick?.(block)}
              title={`${block.taskName} (${formatDuration(block.durationSeconds)})`}
            >
              {!isCompact && heightPx >= 24 && (
                <div className="px-2 py-0.5 flex items-center gap-1.5 min-w-0">
                  <span className="text-xs font-medium text-slate-800 truncate">
                    {block.taskName}
                  </span>
                  <span className="text-[10px] text-slate-500 flex-shrink-0">
                    {formatDuration(block.durationSeconds)}
                  </span>
                  <span className="text-[10px] flex-shrink-0">
                    {block.source === 'TIMER' ? '🕐' : '✏️'}
                  </span>
                </div>
              )}
              {isCompact && heightPx >= 12 && (
                <div className="px-1 text-[9px] text-slate-700 truncate leading-tight">
                  {block.taskName}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 합계 표시 */}
      {summary && summary.totalSeconds > 0 && !isCompact && (
        <div className="mt-3">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span>합계: {formatDuration(summary.totalSeconds)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
