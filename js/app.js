import { BinauralEngine } from "./binaural-engine.js";
import { AudioVisualizer } from "./audio-visualizer.js";

const binaural = new BinauralEngine();
let visualizer = null;

document.addEventListener("DOMContentLoaded", () => {
  initBackgroundCanvas();
  initBinauralStudio();
});

/* Ambient Canvas Particle Animation */
function initBackgroundCanvas() {
  const canvas = document.getElementById("bg-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);

  const particles = Array.from({ length: 45 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 2 + 1,
    dx: (Math.random() - 0.5) * 0.4,
    dy: (Math.random() - 0.5) * 0.4,
    alpha: Math.random() * 0.5 + 0.1
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      ctx.fillStyle = `rgba(0, 243, 255, ${p.alpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();

      p.x += p.dx;
      p.y += p.dy;

      if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
    });

    requestAnimationFrame(draw);
  }

  draw();
}

function initBinauralStudio() {
  visualizer = new AudioVisualizer("binaural-visualizer");

  const playBtn = document.getElementById("binaural-play-btn");
  const playIcon = document.getElementById("binaural-play-icon");
  const playText = document.getElementById("binaural-play-text");

  const carrierSlider = document.getElementById("carrier-slider");
  const carrierVal = document.getElementById("carrier-val");
  const beatSlider = document.getElementById("beat-slider");
  const beatVal = document.getElementById("beat-val");

  const waveformSelect = document.getElementById("waveform-select");
  const masterVolSlider = document.getElementById("master-vol-slider");
  const masterVolVal = document.getElementById("master-vol-val");

  const pinkVolSlider = document.getElementById("pink-vol-slider");
  const pinkVolVal = document.getElementById("pink-vol-val");
  const brownVolSlider = document.getElementById("brown-vol-slider");
  const brownVolVal = document.getElementById("brown-vol-val");

  const timerSelect = document.getElementById("timer-select");
  const timerCountdown = document.getElementById("timer-countdown");

  const presetCards = document.querySelectorAll(".preset-card");

  // Play / Pause Master Button
  if (playBtn) {
    playBtn.addEventListener("click", () => {
      if (binaural.isPlaying) {
        binaural.stop();
        if (visualizer) visualizer.stop();
        playBtn.classList.remove("playing");
        playIcon.textContent = "▶";
        playText.textContent = "Start Audio";
        showToast("Audio Stopped", "info");
      } else {
        binaural.start();
        if (visualizer && binaural.analyser) visualizer.start(binaural.analyser);
        playBtn.classList.add("playing");
        playIcon.textContent = "⏸";
        playText.textContent = "Pause Audio";
        showToast("Audio Playing! Wear headphones for stereo binaural entrainment.", "success");
      }
    });
  }

  // Preset Cards
  presetCards.forEach((card) => {
    card.addEventListener("click", () => {
      presetCards.forEach((c) => c.classList.remove("active"));
      card.classList.add("active");

      const carrier = parseFloat(card.dataset.carrier);
      const beat = parseFloat(card.dataset.beat);
      const presetName = card.dataset.preset;

      carrierSlider.value = carrier;
      carrierVal.textContent = carrier;

      beatSlider.value = beat;
      beatVal.textContent = beat.toFixed(1);

      binaural.setFrequencies(carrier, beat);
      showToast(`${presetName.toUpperCase()} Preset Active (${beat} Hz)`, "info");
    });
  });

  // Carrier Pitch Slider
  if (carrierSlider) {
    carrierSlider.addEventListener("input", () => {
      const carrier = carrierSlider.value;
      carrierVal.textContent = carrier;
      binaural.setFrequencies(carrier, beatSlider.value);
    });
  }

  // Beat Offset Slider
  if (beatSlider) {
    beatSlider.addEventListener("input", () => {
      const beat = parseFloat(beatSlider.value);
      beatVal.textContent = beat.toFixed(1);
      binaural.setFrequencies(carrierSlider.value, beat);
    });
  }

  // Waveform Select
  if (waveformSelect) {
    waveformSelect.addEventListener("change", () => {
      binaural.setWaveform(waveformSelect.value);
    });
  }

  const realRainSlider = document.getElementById("real-rain-vol-slider");
  const realRainVal = document.getElementById("real-rain-vol-val");

  if (realRainSlider) {
    realRainSlider.addEventListener("input", () => {
      const volPercent = realRainSlider.value;
      if (realRainVal) realRainVal.textContent = volPercent;
      binaural.setRealRainVolume(volPercent / 100);
    });
  }

  const birdsSlider = document.getElementById("birds-vol-slider");
  const birdsVal = document.getElementById("birds-vol-val");

  if (birdsSlider) {
    birdsSlider.addEventListener("input", () => {
      const volPercent = birdsSlider.value;
      if (birdsVal) birdsVal.textContent = volPercent;
      binaural.setBirdsVolume(volPercent / 100);
    });
  }

  // Master Volume
  if (masterVolSlider) {
    masterVolSlider.addEventListener("input", () => {
      const volPercent = masterVolSlider.value;
      masterVolVal.textContent = volPercent;
      binaural.setMasterVolume(volPercent / 100);
    });
  }

  // Pink Noise Slider
  if (pinkVolSlider) {
    pinkVolSlider.addEventListener("input", () => {
      const volPercent = pinkVolSlider.value;
      pinkVolVal.textContent = volPercent;
      binaural.setAmbientVolume("pink", (volPercent / 100) * 0.4);
    });
  }

  // Brown Noise Slider
  if (brownVolSlider) {
    brownVolSlider.addEventListener("input", () => {
      const volPercent = brownVolSlider.value;
      brownVolVal.textContent = volPercent;
      binaural.setAmbientVolume("brown", (volPercent / 100) * 0.4);
    });
  }

  // Session Timer Select
  if (timerSelect) {
    timerSelect.addEventListener("change", () => {
      const minutes = parseInt(timerSelect.value) || 0;
      if (minutes > 0) {
        timerCountdown.style.display = "block";
        binaural.startTimer(
          minutes,
          (secs) => {
            const m = Math.floor(secs / 60);
            const s = secs % 60;
            timerCountdown.textContent = `⏱️ Session Timer: ${m}:${s < 10 ? "0" : ""}${s} remaining`;
          },
          () => {
            timerCountdown.style.display = "none";
            if (playBtn) {
              playBtn.classList.remove("playing");
              playIcon.textContent = "▶";
              playText.textContent = "Start Audio";
            }
            if (visualizer) visualizer.stop();
            showToast("Session timer completed. Sound stopped.", "info");
          }
        );
        showToast(`Sleep timer set to ${minutes} minutes`, "info");
      } else {
        binaural.stopTimer();
        timerCountdown.style.display = "none";
      }
    });
  }
}

function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  const iconMap = { success: "✓", error: "✕", info: "ℹ" };
  toast.innerHTML = `<span class="toast-icon">${iconMap[type]}</span><span>${message}</span>`;

  container.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
