import { useState, useEffect, useCallback } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useTimer } from '../hooks/useTimer';
import { useNotification } from '../hooks/useNotification';
import { useAlertSettings } from '../hooks/useAlertSettings';
import { useUserProfile } from '../hooks/useUserProfile';
import { useToast, ToastContainer } from '../components/Toast';
import { timetreeApi, activityLogApi } from '../api/client';
import TimerDisplay from '../components/TimerDisplay';
import TimerCompletedModal from '../components/TimerCompletedModal';
import TimeTree from '../components/TimeTree';
import ManualLogModal from '../components/ManualLogModal';
import NotificationBanner from '../components/NotificationBanner';
import type { DailyTimeTreeResponse, TimeTreeBlock, ActivityLogCreateRequest } from '../types';
import { useTimerPresets } from '../hooks/useTimerPresets';
import type { Task, TimerPreset } from '../types';

/** 타이머 시작 패널: 태스크 선택 + 시간 입력/프리셋 */
function TimerStartPanel({
  tasks,
  presets,
  onStart,
}: {
  tasks: Task[];
  presets: TimerPreset[];
  onStart: (taskId: number, duration: number) => Promise<void>;
}) {
  const [selectedTaskId, setSelectedTaskId] = useState<number | ''>('');
  const [customMinutes, setCustomMinutes] = useState('');
  const [starting, setStarting] = useState(false);

  const handlePresetStart = async (minutes: number) => {
    if (!selectedTaskId) return;
    setStarting(true);
    try {
      await onStart(selectedTaskId as number, minutes * 60);
    } finally {
      setStarting(false);
    }
  };

  const handleCustomStart = async () => {
    if (!selectedTaskId || !customMinutes) return;
    const mins = parseInt(customMinutes, 10);
    if (isNaN(mins) || mins <= 0) return;
    setStarting(true);
    try {
      await onStart(selectedTaskId as number, mins * 60);
    } finally {
      setStarting(false);
      setCustomMinutes('');
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <h2 className="text-sm font-semibold text-slate-700 mb-3">타이머 시작</h2>

      {/* 태스크 선택 */}
      <select
        value={selectedTaskId}
        onChange={e => setSelectedTaskId(e.target.value ? Number(e.target.value) : '')}
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-700 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="">태스크를 선택하세요</option>
        {tasks.map(t => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>

      {/* 프리셋 버튼 */}
      <div className="flex flex-wrap gap-2 mb-3">
        {presets.map(preset => (
          <button
            key={preset.minutes}
            onClick={() => handlePresetStart(preset.minutes)}
            disabled={!selectedTaskId || starting}
            className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* 직접 입력 */}
      <div className="flex gap-2">
        <input
          type="number"
          min="1"
          placeholder="직접 입력 (분)"
          value={customMinutes}
          onChange={e => setCustomMinutes(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCustomStart()}
          className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <button
          onClick={handleCustomStart}
          disabled={!selectedTaskId || !customMinutes || starting}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          시작
        </button>
      </div>
    </div>
  );
}

/** 초를 "Xh Ym" 형태로 변환 */
function formatDuration(seconds: number): string {
  if (seconds === 0) return '-';
  if (seconds < 60) return `${seconds}초`;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function Dashboard() {
  const { tasks, loading, error } = useTasks();
  const { permission, requestPermission, showNotification } = useNotification();
  const { settings } = useAlertSettings();
  const { toasts, showToast, removeToast } = useToast();
  const { presets } = useTimerPresets();
  const { profile, loading: profileLoading, saveNickname } = useUserProfile();

  // 최초 접근 시 닉네임 입력 상태
  const [nicknameInput, setNicknameInput] = useState('');

  const { session, displayRemaining, error: timerError, start, pause, resume, stop, completedTaskName, dismissCompleted } = useTimer({
    alertSettings: settings,
    showNotification,
    showToast,
    notificationPermission: permission,
  });

  // 오늘 타임 트리 데이터
  const [treeData, setTreeData] = useState<DailyTimeTreeResponse | null>(null);

  // 수동 기록 모달
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStartTime, setModalStartTime] = useState<string | undefined>();

  // 블록 상세
  const [selectedBlock, setSelectedBlock] = useState<TimeTreeBlock | null>(null);

  const fetchTodayTree = useCallback(async () => {
    try {
      const data = await timetreeApi.getDaily(today());
      setTreeData(data);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchTodayTree();
  }, [fetchTodayTree]);

  // 타이머 종료 후 타임 트리 갱신
  const handleStop = async (completed?: boolean) => {
    await stop(completed);
    // 약간의 지연 후 갱신 (ActivityLog 생성 대기)
    setTimeout(fetchTodayTree, 500);
  };

  const handleStartTimer = async (taskId: number, duration: number) => {
    await start(taskId, duration);
  };

  const handleEmptySlotClick = (time: string) => {
    setModalStartTime(time);
    setModalOpen(true);
  };

  const handleModalSubmit = async (data: ActivityLogCreateRequest) => {
    await activityLogApi.create(data);
    await fetchTodayTree();
  };

  // 즐겨찾기 항목
  const favoriteTasks = tasks.filter(t => t.isFavorite && t.isActive);

  if (loading || profileLoading) return <p className="text-center text-slate-400 py-8">로딩 중...</p>;
  if (error) return <p className="text-center text-red-500 py-8">{error}</p>;

  return (
    <div className="space-y-6">
      {/* 닉네임 미설정 시 입력 모달 */}
      {!profile && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm mx-4">
            <h2 className="text-lg font-bold text-slate-800 mb-2">반갑습니다!</h2>
            <p className="text-sm text-slate-500 mb-4">사용할 이름 또는 닉네임을 입력해주세요.</p>
            <input
              type="text"
              placeholder="이름 또는 닉네임"
              value={nicknameInput}
              onChange={e => setNicknameInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && nicknameInput.trim()) {
                  saveNickname(nicknameInput);
                  setNicknameInput('');
                }
              }}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-3"
              autoFocus
            />
            <button
              onClick={() => {
                if (nicknameInput.trim()) {
                  saveNickname(nicknameInput);
                  setNicknameInput('');
                }
              }}
              disabled={!nicknameInput.trim()}
              className="w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              시작하기
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">
          {profile ? `환영합니다, ${profile.nickname}님` : '대시보드'}
        </h1>
      </div>

      <NotificationBanner
        permission={permission}
        onRequestPermission={requestPermission}
      />

      {timerError && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{timerError}</p>
      )}

      {/* 오늘의 요약 */}
      {treeData && treeData.summary.totalSeconds > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-700">오늘의 활동</span>
            <span className="text-lg font-bold text-slate-800">
              {formatDuration(treeData.summary.totalSeconds)}
            </span>
          </div>
        </div>
      )}

      {/* 타이머 + 타임 트리 (2컬럼) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 왼쪽: 현재 타이머 + 타이머 시작 */}
        <div className="space-y-4">
          <TimerDisplay
            session={session}
            displayRemaining={displayRemaining}
            onPause={pause}
            onResume={resume}
            onStop={handleStop}
          />

          {/* 타이머 시작 패널 */}
          {!session && (
            <TimerStartPanel
              tasks={tasks}
              presets={presets}
              onStart={handleStartTimer}
            />
          )}
        </div>

        {/* 오른쪽: 오늘의 타임 트리 (compact) */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-slate-700">오늘의 타임 트리</h2>
            <button
              onClick={fetchTodayTree}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              새로고침
            </button>
          </div>
          {treeData ? (
            treeData.blocks.length > 0 ? (
              <TimeTree
                date={treeData.date}
                blocks={treeData.blocks}
                onBlockClick={setSelectedBlock}
                onEmptySlotClick={handleEmptySlotClick}
                viewMode="compact"
              />
            ) : (
              <div className="h-32 flex items-center justify-center">
                <span className="text-sm text-slate-400">오늘 아직 기록이 없습니다</span>
              </div>
            )
          ) : (
            <div className="h-32 flex items-center justify-center">
              <span className="text-sm text-slate-400">로딩 중...</span>
            </div>
          )}
        </div>
      </div>

      {/* 블록 상세 */}
      {selectedBlock && (
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-slate-800">활동 상세</h3>
            <button onClick={() => setSelectedBlock(null)} className="text-slate-400 hover:text-slate-600 text-sm">&times;</button>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedBlock.colorCode || '#6B7280' }} />
              <span className="font-medium text-slate-800">{selectedBlock.taskName}</span>
            </div>
            <div className="text-slate-600">
              {selectedBlock.startedAt.slice(11, 16)} ~ {selectedBlock.endedAt.slice(11, 16)}
              ({formatDuration(selectedBlock.durationSeconds)})
            </div>
            <div className="text-slate-500">
              출처: {selectedBlock.source === 'TIMER' ? '🕐 타이머' : '✏️ 수동'}
              {selectedBlock.memo && <span className="ml-2">메모: {selectedBlock.memo}</span>}
            </div>
          </div>
        </div>
      )}

      {/* 빠른 기록 */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h2 className="text-sm font-semibold text-slate-700 mb-3">빠른 기록</h2>

        {favoriteTasks.length > 0 ? (
          <div className="space-y-2">
            {favoriteTasks.map(task => (
              <div key={task.id} className="flex items-center gap-2 flex-wrap">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: task.colorCode || '#6B7280' }}
                />
                <span className="text-sm font-medium text-slate-700 min-w-[80px]">{task.name}</span>
                {/* 타이머 프리셋 버튼 */}
                {presets.map(preset => (
                  <button
                    key={preset.minutes}
                    onClick={() => handleStartTimer(task.id, preset.minutes * 60)}
                    disabled={session !== null}
                    className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs hover:bg-slate-200 disabled:opacity-40"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 mb-2">
            즐겨찾기 항목이 없습니다. 항목 관리에서 즐겨찾기를 설정하세요.
          </p>
        )}

        <button
          onClick={() => { setModalStartTime(undefined); setModalOpen(true); }}
          className="mt-3 bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
        >
          + 수동 입력
        </button>
      </div>

      {/* 수동 기록 모달 */}
      <ManualLogModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        tasks={tasks}
        date={today()}
        initialStartTime={modalStartTime}
      />

      {/* 타이머 완료 팝업 */}
      <TimerCompletedModal
        taskName={completedTaskName}
        onClose={dismissCompleted}
      />

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
