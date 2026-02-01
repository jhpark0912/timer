import { useState } from 'react';

/** 확장 색상 프리셋 (5행 × 4열 = 20색) */
export const COLOR_PRESETS = [
  // Row 1: Red ~ Orange
  '#EF4444', '#DC2626', '#F97316', '#EA580C',
  // Row 2: Yellow ~ Green
  '#EAB308', '#CA8A04', '#22C55E', '#16A34A',
  // Row 3: Teal ~ Blue
  '#14B8A6', '#0D9488', '#3B82F6', '#2563EB',
  // Row 4: Indigo ~ Purple
  '#6366F1', '#4F46E5', '#8B5CF6', '#7C3AED',
  // Row 5: Pink ~ Gray
  '#EC4899', '#DB2777', '#F43F5E', '#6B7280',
];

interface Props {
  value: string;
  onChange: (color: string) => void;
  size?: 'sm' | 'md';
}

export default function ColorPicker({ value, onChange, size = 'md' }: Props) {
  const [showCustom, setShowCustom] = useState(false);
  const [customHex, setCustomHex] = useState('');

  const dotSize = size === 'sm' ? 'w-6 h-6' : 'w-7 h-7';

  const handleCustomApply = () => {
    const hex = customHex.startsWith('#') ? customHex : `#${customHex}`;
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      onChange(hex);
      setShowCustom(false);
      setCustomHex('');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {COLOR_PRESETS.map(color => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={`${dotSize} rounded-full border-2 transition-all ${
              value === color ? 'border-slate-800 scale-110' : 'border-transparent hover:border-slate-300'
            }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
        {/* 커스텀 색상 토글 버튼 */}
        <button
          type="button"
          onClick={() => setShowCustom(prev => !prev)}
          className={`${dotSize} rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:border-slate-500 hover:text-slate-600 transition-all text-xs`}
          title="직접 입력"
        >
          +
        </button>
      </div>

      {/* 커스텀 hex 입력 */}
      {showCustom && (
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-500">#</span>
            <input
              type="text"
              maxLength={6}
              placeholder="FF5733"
              value={customHex.replace('#', '')}
              onChange={e => setCustomHex(e.target.value.replace('#', ''))}
              onKeyDown={e => e.key === 'Enter' && handleCustomApply()}
              className="w-20 border border-slate-300 rounded px-2 py-1 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {customHex && /^[0-9A-Fa-f]{6}$/.test(customHex.replace('#', '')) && (
            <span
              className="w-5 h-5 rounded-full border border-slate-200"
              style={{ backgroundColor: `#${customHex.replace('#', '')}` }}
            />
          )}
          <button
            type="button"
            onClick={handleCustomApply}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            적용
          </button>
        </div>
      )}

      {/* 현재 선택된 색상이 프리셋에 없으면 표시 */}
      {value && !COLOR_PRESETS.includes(value) && (
        <div className="flex items-center gap-1.5 mt-1.5">
          <span
            className="w-4 h-4 rounded-full border border-slate-200"
            style={{ backgroundColor: value }}
          />
          <span className="text-xs text-slate-500 font-mono">{value}</span>
        </div>
      )}
    </div>
  );
}
