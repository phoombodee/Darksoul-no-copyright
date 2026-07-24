// Sound Engine using Web Audio API for menu sound FX and ambient music synthesizer
import { AudioSettings } from '../types';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isBgmPlaying = false;
  private bgmOscillatorInterval: number | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public updateVolumes(audio: AudioSettings) {
    if (!this.ctx) return;
    const master = audio.muteAll || !audio.soundEnabled ? 0 : audio.masterVolume / 100;
    const sfx = (audio.sfxVolume / 100) * master;
    const music = (audio.musicVolume / 100) * master;

    if (this.sfxGain) {
      this.sfxGain.gain.setTargetAtTime(sfx, this.ctx.currentTime, 0.05);
    }
    if (this.musicGain) {
      this.musicGain.gain.setTargetAtTime(music, this.ctx.currentTime, 0.05);
    }
  }

  public playHoverSound(audio: AudioSettings) {
    if (audio.muteAll || !audio.soundEnabled || audio.sfxVolume === 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const master = audio.masterVolume / 100;
      const vol = (audio.sfxVolume / 100) * master * 0.15;
      if (vol <= 0) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {
      // Audio fallback
    }
  }

  public playClickSound(audio: AudioSettings) {
    if (audio.muteAll || !audio.soundEnabled || audio.sfxVolume === 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const master = audio.masterVolume / 100;
      const vol = (audio.sfxVolume / 100) * master * 0.25;
      if (vol <= 0) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.09);
    } catch {
      // Audio fallback
    }
  }

  public playKeyRemapSound(audio: AudioSettings) {
    if (audio.muteAll || !audio.soundEnabled || audio.sfxVolume === 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const master = audio.masterVolume / 100;
      const vol = (audio.sfxVolume / 100) * master * 0.3;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, this.ctx.currentTime + 0.06); // E5
      osc.frequency.setValueAtTime(783.99, this.ctx.currentTime + 0.12); // G5

      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.22);
    } catch {
      // Audio fallback
    }
  }

  public playJumpSound(audio: AudioSettings) {
    if (audio.muteAll || !audio.soundEnabled || audio.sfxVolume === 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const master = audio.masterVolume / 100;
      const vol = (audio.sfxVolume / 100) * master * 0.25;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(660, this.ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.16);
    } catch {
      // Audio fallback
    }
  }

  public playAttackSound(audio: AudioSettings) {
    if (audio.muteAll || !audio.soundEnabled || audio.sfxVolume === 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const master = audio.masterVolume / 100;
      const vol = (audio.sfxVolume / 100) * master * 0.3;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, this.ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.11);
    } catch {
      // Audio fallback
    }
  }

  public playDanceSkillSound(audio: AudioSettings) {
    if (audio.muteAll || !audio.soundEnabled || audio.sfxVolume === 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const master = audio.masterVolume / 100;
      const vol = (audio.sfxVolume / 100) * master * 0.35;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, this.ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(1046.5, this.ctx.currentTime + 0.3); // C6

      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.36);
    } catch {
      // Audio fallback
    }
  }

  public playHealSound(audio: AudioSettings) {
    if (audio.muteAll || !audio.soundEnabled || audio.sfxVolume === 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const master = audio.masterVolume / 100;
      const vol = (audio.sfxVolume / 100) * master * 0.35;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime); // A4
      osc.frequency.setValueAtTime(554.37, this.ctx.currentTime + 0.08); // C#5
      osc.frequency.setValueAtTime(659.25, this.ctx.currentTime + 0.16); // E5
      osc.frequency.setValueAtTime(880, this.ctx.currentTime + 0.24); // A5

      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.36);
    } catch {
      // Audio fallback
    }
  }

  public playDamageSound(audio: AudioSettings) {
    if (audio.muteAll || !audio.soundEnabled || audio.sfxVolume === 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const master = audio.masterVolume / 100;
      const vol = (audio.sfxVolume / 100) * master * 0.4;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.23);
    } catch {
      // Audio fallback
    }
  }

  public playEnemyDeathSound(audio: AudioSettings) {
    if (audio.muteAll || !audio.soundEnabled || audio.sfxVolume === 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const master = audio.masterVolume / 100;
      const vol = (audio.sfxVolume / 100) * master * 0.35;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(350, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.29);
    } catch {
      // Audio fallback
    }
  }

  public playGameOverSound(audio: AudioSettings) {
    if (audio.muteAll || !audio.soundEnabled || audio.sfxVolume === 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const master = audio.masterVolume / 100;
      const vol = (audio.sfxVolume / 100) * master * 0.45;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(300, this.ctx.currentTime);
      osc.frequency.setValueAtTime(250, this.ctx.currentTime + 0.2);
      osc.frequency.setValueAtTime(200, this.ctx.currentTime + 0.4);
      osc.frequency.setValueAtTime(150, this.ctx.currentTime + 0.6);

      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.9);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.95);
    } catch {
      // Audio fallback
    }
  }

  public playFireballSound(audio: AudioSettings) {
    if (audio.muteAll || !audio.soundEnabled || audio.sfxVolume === 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const master = audio.masterVolume / 100;
      const vol = (audio.sfxVolume / 100) * master * 0.4;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(380, this.ctx.currentTime + 0.15);
      osc.frequency.exponentialRampToValueAtTime(90, this.ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.32);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.33);
    } catch {
      // Audio fallback
    }
  }

  public playBossSpawnSound(audio: AudioSettings) {
    if (audio.muteAll || !audio.soundEnabled || audio.sfxVolume === 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const master = audio.masterVolume / 100;
      const vol = (audio.sfxVolume / 100) * master * 0.5;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(300, this.ctx.currentTime + 0.5);
      osc.frequency.linearRampToValueAtTime(150, this.ctx.currentTime + 1.0);

      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 1.25);
    } catch {
      // Audio fallback
    }
  }

  public playWarpSound(audio: AudioSettings) {
    if (audio.muteAll || !audio.soundEnabled || audio.sfxVolume === 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const master = audio.masterVolume / 100;
      const vol = (audio.sfxVolume / 100) * master * 0.4;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.4);

      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.45);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.46);
    } catch {
      // Audio fallback
    }
  }

  public playVictorySound(audio: AudioSettings) {
    if (audio.muteAll || !audio.soundEnabled || audio.sfxVolume === 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const master = audio.masterVolume / 100;
      const vol = (audio.sfxVolume / 100) * master * 0.5;

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.15);

        gain.gain.setValueAtTime(vol, this.ctx.currentTime + idx * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.15 + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(this.ctx.currentTime + idx * 0.15);
        osc.stop(this.ctx.currentTime + idx * 0.15 + 0.42);
      });
    } catch {
      // Audio fallback
    }
  }

  public playDashSound(audio: AudioSettings) {
    if (audio.muteAll || !audio.soundEnabled || audio.sfxVolume === 0) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      const master = audio.masterVolume / 100;
      const vol = (audio.sfxVolume / 100) * master * 0.25;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(900, this.ctx.currentTime + 0.05);
      osc.frequency.linearRampToValueAtTime(200, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(vol, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.13);
    } catch {
      // Audio fallback
    }
  }

  public startAmbientBgm(audio: AudioSettings) {
    if (this.isBgmPlaying) return;
    this.initContext();
    if (!this.ctx) return;

    try {
      this.isBgmPlaying = true;
      // Synthesize ambient synth pads
      const notes = [130.81, 164.81, 196.00, 246.94]; // C3, E3, G3, B3
      let step = 0;

      this.bgmOscillatorInterval = window.setInterval(() => {
        if (!this.ctx || audio.muteAll || !audio.soundEnabled || audio.musicVolume === 0) return;
        
        const freq = notes[step % notes.length];
        step++;

        const master = audio.masterVolume / 100;
        const vol = (audio.musicVolume / 100) * master * 0.08;
        if (vol <= 0) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

        gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 1.0);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 3.0);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + 3.1);
      }, 2500);
    } catch {
      // Audio fallback
    }
  }

  public stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmOscillatorInterval !== null) {
      clearInterval(this.bgmOscillatorInterval);
      this.bgmOscillatorInterval = null;
    }
  }
}

export const soundEngine = new SoundEngine();
