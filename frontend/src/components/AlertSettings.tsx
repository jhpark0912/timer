import type { AlertSettings as AlertSettingsType } from '../types';
import { playAlertSound } from '../utils/sound';

interface Props {
  settings: AlertSettingsType;
  onUpdate: (partial: Partial<AlertSettingsType>) => void;
}

/**
 * 알림 설정 UI
 *
 * 알림 방식(팝업/사운드/둘 다)과 볼륨을 설정할 수 있다.
 */
export default function AlertSettings({ settings, onUpdate }: Props) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">알림 설정</h3>
      <div className="space-y-3">
        {/* 시스템 알림 토글 */}
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-slate-600">시스템 알림 (팝업)</span>
          <input
            type="checkbox"
            checked={settings.notification}
            onChange={e => onUpdate({ notification: e.target.checked })}
            className="w-4 h-4 text-blue-600 rounded"
          />
        </label>

        {/* 사운드 알림 토글 */}
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-slate-600">알림음</span>
          <input
            type="checkbox"
            checked={settings.sound}
            onChange={e => onUpdate({ sound: e.target.checked })}
            className="w-4 h-4 text-blue-600 rounded"
          />
        </label>

        {/* 볼륨 슬라이더 */}
        {settings.sound && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 w-12">볼륨</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.volume}
              onChange={e => onUpdate({ volume: parseFloat(e.target.value) })}
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
      </div>
    </div>
  );
}
