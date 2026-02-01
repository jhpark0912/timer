/**
 * 타이머 Web Worker
 *
 * 메인 스레드와 분리하여 카운트다운 연산을 수행한다.
 * 브라우저 탭 비활성 시에도 쓰로틀링 없이 정확한 타이밍을 유지한다.
 */

/** Worker로 전달되는 명령 메시지 타입 */
interface WorkerCommand {
  type: 'START' | 'PAUSE' | 'RESUME' | 'STOP';
  remaining?: number; // START 시 남은 시간(초)
  taskName?: string;  // START 시 태스크 이름
}

/** Worker에서 메인 스레드로 전달되는 메시지 타입 */
interface WorkerMessage {
  type: 'TICK' | 'COMPLETED';
  remaining: number;
  taskName: string;
}

let timerId: ReturnType<typeof setInterval> | null = null;
let remaining = 0;
let taskName = '';

/** 1초마다 카운트다운하여 메인 스레드에 전달 */
function startCountdown() {
  stopCountdown();

  timerId = setInterval(() => {
    remaining = Math.max(0, remaining - 1);

    const msg: WorkerMessage = { type: 'TICK', remaining, taskName };
    self.postMessage(msg);

    if (remaining <= 0) {
      stopCountdown();
      const completedMsg: WorkerMessage = { type: 'COMPLETED', remaining: 0, taskName };
      self.postMessage(completedMsg);
    }
  }, 1000);
}

function stopCountdown() {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }
}

self.onmessage = (e: MessageEvent<WorkerCommand>) => {
  const { type } = e.data;

  switch (type) {
    case 'START':
      remaining = e.data.remaining ?? 0;
      taskName = e.data.taskName ?? '';
      startCountdown();
      break;

    case 'PAUSE':
      stopCountdown();
      break;

    case 'RESUME':
      if (e.data.remaining !== undefined) {
        remaining = e.data.remaining;
      }
      startCountdown();
      break;

    case 'STOP':
      stopCountdown();
      remaining = 0;
      break;
  }
};
