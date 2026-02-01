import { useState } from 'react';
import { useAlertSettings } from '../hooks/useAlertSettings';
import { useNotification } from '../hooks/useNotification';
import { useTimerPresets } from '../hooks/useTimerPresets';
import { useUserProfile } from '../hooks/useUserProfile';
import { playAlertSound } from '../utils/sound';

export default function Settings() {
  const { settings, updateSettings } = useAlertSettings();
  const { permission, requestPermission } = useNotification();
  const { presets, addPreset, removePreset, resetPresets } = useTimerPresets();
  const { profile, saveNickname } = useUserProfile();
  const [newMinutes, setNewMinutes] = useState('');
  const [editingNickname, setEditingNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState(profile?.nickname ?? '');

  const handleAddPreset = () => {
    const m = parseInt(newMinutes, 10);
    if (m > 0 && m <= 1440) {
      addPreset(m);
      setNewMinutes('');
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-800">설정</h1>

      {/* 닉네임 설정 */}
      <section className="bg-white rounded-lg border border-slate-200 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-700">프로필</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600">이름 / 닉네임</p>
            {!editingNickname && (
              <p className="text-sm font-medium text-slate-800">{profile?.nickname ?? '미설정'}</p>
            )}
          </div>
          {!editingNickname ? (
            <button
              onClick={() => {
                setNicknameInput(profile?.nickname ?? '');
                setEditingNickname(true);
              }}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
            >
              변경
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={nicknameInput}
                onChange={e => setNicknameInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && nicknameInput.trim()) {
                    saveNickname(nicknameInput);
                    setEditingNickname(false);
                  }
                  if (e.key === 'Escape') setEditingNickname(false);
                }}
                className="border border-slate-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                onClick={() => {
                  if (nicknameInput.trim()) {
                    saveNickname(nicknameInput);
                    setEditingNickname(false);
                  }
                }}
                disabled={!nicknameInput.trim()}
                className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                저장
              </button>
              <button
                onClick={() => setEditingNickname(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                취소
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 알림 설정 */}
      <section className="bg-white rounded-lg border border-slate-200 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-slate-700">알림 설정</h2>

        {/* 알림 권한 상태 */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600">시스템 알림 권한</p>
            <p className="text-xs text-slate-400">
              {permission === 'granted' && '허용됨'}
              {permission === 'denied' && '차단됨 - 브라우저 설정에서 변경하세요'}
              {permission === 'default' && '아직 설정되지 않음'}
            </p>
          </div>
          {permission === 'default' && (
            <button
              onClick={requestPermission}
              className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-700"
            >
              권한 요청
            </button>
          )}
          {permission === 'granted' && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">허용</span>
          )}
          {permission === 'denied' && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">차단</span>
          )}
        </div>

        <hr className="border-slate-100" />

        {/* 시스템 알림 토글 */}
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <p className="text-sm text-slate-600">시스템 알림 (팝업)</p>
            <p className="text-xs text-slate-400">타이머 완료 시 OS 수준 알림 표시</p>
          </div>
          <input
            type="checkbox"
            checked={settings.notification}
            onChange={e => updateSettings({ notification: e.target.checked })}
            className="w-4 h-4 text-blue-600 rounded"
          />
        </label>

        {/* 사운드 알림 토글 */}
        <label className="flex items-center justify-between cursor-pointer">
          <div>
            <p className="text-sm text-slate-600">알림음</p>
            <p className="text-xs text-slate-400">타이머 완료 시 사운드 재생</p>
          </div>
          <input
            type="checkbox"
            checked={settings.sound}
            onChange={e => updateSettings({ sound: e.target.checked })}
            className="w-4 h-4 text-blue-600 rounded"
          />
        </label>

        {/* 볼륨 슬라이더 */}
        {settings.sound && (
          <div className="flex items-center gap-3 pl-2">
            <span className="text-sm text-slate-500 w-12">볼륨</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.volume}
              onChange={e => updateSettings({ volume: parseFloat(e.target.value) })}
              className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <span className="text-xs text-slate-400 w-8 text-right">
              {Math.round(settings.volume * 100)}%
            </span>
            <button
              onClick={() => playAlertSound(settings.volume)}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              테스트
            </button>
          </div>
        )}
      </section>

      {/* 타이머 프리셋 */}
      <section className="bg-white rounded-lg border border-slate-200 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">타이머 프리셋</h2>
          <button
            onClick={resetPresets}
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            기본값 복원
          </button>
        </div>
        <p className="text-xs text-slate-400">대시보드 항목에서 빠르게 선택할 수 있는 타이머 시간입니다.</p>

        <div className="flex flex-wrap gap-2">
          {presets.map(p => (
            <div
              key={p.minutes}
              className="flex items-center gap-1 bg-slate-100 rounded px-3 py-1.5"
            >
              <span className="text-sm text-slate-700">{p.label}</span>
              <button
                onClick={() => removePreset(p.minutes)}
                className="text-slate-400 hover:text-red-500 text-xs ml-1"
              >
                &times;
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="number"
            min="1"
            max="1440"
            placeholder="분"
            value={newMinutes}
            onChange={e => setNewMinutes(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddPreset()}
            className="w-20 border border-slate-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddPreset}
            disabled={!newMinutes || parseInt(newMinutes, 10) <= 0}
            className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            추가
          </button>
        </div>
      </section>
    </div>
  );
}
