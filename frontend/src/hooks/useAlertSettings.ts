import { useState, useCallback } from 'react';
import type { AlertSettings } from '../types';

const STORAGE_KEY = 'alert-settings';

/** 기본 알림 설정 */
const DEFAULT_SETTINGS: AlertSettings = {
  notification: true,
  sound: true,
  volume: 0.5,
};

/** localStorage에서 설정 로드 */
function loadSettings(): AlertSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch {
    // 파싱 실패 시 기본값
  }
  return DEFAULT_SETTINGS;
}

/**
 * 알림 설정 관리 훅
 *
 * localStorage 기반으로 알림 방식(팝업/사운드/둘 다)과 볼륨을 관리한다.
 */
export function useAlertSettings() {
  const [settings, setSettings] = useState<AlertSettings>(loadSettings);

  const updateSettings = useCallback((partial: Partial<AlertSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...partial };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { settings, updateSettings };
}
