import axios from 'axios';
import type {
  Task, TaskCreateRequest, TaskUpdateRequest,
  TimerSession, TimerStartRequest, StatsResponse,
  ActivityLog, ActivityLogCreateRequest, ActivityLogUpdateRequest,
  DailyTimeTreeResponse, WeeklyTimeTreeResponse, MonthlyTimeTreeResponse,
  SourceStatsResponse,
  UserProfile, UserProfileRequest,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Profile API
export const profileApi = {
  get: () => api.get<UserProfile>('/profile').then(r => r.data).catch(() => null),
  save: (data: UserProfileRequest) => api.put<UserProfile>('/profile', data).then(r => r.data),
};

// Task API
export const taskApi = {
  findAll: () => api.get<Task[]>('/tasks').then(r => r.data),
  findById: (id: number) => api.get<Task>(`/tasks/${id}`).then(r => r.data),
  create: (data: TaskCreateRequest) => api.post<Task>('/tasks', data).then(r => r.data),
  update: (id: number, data: TaskUpdateRequest) => api.put<Task>(`/tasks/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/tasks/${id}`),
};

// Timer API
export const timerApi = {
  getActive: () => api.get<TimerSession | null>('/timer/active').then(r => r.data),
  start: (data: TimerStartRequest) => api.post<TimerSession>('/timer/start', data).then(r => r.data),
  pause: (sessionId: number) => api.post<TimerSession>(`/timer/${sessionId}/pause`).then(r => r.data),
  resume: (sessionId: number) => api.post<TimerSession>(`/timer/${sessionId}/resume`).then(r => r.data),
  stop: (sessionId: number, completed = true) =>
    api.post<TimerSession>(`/timer/${sessionId}/stop?completed=${completed}`).then(r => r.data),
};

// ActivityLog API
export const activityLogApi = {
  findByDate: (date: string) => api.get<ActivityLog[]>('/activity-logs', { params: { date } }).then(r => r.data),
  findByDateRange: (from: string, to: string) => api.get<ActivityLog[]>('/activity-logs', { params: { from, to } }).then(r => r.data),
  findById: (id: number) => api.get<ActivityLog>(`/activity-logs/${id}`).then(r => r.data),
  create: (data: ActivityLogCreateRequest) => api.post<ActivityLog>('/activity-logs', data).then(r => r.data),
  update: (id: number, data: ActivityLogUpdateRequest) => api.put<ActivityLog>(`/activity-logs/${id}`, data).then(r => r.data),
  delete: (id: number) => api.delete(`/activity-logs/${id}`),
};

// TimeTree API
export const timetreeApi = {
  getDaily: (date?: string) => api.get<DailyTimeTreeResponse>('/timetree/daily', { params: { date } }).then(r => r.data),
  getWeekly: (date?: string) => api.get<WeeklyTimeTreeResponse>('/timetree/weekly', { params: { date } }).then(r => r.data),
  getMonthly: (month?: string) => api.get<MonthlyTimeTreeResponse>('/timetree/monthly', { params: { month } }).then(r => r.data),
};

// Stats API
export const statsApi = {
  /** 기간별 통계 조회 */
  get: (params: { period?: string; date?: string; from?: string; to?: string }) =>
    api.get<StatsResponse>('/stats', { params }).then(r => r.data),
  /** 출처별 통계 조회 */
  getBySource: (from: string, to: string) =>
    api.get<SourceStatsResponse>('/stats/by-source', { params: { from, to } }).then(r => r.data),
};
