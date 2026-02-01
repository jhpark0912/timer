/**
 * 알림음 유틸리티
 *
 * Web Audio API를 사용하여 프로그래매틱으로 알림음을 생성한다.
 * 외부 오디오 파일 없이 비프음을 재생할 수 있다.
 */

let audioContext: AudioContext | null = null;

/** AudioContext 싱글톤 (사용자 제스처 후 생성) */
function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  // suspended 상태면 resume
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  return audioContext;
}

/**
 * 알림 비프음 재생
 * @param volume 볼륨 (0.0 ~ 1.0)
 */
export function playAlertSound(volume = 0.5): void {
  try {
    const ctx = getAudioContext();

    // 첫 번째 톤: 880Hz (A5)
    playTone(ctx, 880, 0.15, volume, 0);
    // 두 번째 톤: 1046.5Hz (C6) - 약간의 딜레이
    playTone(ctx, 1046.5, 0.15, volume, 0.2);
    // 세 번째 톤: 880Hz (A5) - 반복
    playTone(ctx, 880, 0.25, volume, 0.45);
  } catch {
    // Web Audio API 미지원 시 무시
  }
}

/** 단일 톤 재생 */
function playTone(
  ctx: AudioContext,
  frequency: number,
  duration: number,
  volume: number,
  startDelay: number,
): void {
  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(ctx.destination);

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime + startDelay);

  // 부드러운 시작/종료 (클릭음 방지)
  gainNode.gain.setValueAtTime(0, ctx.currentTime + startDelay);
  gainNode.gain.linearRampToValueAtTime(volume, ctx.currentTime + startDelay + 0.02);
  gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + startDelay + duration);

  oscillator.start(ctx.currentTime + startDelay);
  oscillator.stop(ctx.currentTime + startDelay + duration);
}
