import { useEffect, useRef } from 'react';

interface TimerCompletedModalProps {
  /** 완료된 태스크 이름 (null이면 모달 숨김) */
  taskName: string | null;
  /** 모달 닫기 */
  onClose: () => void;
}

/**
 * 타이머 완료 팝업 모달
 *
 * 타이머가 종료되면 화면 중앙에 표시된다.
 * 사용자가 직접 확인 버튼을 눌러야만 닫힌다.
 * 다른 탭에 있다가 돌아와도 모달이 유지되어 완료를 인지할 수 있다.
 */
export default function TimerCompletedModal({ taskName, onClose }: TimerCompletedModalProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  // 모달이 열리면 확인 버튼에 포커스
  useEffect(() => {
    if (taskName) {
      buttonRef.current?.focus();
    }
  }, [taskName]);

  if (!taskName) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4 text-center animate-bounce-in">
        {/* 아이콘 */}
        <div className="text-6xl mb-4">⏰</div>

        {/* 제목 */}
        <h2 className="text-xl font-bold text-slate-800 mb-2">타이머 완료!</h2>

        {/* 태스크명 */}
        <p className="text-base text-slate-600 mb-6">
          <span className="font-semibold text-blue-600">"{taskName}"</span> 타이머가
          완료되었습니다.
        </p>

        {/* 확인 버튼 */}
        <button
          ref={buttonRef}
          onClick={onClose}
          className="w-full bg-blue-600 text-white py-3 rounded-xl text-base font-semibold hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          확인
        </button>
      </div>
    </div>
  );
}
