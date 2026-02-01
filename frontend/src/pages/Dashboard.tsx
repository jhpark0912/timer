import { useTasks } from '../hooks/useTasks';
import { useTimer } from '../hooks/useTimer';
import { useNotification } from '../hooks/useNotification';
import { useAlertSettings } from '../hooks/useAlertSettings';
import { useToast, ToastContainer } from '../components/Toast';
import TimerDisplay from '../components/TimerDisplay';
import TaskList from '../components/TaskList';
import NotificationBanner from '../components/NotificationBanner';

export default function Dashboard() {
  const { tasks, loading, error, deleteTask } = useTasks();
  const { permission, requestPermission, showNotification } = useNotification();
  const { settings } = useAlertSettings();
  const { toasts, showToast, removeToast } = useToast();

  const { session, displayRemaining, error: timerError, start, pause, resume, stop } = useTimer({
    alertSettings: settings,
    showNotification,
    showToast,
    notificationPermission: permission,
  });

  const handleStartTimer = async (taskId: number, duration: number) => {
    await start(taskId, duration);
  };

  if (loading) return <p className="text-center text-slate-400 py-8">로딩 중...</p>;
  if (error) return <p className="text-center text-red-500 py-8">{error}</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-800">대시보드</h1>

      <NotificationBanner
        permission={permission}
        onRequestPermission={requestPermission}
      />

      {timerError && (
        <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{timerError}</p>
      )}

      <TimerDisplay
        session={session}
        displayRemaining={displayRemaining}
        onPause={pause}
        onResume={resume}
        onStop={stop}
      />

      <div>
        <h2 className="text-lg font-semibold text-slate-700 mb-3">항목 목록</h2>
        <TaskList
          tasks={tasks}
          onDelete={deleteTask}
          onStartTimer={handleStartTimer}
          activeTaskId={session?.taskId ?? null}
        />
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
