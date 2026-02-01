import { useState, useEffect, useCallback } from 'react';
import { profileApi } from '../api/client';
import type { UserProfile } from '../types';

/**
 * 사용자 프로필 관리 훅
 *
 * DB 기반으로 닉네임을 관리한다.
 * 최초 접근 시 닉네임이 없으면 null을 반환하여 입력을 유도한다.
 */
export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    profileApi.get().then(data => {
      setProfile(data);
      setLoading(false);
    });
  }, []);

  /** 닉네임 저장 (최초 설정 및 변경 모두 사용) */
  const saveNickname = useCallback(async (nickname: string) => {
    const trimmed = nickname.trim();
    if (!trimmed) return;
    const saved = await profileApi.save({ nickname: trimmed });
    setProfile(saved);
  }, []);

  return { profile, loading, saveNickname };
}
