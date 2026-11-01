// Procedural LEGO brick sound synthesizer using Web Audio API

class SoundService {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  constructor() {
    const saved = localStorage.getItem('lego_sound_enabled');
    if (saved !== null) {
      this.soundEnabled = saved === 'true';
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  public toggleSound(): boolean {
    this.soundEnabled = !this.soundEnabled;
    localStorage.setItem('lego_sound_enabled', String(this.soundEnabled));
    if (this.soundEnabled) {
      this.playBrickSnap();
    }
    return this.soundEnabled;
  }

  /**
   * Sound of two LEGO bricks snapping together (crisp plastic click)
   */
  public playBrickSnap() {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // High frequency click
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.04);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);

      // Plastic snap overtone
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(2800, now);
      osc2.frequency.exponentialRampToValueAtTime(800, now + 0.025);

      gain2.gain.setValueAtTime(0.18, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);

      osc2.start(now);
      osc2.stop(now + 0.035);
    } catch {
      // Audio context might be restricted before user interaction
    }
  }

  /**
   * Happy celebratory chime when order is placed or account created
   */
  public playSuccessChime() {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const start = this.ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        const noteTime = start + idx * 0.08;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.15, noteTime);
        gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(noteTime);
        osc.stop(noteTime + 0.32);
      });
    } catch {
      // Ignored
    }
  }

  /**
   * Warning or lock chime
   */
  public playErrorChime() {
    if (!this.soundEnabled) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.setValueAtTime(220, now + 0.12);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.3);
    } catch {
      // Ignored
    }
  }
}

export const soundService = new SoundService();
