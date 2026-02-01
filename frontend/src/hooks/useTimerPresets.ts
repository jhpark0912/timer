import { useState, useCallback } from 'react';
import type { TimerPreset } from '../types';

const STORAGE_KEY = 'timer-presets';

const DEFAULT_PRESETS: TimerPreset[] = [
  { label: '5분', minutes: 5 },
  { label: '15분', minutes: 15 },
  { label: '25분', minutes: 25 },
  { label: '50분', minutes: 50 },
];

function loadPresets(): TimerPreset[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* 파싱 실패 시 기본값 */ }
  return DEFAULT_PRESETS;
}

/**
 * 타이머 프리셋 관리 훅
 *
 * localStorage 기반으로 사용자 정의 타이머 프리셋을 관리한다.
 */
export function useTimerPresets() {
  const [presets, setPresets] = useState<TimerPreset[]>(loadPresets);

  const savePresets = useCallback((next: TimerPreset[]) => {
    setPresets(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const addPreset = useCallback((minutes: number) => {
    setPresets(prev => {
      if (prev.some(p => p.minutes === minutes)) return prev;
      const next = [...prev, { label: `${minutes}분`, minutes }]
        .sort((a, b) => a.minutes - b.minutes);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removePreset = useCallback((minutes: number) => {
    setPresets(prev => {
      const next = prev.filter(p => p.minutes !== minutes);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const resetPresets = useCallback(() => {
    savePresets(DEFAULT_PRESETS);
  }, [savePresets]);

  return { presets, addPreset, removePreset, resetPresets };
}
