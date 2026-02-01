// ── 사용자 프로필 ──

export interface UserProfile {
  id: number;
  nickname: string;
  dateCreated: string;
  dateUpdated: string;
}

export interface UserProfileRequest {
  nickname: string;
}

// ── 태스크 ──

export interface Task {
  id: number;
  name: string;
  description: string | null;
  colorCode: string | null;
  isActive: boolean;
  isFavorite: boolean;
  dateCreated: string;
  dateUpdated: string;
}

export interface TaskCreateRequest {
  name: string;
  description?: string;
  colorCode?: string;
}

export interface TaskUpdateRequest {
  name?: string;
  description?: string;
  colorCode?: string;
  isActive?: boolean;
  isFavorite?: boolean;
}

// ── 타이머 ──

export type TimerStatus = 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';

export interface TimerSession {
  id: number;
  taskId: number;
  taskName: string;
  duration: number;
  elapsed: number;
  remaining: number;
  status: TimerStatus;
  startedAt: string;
  endedAt: string | null;
}

export interface TimerStartRequest {
  taskId: number;
  duration: number;
}

/** 알림 설정 */
export interface AlertSettings {
  notification: boolean; // 시스템 알림 on/off
  sound: boolean;        // 알림음 on/off
  volume: number;        // 알림음 볼륨 (0.0 ~ 1.0)
}

/** 사용자 타이머 프리셋 (분 단위) */
export interface TimerPreset {
  label: string;
  minutes: number;
}

/** Web Worker → 메인 스레드 메시지 타입 */
export interface TimerWorkerMessage {
  type: 'TICK' | 'COMPLETED';
  remaining: number;
  taskName: string;
}

// ── 활동 기록 ──

export type ActivitySource = 'TIMER' | 'MANUAL';

export interface ActivityLog {
  id: number;
  taskId: number;
  taskName: string;
  colorCode: string | null;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  source: ActivitySource;
  memo: string | null;
  warning: string | null;
  dateCreated: string;
  dateUpdated: string;
}

export interface ActivityLogCreateRequest {
  taskId: number;
  startedAt: string;
  endedAt: string;
  memo?: string;
}

export interface ActivityLogUpdateRequest {
  taskId?: number;
  startedAt?: string;
  endedAt?: string;
  memo?: string;
}

// ── 타임 트리 ──

export interface TimeTreeBlock {
  activityLogId: number;
  taskId: number;
  taskName: string;
  colorCode: string | null;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  source: ActivitySource;
  memo: string | null;
}

export interface DailySummary {
  totalSeconds: number;
}

export interface DailyTimeTreeResponse {
  date: string;
  blocks: TimeTreeBlock[];
  summary: DailySummary;
}

export interface WeeklyDayEntry {
  date: string;
  blocks: TimeTreeBlock[];
  totalSeconds: number;
}

export interface WeeklyTimeTreeResponse {
  weekStart: string;
  weekEnd: string;
  days: WeeklyDayEntry[];
}

export interface MonthlyTaskBreakdown {
  taskId: number;
  taskName: string;
  colorCode: string | null;
  totalSeconds: number;
}

export interface MonthlyDayEntry {
  date: string;
  totalSeconds: number;
  taskBreakdown: MonthlyTaskBreakdown[];
}

export interface MonthlyTimeTreeResponse {
  month: string;
  days: MonthlyDayEntry[];
}

// ── 통계 ──

/** 항목별 통계 */
export interface TaskStatsItem {
  taskId: number;
  taskName: string;
  totalSeconds: number;
  sessionCount: number;
  percentage: number;
}

/** 일별 추이 */
export interface DailyTrend {
  date: string;
  taskId: number;
  taskName: string;
  totalSeconds: number;
}

/** 통계 조회 응답 */
export interface StatsResponse {
  from: string;
  to: string;
  totalSeconds: number;
  taskStats: TaskStatsItem[];
  dailyTrend: DailyTrend[];
}

/** 통계 기간 타입 */
export type StatsPeriod = 'daily' | 'weekly' | 'monthly' | 'custom';

/** 출처별 통계 항목 */
export interface SourceStatsItem {
  source: string;
  totalSeconds: number;
  logCount: number;
  percentage: number;
}

/** 출처별 통계 응답 */
export interface SourceStatsResponse {
  from: string;
  to: string;
  totalSeconds: number;
  sources: SourceStatsItem[];
}

/** 통계 화면 탭 */
export type StatsTab = 'chart' | 'timetree' | 'detail';
