import axios from 'axios';
import type { Task, TaskCreateRequest, TaskUpdateRequest, TimerSession, TimerStartRequest, StatsResponse } from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

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

// Stats API
export const statsApi = {
  /** 기간별 통계 조회 */
  get: (params: { period?: string; date?: string; from?: string; to?: string }) =>
    api.get<StatsResponse>('/stats', { params }).then(r => r.data),
};
