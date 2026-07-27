/**
 * Binaural Beats Studio - Real-Time Web Audio API Synthesizer with Real Rain, Birds & Thunder MP3
 */

export class BinauralEngine {
  constructor() {
    this.audioCtx = null;
    this.isPlaying = false;

    // Oscillators & Stereo Panners
    this.oscLeft = null;
    this.oscRight = null;
    this.panLeft = null;
    this.panRight = null;

    // Master Gain & Analyser Node
    this.masterGain = null;
    this.analyser = null;

    // Synthetic Ambient Noise Generators
    this.pinkGain = null;
    this.brownGain = null;
    this.pinkSource = null;
    this.brownSource = null;

    // Real Rain MP3 Integration
    this.rainAudioEl = null;
    this.rainSourceNode = null;
    this.rainGain = null;
    this.realRainVol = 0.5;

    // Birds Chirping MP3 Integration
    this.birdsAudioEl = null;
    this.birdsSourceNode = null;
    this.birdsGain = null;
    this.birdsVol = 0.3;

    // Thunderstorm MP3 Integration
    this.thunderAudioEl = null;
    this.thunderSourceNode = null;
    this.thunderGain = null;
    this.thunderVol = 0.4; // Default 40%

    // Audio Parameters
    this.carrierFreq = 200; // Hz
    this.beatFreq = 10;     // Hz (Alpha default)
    this.masterVol = 0.5;
    this.waveform = "sine";

    // Session Timer
    this.timerInterval = null;
    this.timerSecondsRemaining = 0;

    this.initAudioElements();
  }

  initAudioElements() {
    if (!this.rainAudioEl) {
      this.rainAudioEl = new Audio("audio/rain.mp3");
      this.rainAudioEl.loop = true;
      this.rainAudioEl.crossOrigin = "anonymous";
    }

    if (!this.birdsAudioEl) {
      this.birdsAudioEl = new Audio("audio/birds.mp3");
      this.birdsAudioEl.loop = true;
      this.birdsAudioEl.crossOrigin = "anonymous";
    }

    if (!this.thunderAudioEl) {
      this.thunderAudioEl = new Audio("audio/thunder.mp3");
      this.thunderAudioEl.loop = true;
      this.thunderAudioEl.crossOrigin = "anonymous";
    }
  }

  initContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  }

  start() {
    this.initContext();
    if (this.isPlaying) return;

    const now = this.audioCtx.currentTime;

    // Master Gain Node & Analyser Node
    this.masterGain = this.audioCtx.createGain();
    this.masterGain.gain.setValueAtTime(this.masterVol, now);

    this.analyser = this.audioCtx.createAnalyser();
    this.analyser.fftSize = 2048;

    this.masterGain.connect(this.analyser);
    this.analyser.connect(this.audioCtx.destination);

    // Left Channel (Carrier Pitch)
    this.oscLeft = this.audioCtx.createOscillator();
    this.oscLeft.type = this.waveform;
    this.oscLeft.frequency.setValueAtTime(this.carrierFreq, now);

    this.panLeft = this.audioCtx.createStereoPanner ? this.audioCtx.createStereoPanner() : null;
    if (this.panLeft) {
      this.panLeft.pan.setValueAtTime(-1, now); // Left Ear
      this.oscLeft.connect(this.panLeft);
      this.panLeft.connect(this.masterGain);
    } else {
      this.oscLeft.connect(this.masterGain);
    }

    // Right Channel (Carrier + Beat Frequency Offset)
    this.oscRight = this.audioCtx.createOscillator();
    this.oscRight.type = this.waveform;
    this.oscRight.frequency.setValueAtTime(this.carrierFreq + this.beatFreq, now);

    this.panRight = this.audioCtx.createStereoPanner ? this.audioCtx.createStereoPanner() : null;
    if (this.panRight) {
      this.panRight.pan.setValueAtTime(1, now); // Right Ear
      this.oscRight.connect(this.panRight);
      this.panRight.connect(this.masterGain);
    } else {
      this.oscRight.connect(this.masterGain);
    }

    this.oscLeft.start(now);
    this.oscRight.start(now);

    // Setup Synthetic Ambient Rain & Ocean Layers
    this.setupAmbientNoise();

    // Connect Real MP3 Audio Elements to Audio Graph
    this.setupRealAudioNodes();

    this.isPlaying = true;
  }

  setupRealAudioNodes() {
    if (!this.audioCtx) return;

    // Real Rain Node
    if (this.rainAudioEl) {
      if (!this.rainSourceNode) {
        try {
          this.rainSourceNode = this.audioCtx.createMediaElementSource(this.rainAudioEl);
        } catch (e) {}
      }
      this.rainGain = this.audioCtx.createGain();
      this.rainGain.gain.value = this.realRainVol;

      if (this.rainSourceNode) {
        this.rainSourceNode.connect(this.rainGain);
        this.rainGain.connect(this.masterGain);
      }
      this.rainAudioEl.play().catch(() => {});
    }

    // Birds Chirping Node
    if (this.birdsAudioEl) {
      if (!this.birdsSourceNode) {
        try {
          this.birdsSourceNode = this.audioCtx.createMediaElementSource(this.birdsAudioEl);
        } catch (e) {}
      }
      this.birdsGain = this.audioCtx.createGain();
      this.birdsGain.gain.value = this.birdsVol;

      if (this.birdsSourceNode) {
        this.birdsSourceNode.connect(this.birdsGain);
        this.birdsGain.connect(this.masterGain);
      }
      this.birdsAudioEl.play().catch(() => {});
    }

    // Thunderstorm Node
    if (this.thunderAudioEl) {
      if (!this.thunderSourceNode) {
        try {
          this.thunderSourceNode = this.audioCtx.createMediaElementSource(this.thunderAudioEl);
        } catch (e) {}
      }
      this.thunderGain = this.audioCtx.createGain();
      this.thunderGain.gain.value = this.thunderVol;

      if (this.thunderSourceNode) {
        this.thunderSourceNode.connect(this.thunderGain);
        this.thunderGain.connect(this.masterGain);
      }
      this.thunderAudioEl.play().catch(() => {});
    }
  }

  stop() {
    if (!this.isPlaying) return;

    const now = this.audioCtx ? this.audioCtx.currentTime : 0;
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.linearRampToValueAtTime(0.001, now + 0.1);
    }

    if (this.rainAudioEl) this.rainAudioEl.pause();
    if (this.birdsAudioEl) this.birdsAudioEl.pause();
    if (this.thunderAudioEl) this.thunderAudioEl.pause();

    setTimeout(() => {
      try {
        if (this.oscLeft) this.oscLeft.stop();
        if (this.oscRight) this.oscRight.stop();
        if (this.pinkSource) this.pinkSource.stop();
        if (this.brownSource) this.brownSource.stop();
      } catch (e) {}

      this.isPlaying = false;
      this.stopTimer();
    }, 120);
  }

  setFrequencies(carrier, beat) {
    this.carrierFreq = parseFloat(carrier) || 200;
    this.beatFreq = parseFloat(beat) || 10;

    if (this.isPlaying && this.audioCtx) {
      const now = this.audioCtx.currentTime;
      this.oscLeft.frequency.linearRampToValueAtTime(this.carrierFreq, now + 0.05);
      this.oscRight.frequency.linearRampToValueAtTime(this.carrierFreq + this.beatFreq, now + 0.05);
    }
  }

  setMasterVolume(vol) {
    this.masterVol = parseFloat(vol);
    if (this.isPlaying && this.masterGain && this.audioCtx) {
      const now = this.audioCtx.currentTime;
      this.masterGain.gain.linearRampToValueAtTime(this.masterVol, now + 0.05);
    }
  }

  setRealRainVolume(vol) {
    this.realRainVol = parseFloat(vol) || 0;
    if (this.rainGain) {
      this.rainGain.gain.value = this.realRainVol;
    }
  }

  setBirdsVolume(vol) {
    this.birdsVol = parseFloat(vol) || 0;
    if (this.birdsGain) {
      this.birdsGain.gain.value = this.birdsVol;
    }
  }

  setThunderVolume(vol) {
    this.thunderVol = parseFloat(vol) || 0;
    if (this.thunderGain) {
      this.thunderGain.gain.value = this.thunderVol;
    }
  }

  setWaveform(type) {
    this.waveform = type;
    if (this.isPlaying && this.oscLeft && this.oscRight) {
      this.oscLeft.type = type;
      this.oscRight.type = type;
    }
  }

  setupAmbientNoise() {
    if (!this.audioCtx) return;

    const bufferSize = 2 * this.audioCtx.sampleRate;

    // Pink Noise Buffer
    const pinkBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const pData = pinkBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      pData[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.05;
      b6 = white * 0.115926;
    }

    this.pinkSource = this.audioCtx.createBufferSource();
    this.pinkSource.buffer = pinkBuffer;
    this.pinkSource.loop = true;
    this.pinkGain = this.audioCtx.createGain();
    this.pinkGain.gain.value = 0;
    this.pinkSource.connect(this.pinkGain);
    this.pinkGain.connect(this.masterGain);
    this.pinkSource.start();

    // Brown Noise Buffer
    const brownBuffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const brData = brownBuffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      brData[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = brData[i];
      brData[i] *= 1.8;
    }

    this.brownSource = this.audioCtx.createBufferSource();
    this.brownSource.buffer = brownBuffer;
    this.brownSource.loop = true;
    this.brownGain = this.audioCtx.createGain();
    this.brownGain.gain.value = 0;
    this.brownSource.connect(this.brownGain);
    this.brownGain.connect(this.masterGain);
    this.brownSource.start();
  }

  setAmbientVolume(type, vol) {
    const val = parseFloat(vol) || 0;
    if (type === "pink" && this.pinkGain) this.pinkGain.gain.value = val;
    if (type === "brown" && this.brownGain) this.brownGain.gain.value = val;
  }

  startTimer(minutes, onTickCallback, onCompleteCallback) {
    this.stopTimer();
    if (!minutes || minutes <= 0) return;

    this.timerSecondsRemaining = minutes * 60;

    this.timerInterval = setInterval(() => {
      this.timerSecondsRemaining--;
      if (onTickCallback) onTickCallback(this.timerSecondsRemaining);

      if (this.timerSecondsRemaining <= 0) {
        this.stop();
        if (onCompleteCallback) onCompleteCallback();
        this.stopTimer();
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }
}
