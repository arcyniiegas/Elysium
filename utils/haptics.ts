
/**
 * Elysium Synthetic Haptic Engine (v2.0)
 */

let audioCtx: AudioContext | null = null;

const getCtx = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

const createPulse = (freq: number, endFreq: number, duration: number, volume: number, type: OscillatorType = 'sine') => {
  const ctx = getCtx();
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  osc.frequency.exponentialRampToValueAtTime(endFreq || 0.001, now + duration);

  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration);
};

export const Haptics = {
  selection: async () => {
    if (navigator.vibrate) navigator.vibrate(5);
    createPulse(1800, 600, 0.015, 0.12, 'sine');
  },
  impactHeavy: async () => {
    if (navigator.vibrate) navigator.vibrate(30);
    createPulse(65, 15, 0.12, 0.85, 'sine');
  },
  notificationError: async () => {
    if (navigator.vibrate) navigator.vibrate([40, 30, 40]);
    const now = performance.now();
    [0, 80, 160].forEach(delay => {
      setTimeout(() => createPulse(140, 40, 0.06, 0.5, 'square'), delay);
    });
  },
  notificationSuccess: async () => {
    if (navigator.vibrate) navigator.vibrate([80, 40, 80]);
    createPulse(440, 880, 0.15, 0.35, 'sine');
    setTimeout(() => createPulse(660, 1320, 0.15, 0.25, 'sine'), 100);
  }
};
