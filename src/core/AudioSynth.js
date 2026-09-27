/**
 * AudioSynth - Procedural Web Audio Synthesizer for IVT 3D Adventure
 * Generates all sound effects and procedural lo-fi background music without any external audio files.
 */
export class AudioSynth {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.bgmGain = null;
    this.isMuted = false;
    this.bgmPlaying = false;
    this.bgmTimer = null;
    this.initialized = false;

    // Default volumes
    this.masterVolume = 0.7;
    this.sfxVolume = 0.8;
    this.bgmVolume = 0.35;

    // Auto unlock on first user gesture
    this._bindUnlock();
  }

  _bindUnlock() {
    const unlock = () => {
      this.init();
      window.removeEventListener('click', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('touchstart', unlock);
    };
    window.addEventListener('click', unlock, { once: false });
    window.addEventListener('keydown', unlock, { once: false });
    window.addEventListener('touchstart', unlock, { once: false });
  }

  init() {
    if (this.initialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      // Master output
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.masterVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // SFX bus
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      // BGM bus
      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);

      this.initialized = true;
    } catch (err) {
      console.warn('[AudioSynth] Web Audio initialization deferred or unsupported:', err);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      const target = this.isMuted ? 0 : this.masterVolume;
      this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  setMute(muteState) {
    this.isMuted = !!muteState;
    if (this.masterGain && this.ctx) {
      const target = this.isMuted ? 0 : this.masterVolume;
      this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.05);
    }
  }

  // --- SOUND EFFECTS ---

  /**
   * Footstep sound: subtle low thud with soft high click
   */
  footstep() {
    if (!this.initialized || this.isMuted) return;
    this.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(80 + Math.random() * 20, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.06);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, t);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.06);
  }

  /**
   * Pickup crate sound: friendly ascending pop/swoosh
   */
  pickup() {
    if (!this.initialized || this.isMuted) return;
    this.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(580, t + 0.12);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  /**
   * Drop or place crate on scale
   */
  placeItem() {
    if (!this.initialized || this.isMuted) return;
    this.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(450, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.14);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  /**
   * Retail POS Barcode Scanner: Crisp dual high beep (2400Hz -> 2750Hz)
   */
  posBeep() {
    if (!this.initialized || this.isMuted) return;
    this.resume();

    const t = this.ctx.currentTime;

    const playBeep = (freq, startOffset, duration) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, t + startOffset);

      gain.gain.setValueAtTime(0.18, t + startOffset);
      gain.gain.setValueAtTime(0.18, t + startOffset + duration - 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + startOffset + duration);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t + startOffset);
      osc.stop(t + startOffset + duration);
    };

    playBeep(2400, 0, 0.05);
    playBeep(2750, 0.065, 0.07);
  }

  /**
   * Bridge plank assembly: Metallic-wooden clank followed by cyber energy shimmer
   */
  bridgePlank() {
    if (!this.initialized || this.isMuted) return;
    this.resume();

    const t = this.ctx.currentTime;

    // 1. Thud / clank
    const thud = this.ctx.createOscillator();
    const thudGain = this.ctx.createGain();
    thud.type = 'triangle';
    thud.frequency.setValueAtTime(180, t);
    thud.frequency.exponentialRampToValueAtTime(45, t + 0.2);

    thudGain.gain.setValueAtTime(0.4, t);
    thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    thud.connect(thudGain);
    thudGain.connect(this.sfxGain);
    thud.start(t);
    thud.stop(t + 0.22);

    // 2. Cyber energy shimmer arpeggio
    const shimmerNotes = [523.25, 659.25, 783.99, 1046.5];
    shimmerNotes.forEach((freq, idx) => {
      const noteOsc = this.ctx.createOscillator();
      const noteGain = this.ctx.createGain();
      const startTime = t + 0.08 + idx * 0.06;

      noteOsc.type = 'sine';
      noteOsc.frequency.setValueAtTime(freq, startTime);

      noteGain.gain.setValueAtTime(0.15, startTime);
      noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

      noteOsc.connect(noteGain);
      noteGain.connect(this.sfxGain);

      noteOsc.start(startTime);
      noteOsc.stop(startTime + 0.25);
    });
  }

  /**
   * Correct Answer: Joyous C5 - E5 - G5 - C6 bright chord arpeggio
   */
  correctChord() {
    if (!this.initialized || this.isMuted) return;
    this.resume();

    const t = this.ctx.currentTime;
    const notes = [
      { f: 523.25, d: 0.0 }, // C5
      { f: 659.25, d: 0.08 }, // E5
      { f: 783.99, d: 0.16 }, // G5
      { f: 1046.5, d: 0.24 }, // C6
    ];

    notes.forEach(({ f, d }) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = t + d;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, startTime);

      gain.gain.setValueAtTime(0.28, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startTime);
      osc.stop(startTime + 0.5);
    });
  }

  /**
   * Wrong Answer: Low descending buzz (Sawtooth wave with slight growl)
   */
  wrongBuzz() {
    if (!this.initialized || this.isMuted) return;
    this.resume();

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.linearRampToValueAtTime(80, t + 0.35);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, t);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.38);
  }

  /**
   * Electronic weighing scale chime
   */
  scaleSuccess() {
    if (!this.initialized || this.isMuted) return;
    this.resume();

    const t = this.ctx.currentTime;
    const playTone = (freq, delay) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + delay);

      gain.gain.setValueAtTime(0.2, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.22);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t + delay);
      osc.stop(t + delay + 0.22);
    };

    playTone(880, 0);
    playTone(1320, 0.1);
  }

  /**
   * Grand fanfare when all 6 bridge segments are built
   */
  bridgeCompletedFanfare() {
    if (!this.initialized || this.isMuted) return;
    this.resume();

    const t = this.ctx.currentTime;
    const chordSeq = [
      { chord: [523.25, 659.25, 783.99], time: 0.0, dur: 0.25 },
      { chord: [587.33, 739.99, 880.00], time: 0.25, dur: 0.25 },
      { chord: [659.25, 830.61, 987.77], time: 0.50, dur: 0.3 },
      { chord: [783.99, 987.77, 1174.66, 1567.98], time: 0.85, dur: 0.8 }
    ];

    chordSeq.forEach(({ chord, time, dur }) => {
      chord.forEach(f => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const st = t + time;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, st);

        gain.gain.setValueAtTime(0.18, st);
        gain.gain.exponentialRampToValueAtTime(0.001, st + dur);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(st);
        osc.stop(st + dur);
      });
    });
  }

  // --- PROCEDURAL F&B LO-FI BGM ---

  /**
   * Start looping soft chill Lo-fi BGM (F&B Coffee House vibe)
   */
  startBGM() {
    if (this.bgmPlaying) return;
    this.init();
    this.resume();
    this.bgmPlaying = true;

    // Chords: Dm9 -> G13 -> Cmaj9 -> Am7
    const chords = [
      [146.83, 220.00, 261.63, 329.63, 392.00], // Dm9 (D3, A3, C4, E4, G4)
      [196.00, 246.94, 329.63, 392.00, 440.00], // G13 (G3, B3, E4, G4, A4)
      [130.81, 196.00, 246.94, 329.63, 392.00], // Cmaj9 (C3, G3, B3, E4, G4)
      [220.00, 261.63, 329.63, 392.00, 523.25], // Am7 (A3, C4, E4, G4, C5)
    ];

    const melodyScale = [329.63, 392.00, 440.00, 523.25, 587.33, 659.25]; // C pentatonic

    let step = 0;
    const stepDuration = 1.6; // seconds per chord

    const playChordStep = () => {
      if (!this.bgmPlaying || !this.ctx) return;

      const chord = chords[step % chords.length];
      const t = this.ctx.currentTime;

      // Play soft warm electric piano chord
      chord.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = i === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(650, t);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.08, t + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.0005, t + stepDuration * 0.95);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.bgmGain);

        osc.start(t);
        osc.stop(t + stepDuration);
      });

      // Play light procedural lo-fi kick on beat 1
      this._playLofiKick(t);

      // Play light brush snare on beat 2
      this._playLofiBrush(t + stepDuration * 0.5);

      // Play gentle lofi melody note with 70% probability
      if (Math.random() > 0.3) {
        const note = melodyScale[Math.floor(Math.random() * melodyScale.length)];
        const melodyTime = t + (Math.random() > 0.5 ? stepDuration * 0.25 : stepDuration * 0.75);
        this._playLofiMelodyNote(note, melodyTime);
      }

      step++;
      this.bgmTimer = setTimeout(playChordStep, stepDuration * 1000);
    };

    playChordStep();
  }

  _playLofiKick(time) {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, time);
    osc.frequency.exponentialRampToValueAtTime(35, time + 0.15);

    gain.gain.setValueAtTime(0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

    osc.connect(gain);
    gain.connect(this.bgmGain);

    osc.start(time);
    osc.stop(time + 0.18);
  }

  _playLofiBrush(time) {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, time);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, time);
    filter.Q.setValueAtTime(1.5, time);

    gain.gain.setValueAtTime(0.04, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.12);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.bgmGain);

    osc.start(time);
    osc.stop(time + 0.12);
  }

  _playLofiMelodyNote(freq, time) {
    if (!this.ctx || this.isMuted) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, time);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.07, time + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.6);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.bgmGain);

    osc.start(time);
    osc.stop(time + 0.6);
  }

  stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  toggleBGM() {
    if (this.bgmPlaying) {
      this.stopBGM();
    } else {
      this.startBGM();
    }
    return this.bgmPlaying;
  }
}
