// DisasterOS Web Audio Emergency Sound Synthesizer
// Provides reliable, platform-agnostic siren and alert chimes without external asset dependencies.

class EmergencySoundService {
  private audioCtx: AudioContext | null = null;
  private activeOscillator: OscillatorNode | null = null;
  private isPlaying: boolean = false;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  // Play a distinctive high-priority siren pulse (4 sweeps)
  playEmergencySiren(durationSeconds = 4): boolean {
    const ctx = this.getAudioContext();
    if (!ctx) return false;

    try {
      this.stop();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      gain.gain.setValueAtTime(0.25, ctx.currentTime);

      // Emergency sweep between 850 Hz and 620 Hz
      const now = ctx.currentTime;
      const cycleDuration = 0.5; // half second per up-down sweep
      const cycles = Math.floor(durationSeconds / cycleDuration);

      for (let i = 0; i < cycles; i++) {
        const start = now + i * cycleDuration;
        const mid = start + cycleDuration / 2;
        const end = start + cycleDuration;

        osc.frequency.setValueAtTime(620, start);
        osc.frequency.linearRampToValueAtTime(880, mid);
        osc.frequency.linearRampToValueAtTime(620, end);
      }

      // Smooth fade out
      gain.gain.setValueAtTime(0.25, now + durationSeconds - 0.2);
      gain.gain.linearRampToValueAtTime(0.001, now + durationSeconds);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + durationSeconds);

      this.activeOscillator = osc;
      this.isPlaying = true;

      osc.onended = () => {
        this.isPlaying = false;
        this.activeOscillator = null;
      };

      return true;
    } catch (e) {
      console.warn('[Audio] Failed to synthesize emergency sound:', e);
      return false;
    }
  }

  // Soft pleasant chime for non-emergency status updates
  playStatusChime(): boolean {
    const ctx = this.getAudioContext();
    if (!ctx) return false;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const now = ctx.currentTime;

      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.2); // G5

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
      return true;
    } catch (e) {
      return false;
    }
  }

  stop() {
    if (this.activeOscillator) {
      try {
        this.activeOscillator.stop();
        this.activeOscillator.disconnect();
      } catch (e) {}
      this.activeOscillator = null;
    }
    this.isPlaying = false;
  }

  isSirenActive(): boolean {
    return this.isPlaying;
  }
}

export const emergencySound = new EmergencySoundService();
