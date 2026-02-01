export interface Task {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  isActive: boolean;
  dateCreated: string;
  dateUpdated: string;
}

export interface TaskCreateRequest {
  name: string;
  description?: string;
  category?: string;
}

export interface TaskUpdateRequest {
  name?: string;
  description?: string;
  category?: string;
  isActive?: boolean;
}

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

// ── 통계 ──

/** 항목별 통계 */
export interface TaskStatsItem {
  taskId: number;
  taskName: string;
  category: string | null;
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
