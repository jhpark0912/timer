import { useState, useEffect, useCallback, useRef } from 'react';
import type { TimerSession, TimerWorkerMessage, AlertSettings } from '../types';
import { timerApi } from '../api/client';
import { playAlertSound } from '../utils/sound';

interface UseTimerOptions {
  /** 알림 설정 */
  alertSettings: AlertSettings;
  /** 시스템 알림 발행 함수 */
  showNotification: (title: string, body: string) => void;
  /** 인앱 토스트 표시 함수 */
  showToast: (message: string) => void;
  /** 알림 권한 상태 */
  notificationPermission: string;
}

/**
 * 타이머 상태 관리 훅 (Web Worker 기반)
 *
 * - Web Worker에서 카운트다운 연산을 수행하여 탭 비활성 쓰로틀링 우회
 * - 타이머 완료 시 알림(시스템/사운드/토스트) 자동 트리거
 * - 브라우저 탭 타이틀에 남은 시간 표시
 * - 새로고침 시 서버 상태 기반 타이머 보정
 */
export function useTimer(options: UseTimerOptions) {
  const { alertSettings, showNotification, showToast, notificationPermission } = options;

  const [session, setSession] = useState<TimerSession | null>(null);
  const [displayRemaining, setDisplayRemaining] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const workerRef = useRef<Worker | null>(null);
  const sessionRef = useRef<TimerSession | null>(null);
  const alertSettingsRef = useRef(alertSettings);

  // alertSettings를 ref로 유지 (Worker 콜백에서 최신 값 참조)
  useEffect(() => {
    alertSettingsRef.current = alertSettings;
  }, [alertSettings]);

  // session ref 동기화
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  // 브라우저 탭 타이틀에 남은 시간 표시
  const updateTitle = useCallback((remaining: number, taskName?: string) => {
    if (remaining > 0 && taskName) {
      const min = Math.floor(remaining / 60).toString().padStart(2, '0');
      const sec = (remaining % 60).toString().padStart(2, '0');
      document.title = `⏱ ${min}:${sec} - ${taskName}`;
    } else {
      document.title = '타이머 일정관리';
    }
  }, []);

  /** 타이머 완료 시 알림 처리 */
  const handleTimerCompleted = useCallback(async (taskName: string) => {
    const settings = alertSettingsRef.current;
    const currentSession = sessionRef.current;

    // 사운드 알림
    if (settings.sound) {
      playAlertSound(settings.volume);
    }

    // 시스템 알림 또는 인앱 토스트
    if (settings.notification && notificationPermission === 'granted') {
      showNotification(
        '타이머 완료',
        `"${taskName}" 타이머가 완료되었습니다.`,
      );
    } else {
      showToast(`"${taskName}" 타이머가 완료되었습니다.`);
    }

    // 서버에 완료 처리
    if (currentSession) {
      try {
        await timerApi.stop(currentSession.id, true);
      } catch {
        // 이미 종료된 세션이면 무시 (서버 보정 시나리오)
      }
      setSession(null);
    }

    updateTitle(0);
  }, [notificationPermission, showNotification, showToast, updateTitle]);

  // Web Worker 초기화 및 메시지 핸들링
  useEffect(() => {
    const worker = new Worker(
      new URL('../workers/timer.worker.ts', import.meta.url),
      { type: 'module' },
    );

    worker.onmessage = (e: MessageEvent<TimerWorkerMessage>) => {
      const { type, remaining, taskName } = e.data;

      if (type === 'TICK') {
        setDisplayRemaining(remaining);
        updateTitle(remaining, taskName);
      } else if (type === 'COMPLETED') {
        setDisplayRemaining(0);
        handleTimerCompleted(taskName);
      }
    };

    worker.onerror = () => {
      setError('타이머 Worker 오류가 발생했습니다.');
    };

    workerRef.current = worker;

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, [updateTitle, handleTimerCompleted]);

  // 세션 상태 변경 시 Worker에 명령 전송
  useEffect(() => {
    const worker = workerRef.current;
    if (!worker) return;

    if (session?.status === 'RUNNING') {
      setDisplayRemaining(session.remaining);
      worker.postMessage({
        type: 'START',
        remaining: session.remaining,
        taskName: session.taskName,
      });
    } else if (session?.status === 'PAUSED') {
      worker.postMessage({ type: 'PAUSE' });
      setDisplayRemaining(session.remaining);
      updateTitle(0);
    } else {
      worker.postMessage({ type: 'STOP' });
      if (!session) {
        setDisplayRemaining(0);
        updateTitle(0);
      }
    }
  }, [session, updateTitle]);

  /** 활성 타이머 세션 조회 (새로고침 보정 포함) */
  const fetchActive = useCallback(async () => {
    try {
      const active = await timerApi.getActive();
      if (active) {
        // 서버가 반환한 remaining 값은 서버 시간 기준 → 그대로 사용
        setSession(active);
        setDisplayRemaining(active.remaining);
      } else {
        setSession(null);
      }
      setError(null);
    } catch (e: unknown) {
      // API 실패 시 사용자에게 알림 (네트워크 에러 등)
      const msg = e instanceof Error ? e.message : '타이머 상태 조회 실패';
      setError(msg);
    }
  }, []);

  useEffect(() => {
    fetchActive();
  }, [fetchActive]);

  /** 타이머 시작 */
  const start = async (taskId: number, duration: number) => {
    setError(null);
    try {
      const s = await timerApi.start({ taskId, duration });
      setSession(s);
      return s;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '타이머 시작 실패';
      setError(msg);
      throw e;
    }
  };

  /** 일시정지 */
  const pause = async () => {
    if (!session) return;
    setError(null);
    try {
      const s = await timerApi.pause(session.id);
      setSession(s);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '일시정지 실패';
      setError(msg);
    }
  };

  /** 재개 */
  const resume = async () => {
    if (!session) return;
    setError(null);
    try {
      const s = await timerApi.resume(session.id);
      setSession(s);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '재개 실패';
      setError(msg);
    }
  };

  /** 종료 */
  const stop = async (completed = true) => {
    if (!session) return;
    workerRef.current?.postMessage({ type: 'STOP' });
    setError(null);
    try {
      const s = await timerApi.stop(session.id, completed);
      setSession(null);
      updateTitle(0);
      return s;
    } catch (e: unknown) {
      // 종료 실패해도 클라이언트 상태는 정리
      setSession(null);
      updateTitle(0);
      const msg = e instanceof Error ? e.message : '종료 실패';
      setError(msg);
    }
  };

  return { session, displayRemaining, error, start, pause, resume, stop, fetchActive };
}
