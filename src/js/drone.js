/**
 * drone.js — Drone Tool: Sustained Reference Tones for Practice
 *
 * Generates one or more detuned/harmonic oscillators through a configurable
 * effects chain (LFO filter → tape delay → spring reverb) and routes them to
 * the Web Audio API destination.
 *
 * localStorage key: musicTool_drone_v1
 *
 * Architecture overview
 * ─────────────────────
 *  Voice graph  →  effectsChain.input  →  [LFO filter]  →  [tape delay]
 *               →  [spring reverb]  →  ctx.destination
 *
 * The voice graph and the effects chain are kept as separate sub-graphs so
 * that parameters can be updated live without rebuilding everything, and so
 * that the effects chain persists across timbre/note crossfades.
 */


/* ══════════════════════════════════════════════════════════════════════════════
   PERSISTENCE
   Shared helpers for reading/writing named values into a single JSON blob
   stored under LS_KEY in localStorage.
   ══════════════════════════════════════════════════════════════════════════════ */

var LS_KEY = 'musicTool_drone_v1';

/**
 * Persist a single key/value pair under LS_KEY.
 * @param {string} k - Preference key.
 * @param {*}      v - Value (must be JSON-serialisable).
 */
function savePref(k, v) {
  try {
    var d = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
    d[k] = v;
    localStorage.setItem(LS_KEY, JSON.stringify(d));
  } catch (e) {}
}

/**
 * Load the full preferences object from localStorage.
 * Returns an empty object if nothing has been saved yet or the data is corrupt.
 * @returns {Object}
 */
function loadPrefs() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '{}');
  } catch (e) {
    return {};
  }
}


/* ══════════════════════════════════════════════════════════════════════════════
   THEME / MODE
   ══════════════════════════════════════════════════════════════════════════════ */

/**
 * Switch between light and dark mode.
 * @param {string}  m      - 'light' or 'dark'.
 * @param {boolean} noSave - When true, skip persisting (used during init).
 */
function applyMode(m, noSave) {
  document.body.dataset.mode = m;
  var badge = document.getElementById('modeBadge');
  if (badge) badge.textContent = m === 'dark' ? 'DARK' : 'LIGHT';
  if (!noSave) savePref('mode', m);
}

/* Toggle mode on click */
document.getElementById('modeToggle').addEventListener('click', function () {
  applyMode(document.body.dataset.mode === 'dark' ? 'light' : 'dark');
});


/* ══════════════════════════════════════════════════════════════════════════════
   MODALS
   ══════════════════════════════════════════════════════════════════════════════ */

/**
 * Show a modal overlay by id.
 * @param {string} id - Element id of the .modal-overlay.
 */
function openModal(id) {
  document.getElementById(id).classList.add('show');
  document.body.style.overflow = 'hidden';
}

/**
 * Hide a modal overlay by id.
 * @param {string} id - Element id of the .modal-overlay.
 */
function closeModal(id) {
  document.getElementById(id).classList.remove('show');
  document.body.style.overflow = '';
}

/* Close any modal when the backdrop (not the card) is clicked */
document.querySelectorAll('.modal-overlay').forEach(function (ov) {
  ov.addEventListener('click', function (e) {
    if (e.target === ov) closeModal(ov.id);
  });
});


/* ══════════════════════════════════════════════════════════════════════════════
   MUSIC DATA CONSTANTS
   ══════════════════════════════════════════════════════════════════════════════ */

/* Chromatic pitch classes, index 0 = C */
var NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/* Enharmonic equivalents used for display (e.g. "C#/Db") */
var ENH = { 'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb' };

/**
 * Return display string for a note, including its enharmonic if one exists.
 * e.g. nn('C#') → 'C#/Db',  nn('C') → 'C'
 * @param {string} n - Pitch class.
 * @returns {string}
 */
var nn = function (n) { return ENH[n] ? n + '/' + ENH[n] : n; };

/**
 * Convert a MIDI note number to its frequency in Hz (A4 = MIDI 69 = 440 Hz).
 * @param {number} midi
 * @returns {number}
 */
var midiFreq = function (midi) { return 440 * Math.pow(2, (midi - 69) / 12); };

/**
 * Return the frequency (Hz) for a named note + octave.
 * Octave 4 is the standard octave containing A4 = 440 Hz.
 * @param {string} note - Pitch class, e.g. 'A'.
 * @param {number} oct  - Octave number (2–5 in this tool).
 * @returns {number}
 */
var noteFreq = function (note, oct) {
  return midiFreq((oct + 1) * 12 + NOTES.indexOf(note));
};


/* ══════════════════════════════════════════════════════════════════════════════
   AUDIO ENGINE
   getCtx() is the canonical entry point for all Web Audio code. It lazily
   creates the AudioContext on first use (required by browsers that block
   AudioContext creation before a user gesture) and resumes it if it has been
   suspended by the browser's auto-play policy.
   ══════════════════════════════════════════════════════════════════════════════ */

var audioCtx = null;

/**
 * Return (and resume if necessary) the shared AudioContext.
 * Always call this inside a user-gesture handler, never at module scope.
 * @returns {AudioContext}
 */
function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}


/* ══════════════════════════════════════════════════════════════════════════════
   APPLICATION STATE
   ══════════════════════════════════════════════════════════════════════════════ */

/* Voicing and timbre option lists */
var VOICINGS = ['Root', 'Root + 5th', 'Power', 'Octaves'];
var TIMBRES  = ['Warm', 'Tanpura', 'Organ', 'Pad'];

/* Current voice parameters */
var rootNote = 'A';
var octave   = 3;
var voicing  = 'Root';
var timbre   = 'Warm';
var volume   = 70;   /* 0–100, maps to gain 0.0–1.0 */
var playing  = false;

/*
 * currentNodes — the active voice sub-graph while playing.
 * Shape: { master: GainNode, perVoice: GainNode, voices: Array }
 * Replaced (via crossfade) when note/voicing/timbre changes.
 */
var currentNodes = null;

/*
 * effectsChain — the persistent processing chain that sits between the voice
 * graph and ctx.destination. Rebuilt when an effect is toggled on/off.
 * Shape: { input: GainNode, output: AudioNode, nodes: {…}, fxRefs: {…} }
 */
var effectsChain = null;

/*
 * cachedReverbIR — caches the last computed convolution buffer so that the
 * reverb IR is not regenerated on every mixer scrub, only when Size changes.
 * Shape: { size: number, buffer: AudioBuffer } | null
 */
var cachedReverbIR = null;


/* ══════════════════════════════════════════════════════════════════════════════
   EFFECTS STATE
   All slider values are stored as raw 0–100 (or 0–85 for feedback) integers
   matching the HTML range inputs. Conversion to audio-unit values happens in
   the parameter conversion helpers below.
   ══════════════════════════════════════════════════════════════════════════════ */

/* ── LFO Filter ── */
var fxLFOEnabled = false;
var fxLFOType    = 'lowpass';
var fxLFORate    = 50;   /* slider 0–100 */
var fxLFODepth   = 40;   /* slider 0–100 */
var fxLFOCutoff  = 55;   /* slider 0–100 */

/* ── Tape Delay ── */
var fxDelayEnabled  = false;
var fxDelayTime     = 35;  /* slider 0–100 */
var fxDelayFeedback = 35;  /* slider 0–85  */
var fxDelayMix      = 30;  /* slider 0–100 */

/* ── Spring Reverb ── */
var fxReverbEnabled = false;
var fxReverbSize    = 70;  /* slider 0–100 */
var fxReverbMix     = 35;  /* slider 0–100 */


/* ══════════════════════════════════════════════════════════════════════════════
   EFFECTS PARAMETER CONVERSIONS
   Slider values are intentionally stored as linear 0–100 integers for easy
   persistence and UI binding. These helpers map them to perceptually useful
   audio ranges using exponential (power-of-base) curves.
   ══════════════════════════════════════════════════════════════════════════════ */

/**
 * LFO rate: exponential mapping 0–100 → 0.05–5 Hz.
 * Low end gives a very slow "breathing" sweep; high end is an obvious tremolo.
 * @param {number} v - Slider value 0–100.
 * @returns {number} Frequency in Hz.
 */
function lfoRateHz(v) {
  return 0.05 * Math.pow(100, v / 100);
}

/**
 * LFO / filter cutoff: exponential mapping 0–100 → 100–8000 Hz.
 * Rounded to integer for cleaner display labels.
 * @param {number} v - Slider value 0–100.
 * @returns {number} Frequency in Hz.
 */
function lfoCutoffHz(v) {
  return Math.round(100 * Math.pow(80, v / 100));
}

/**
 * Tape delay time: exponential mapping 0–100 → 50 ms–2000 ms (in seconds).
 * @param {number} v - Slider value 0–100.
 * @returns {number} Delay time in seconds.
 */
function delayTimeSec(v) {
  return 0.05 * Math.pow(40, v / 100);
}

/* ── Display formatting helpers ── */

/**
 * Format LFO rate for display (e.g. "0.50 Hz" or "1.3 Hz").
 * @param {number} v - Slider value 0–100.
 * @returns {string}
 */
function fmtLFORate(v) {
  var h = lfoRateHz(v);
  return h < 1 ? h.toFixed(2) + ' Hz' : h.toFixed(1) + ' Hz';
}

/**
 * Format cutoff frequency for display (e.g. "800 Hz" or "2.5 kHz").
 * @param {number} v - Slider value 0–100.
 * @returns {string}
 */
function fmtCutoff(v) {
  var h = lfoCutoffHz(v);
  return h >= 1000 ? (h / 1000).toFixed(1) + ' kHz' : h + ' Hz';
}

/**
 * Format delay time for display (e.g. "350 ms").
 * @param {number} v - Slider value 0–100.
 * @returns {string}
 */
function fmtDelayTime(v) {
  return Math.round(delayTimeSec(v) * 1000) + ' ms';
}


/* ══════════════════════════════════════════════════════════════════════════════
   UI BUILDERS
   ══════════════════════════════════════════════════════════════════════════════ */

/**
 * Populate the Root Note <select> with all 12 pitch classes.
 * Enharmonic notes are labelled "C#/Db" etc.
 */
function buildRootSelect() {
  var sel = document.getElementById('rootSelect');
  sel.innerHTML = '';
  NOTES.forEach(function (n) {
    var opt = document.createElement('option');
    opt.value = n;
    opt.textContent = nn(n);
    sel.appendChild(opt);
  });
  sel.value = rootNote;
}

/**
 * Populate the Octave <select> with octaves 2–5.
 */
function buildOctaveSelect() {
  var sel = document.getElementById('octaveSelect');
  sel.innerHTML = '';
  for (var i = 2; i <= 5; i++) {
    var opt = document.createElement('option');
    opt.value = i;
    opt.textContent = 'Octave ' + i;
    sel.appendChild(opt);
  }
  sel.value = octave;
}

/**
 * Build (or rebuild) a segmented button group.
 * Each option becomes a <button class="seg-btn">, and clicking one fires
 * onChange with the selected value.
 *
 * @param {string}   containerId - id of the container element.
 * @param {string[]} options     - Option values shown as button labels.
 * @param {string}   active      - Currently selected option.
 * @param {Function} onChange    - Callback receiving the chosen option string.
 */
function buildSegmented(containerId, options, active, onChange) {
  var row = document.getElementById(containerId);
  row.innerHTML = '';
  options.forEach(function (opt) {
    var btn = document.createElement('button');
    btn.className = 'seg-btn' + (opt === active ? ' active' : '');
    btn.textContent = opt;
    btn.addEventListener('click', function () {
      row.querySelectorAll('.seg-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      onChange(opt);
    });
    row.appendChild(btn);
  });
}


/* ══════════════════════════════════════════════════════════════════════════════
   DISPLAY UPDATE
   ══════════════════════════════════════════════════════════════════════════════ */

/**
 * Refresh the note name and frequency readouts above the config card.
 * The octave number is wrapped in <span class="oct"> for accent colouring.
 */
function updateDisplay() {
  var freq = noteFreq(rootNote, octave);
  document.getElementById('noteDisplay').innerHTML =
    nn(rootNote).split('/')[0] + '<span class="oct">' + octave + '</span>';
  document.getElementById('freqDisplay').textContent = freq.toFixed(2) + ' Hz';
}


/* ══════════════════════════════════════════════════════════════════════════════
   VOICING — MIDI NOTE SETS
   ══════════════════════════════════════════════════════════════════════════════ */

/**
 * Return the MIDI note numbers for the currently selected voicing.
 * The root is computed from rootNote + octave, then intervals are added.
 *
 * Voicings:
 *   Root       — root only
 *   Root + 5th — root + perfect fifth (+7 semitones)
 *   Power      — sub-octave root, fifth, root  (thick low-mid sound)
 *   Octaves    — root + root one octave higher
 *
 * @returns {number[]} Array of MIDI note numbers.
 */
function getVoicingMidis() {
  var root = (octave + 1) * 12 + NOTES.indexOf(rootNote);
  switch (voicing) {
    case 'Root':       return [root];
    case 'Root + 5th': return [root, root + 7];
    case 'Power':      return [root - 12, root + 7, root];
    case 'Octaves':    return [root, root + 12];
    default:           return [root];
  }
}


/* ══════════════════════════════════════════════════════════════════════════════
   TIMBRE — VOICE OSCILLATOR GRAPHS
   Each timbre builds its oscillator network and connects it to masterGain.
   Returns a nodes object so that destroyGraph() can tear down all sub-nodes.
   ══════════════════════════════════════════════════════════════════════════════ */

/**
 * Build the oscillator sub-graph for a single pitch at the current timbre.
 *
 * @param {AudioContext} ctx        - The shared audio context.
 * @param {number}       freq       - Fundamental frequency in Hz.
 * @param {GainNode}     masterGain - Destination node for this voice's output.
 * @returns {{ oscs: OscillatorNode[], gains: GainNode[], filters: BiquadFilterNode[], lfos: AudioNode[] }}
 */
function buildVoice(ctx, freq, masterGain) {
  var nodes = { oscs: [], gains: [], filters: [], lfos: [] };

  if (timbre === 'Warm') {
    /*
     * Warm: sawtooth → lowpass filter → masterGain
     * A slow sine LFO modulates the filter cutoff to create a gentle
     * "breathing" quality. LFO depth is ±200 Hz around 800 Hz.
     */
    var osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;

    var filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;
    filter.Q.value = 1;

    var lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.3;  /* 0.3 Hz ≈ one sweep every 3.3 s */
    var lfoGain = ctx.createGain();
    lfoGain.gain.value = 200;   /* ±200 Hz modulation depth */

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    osc.connect(filter);
    filter.connect(masterGain);
    osc.start();

    nodes.oscs.push(osc);
    nodes.filters.push(filter);
    nodes.lfos.push(lfo, lfoGain);
  }
  else if (timbre === 'Tanpura') {
    /*
     * Tanpura: two slightly detuned sawtooth oscillators (+2 / -2 cents) for
     * chorus shimmer, a sub-octave sine (freq/2) for body, and a very slow
     * amplitude tremolo (0.15 Hz) for organic movement.
     * All three sources mix into voiceGain before reaching masterGain.
     * The tremolo LFO is connected to voiceGain.gain so it modulates the
     * combined amplitude rather than individual voices.
     */
    var osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.value = freq;
    osc1.detune.value = 2;    /* +2 cents — creates beating against osc2 */

    var osc2 = ctx.createOscillator();
    osc2.type = 'sawtooth';
    osc2.frequency.value = freq;
    osc2.detune.value = -2;   /* -2 cents */

    /* Sub-octave sine adds depth without overwhelming the midrange */
    var sub = ctx.createOscillator();
    sub.type = 'sine';
    sub.frequency.value = freq / 2;
    var subGain = ctx.createGain();
    subGain.gain.value = 0.25;   /* mix sub at 25% of main voices */

    /* Tremolo LFO: very slow (0.15 Hz ≈ one cycle per 6.7 s), subtle ±8% */
    var trem = ctx.createOscillator();
    trem.type = 'sine';
    trem.frequency.value = 0.15;
    var tremGain = ctx.createGain();
    tremGain.gain.value = 0.08;

    var voiceGain = ctx.createGain();
    voiceGain.gain.value = 1.0;  /* base gain; tremolo modulates around this */

    trem.connect(tremGain);
    tremGain.connect(voiceGain.gain);  /* tremolo drives the combined gain */
    trem.start();

    osc1.connect(voiceGain);
    osc2.connect(voiceGain);
    sub.connect(subGain);
    subGain.connect(voiceGain);
    voiceGain.connect(masterGain);

    osc1.start();
    osc2.start();
    sub.start();

    nodes.oscs.push(osc1, osc2, sub);
    nodes.gains.push(subGain, voiceGain);
    nodes.lfos.push(trem, tremGain);
  }
  else if (timbre === 'Organ') {
    /*
     * Organ: fundamental + 2nd harmonic (freq×2 at −6 dB) +
     *        3rd harmonic (freq×3 at −12 dB). Pure sines, no modulation.
     * Gain ratios approximate the classic additive organ drawbar balance.
     */
    var osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = freq;           /* fundamental — full level */

    var osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = freq * 2;       /* 2nd harmonic */
    var g2 = ctx.createGain();
    g2.gain.value = 0.5;                   /* −6 dB */

    var osc3 = ctx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.value = freq * 3;       /* 3rd harmonic */
    var g3 = ctx.createGain();
    g3.gain.value = 0.25;                  /* −12 dB */

    osc1.connect(masterGain);
    osc2.connect(g2);
    g2.connect(masterGain);
    osc3.connect(g3);
    g3.connect(masterGain);

    osc1.start();
    osc2.start();
    osc3.start();

    nodes.oscs.push(osc1, osc2, osc3);
    nodes.gains.push(g2, g3);
  }
  else if (timbre === 'Pad') {
    /*
     * Pad: triangle wave (softer harmonic content than sawtooth) through a
     * lowpass filter whose cutoff is gently swept by a slow LFO.
     * Similar architecture to Warm but with a higher centre cutoff (1200 Hz)
     * and lower Q, giving a more open, airy quality.
     */
    var osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = freq;

    var filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1200;
    filter.Q.value = 0.7;

    var lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.2;   /* 0.2 Hz ≈ one sweep every 5 s */
    var lfoGain = ctx.createGain();
    lfoGain.gain.value = 300;    /* ±300 Hz around 1200 Hz */

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    osc.connect(filter);
    filter.connect(masterGain);
    osc.start();

    nodes.oscs.push(osc);
    nodes.filters.push(filter);
    nodes.lfos.push(lfo, lfoGain);
  }

  return nodes;
}


/* ══════════════════════════════════════════════════════════════════════════════
   SPRING REVERB IMPULSE RESPONSE GENERATION
   The "spring reverb" is a synthesised convolution reverb whose IR mimics the
   characteristic metallic resonance and long decay of a physical spring tank.

   The IR is computed sample-by-sample and contains:
     • Exponential amplitude decay (rate derived from the Size parameter).
     • Two sinusoidal "spring" resonance frequencies (slightly different per
       stereo channel to give width).
     • An early-reflection boost in the first 60 ms.
     • Band-limited noise blended with the resonant component.
     • Per-channel normalisation to prevent clipping.

   Generating the IR is CPU-intensive (tens of thousands of iterations for a
   4-second buffer at 44.1 kHz). The result is cached until Size changes.
   ══════════════════════════════════════════════════════════════════════════════ */

/**
 * Compute a stereo AudioBuffer that approximates a spring reverb impulse
 * response at the given duration.
 *
 * @param {AudioContext} ctx      - Audio context (provides sampleRate and buffer factory).
 * @param {number}       duration - Reverb tail length in seconds (0.5–4).
 * @returns {AudioBuffer}
 */
function buildReverbIR(ctx, duration) {
  var sr  = ctx.sampleRate;
  var len = Math.floor(sr * duration);
  var buf = ctx.createBuffer(2, len, sr);

  /* 4 ms of silence before any reverb energy arrives (simulates room distance) */
  var predelay = Math.floor(0.004 * sr);

  for (var c = 0; c < 2; c++) {
    var data = buf.getChannelData(c);

    /*
     * Slightly different spring resonance frequencies per channel give stereo
     * width without a full Haas-effect comb filtering artefact.
     * springFreq1/springFreq2 are prime numbers to avoid low-frequency beating.
     */
    var springFreq1 = c === 0 ? 29  : 31;
    var springFreq2 = c === 0 ? 62  : 67;

    /*
     * Decay rate: faster decay for shorter tails. The formula maps duration
     * linearly from ~4.8 (0.5 s tail) down to ~0.8 (4 s tail) so that shorter
     * Size values produce a snappier spring and longer ones give a lush plate.
     */
    var decayRate = 0.8 + 4 * (1 - duration / 5);

    for (var i = 0; i < len; i++) {
      if (i < predelay) { data[i] = 0; continue; }

      var t     = (i - predelay) / sr;
      var decay = Math.exp(-t * decayRate);

      /*
       * Resonant spring component: mix of two sine waves at the spring
       * frequencies, weighted to favour the lower resonance.
       */
      var spring = 0.4  * Math.sin(2 * Math.PI * springFreq1 * t)
                 + 0.25 * Math.sin(2 * Math.PI * springFreq2 * t);

      /*
       * Early reflection boost: the first 60 ms are amplified by up to 2.5×
       * via a fast-decaying exponential, simulating the dense early reflections
       * that give spring reverbs their characteristic "boing" attack.
       */
      var early = t < 0.06 ? (1 + Math.exp(-t * 40) * 1.5) : 1;

      /* White noise provides the diffuse tail density */
      var noise = Math.random() * 2 - 1;

      /* Blend: 65% noise + 35% resonant spring */
      data[i] = (noise * 0.65 + spring * 0.35) * decay * early;
    }

    /*
     * Normalise to half-peak to prevent the convolver from clipping while
     * still leaving headroom for the wet/dry mix.
     */
    var peak = 0;
    for (var i = 0; i < len; i++) if (Math.abs(data[i]) > peak) peak = Math.abs(data[i]);
    if (peak > 0) for (var i = 0; i < len; i++) data[i] = data[i] / (peak * 2.5);
  }

  return buf;
}

/**
 * Return a cached IR buffer, regenerating it only when fxReverbSize has changed.
 * @param {AudioContext} ctx
 * @returns {AudioBuffer}
 */
function getReverbIR(ctx) {
  if (cachedReverbIR && cachedReverbIR.size === fxReverbSize) return cachedReverbIR.buffer;
  /* Map slider 0–100 → tail duration 0.5 s–4.0 s */
  var duration = 0.5 + (fxReverbSize / 100) * 3.5;
  var buf = buildReverbIR(ctx, duration);
  cachedReverbIR = { size: fxReverbSize, buffer: buf };
  return buf;
}


/* ══════════════════════════════════════════════════════════════════════════════
   EFFECTS CHAIN — BUILD, DESTROY, REBUILD
   ══════════════════════════════════════════════════════════════════════════════ */

/**
 * Build and wire the complete effects chain from scratch, replacing any
 * previously existing chain.
 *
 * Signal flow:
 *   inputGain → [LFO filter] → [tape delay (dry+wet mix)] → [reverb (dry+wet mix)] → ctx.destination
 *
 * Each stage is conditional on its enabled flag. If no effects are enabled the
 * chain is simply inputGain → destination, which introduces no colouration.
 *
 * Live parameter references (AudioParam objects) are stored in chain.fxRefs so
 * that updateFxXxxLive() can reach them without rebuilding.
 */
function buildEffectsChain() {
  destroyEffectsChain();
  var ctx = getCtx();

  var chain = {
    nodes: { lfos: [], gains: [], filters: [], delays: [], convolvers: [] },
    fxRefs: {}
  };

  /* Master input gain — voice graph connects here */
  var inputGain = ctx.createGain();
  inputGain.gain.value = 1;
  chain.input = inputGain;
  chain.nodes.gains.push(inputGain);
  var lastNode = inputGain;  /* pointer to the last node in the chain so far */

  /* ── LFO Filter ── */
  if (fxLFOEnabled) {
    var filter = ctx.createBiquadFilter();
    filter.type = fxLFOType;
    var cutHz = lfoCutoffHz(fxLFOCutoff);
    filter.frequency.value = cutHz;
    filter.Q.value = 1.2;  /* mild resonance gives a vocal quality at the sweep peak */

    var lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = lfoRateHz(fxLFORate);
    var lfoGain = ctx.createGain();
    /* Depth scales the LFO amplitude proportionally to the centre frequency so
       the sweep always feels "right" regardless of where the cutoff sits */
    lfoGain.gain.value = (fxLFODepth / 100) * cutHz;

    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start();

    lastNode.connect(filter);
    lastNode = filter;
    chain.nodes.filters.push(filter);
    chain.nodes.lfos.push(lfo, lfoGain);

    /* Store live refs for parameter updates without a full rebuild */
    chain.fxRefs.lfoFilter = {
      filter:     filter,
      lfoFreq:    lfo.frequency,
      lfoGain:    lfoGain.gain,
      filterFreq: filter.frequency
    };
  }

  /* ── Tape Delay ── */
  if (fxDelayEnabled) {
    var delayNode = ctx.createDelay(3.0);   /* 3 s max delay time */
    delayNode.delayTime.value = delayTimeSec(fxDelayTime);

    /* Feedback loop: delayNode → feedbackGain → delayNode */
    var feedbackGain = ctx.createGain();
    feedbackGain.gain.value = fxDelayFeedback / 100;

    /* Wet/dry crossfade (constant-power blend not required here because the
       dry path never goes silent — simple linear mix is acceptable) */
    var wetGain = ctx.createGain();
    wetGain.gain.value = fxDelayMix / 100;
    var dryGain = ctx.createGain();
    dryGain.gain.value = 1 - fxDelayMix / 100;
    var mixOut = ctx.createGain();
    mixOut.gain.value = 1;

    /*
     * Wow-and-flutter emulation: a slow, slightly randomised LFO wobbles the
     * delay time by ±2.5 ms (wobbleGain = 0.0025 s).  The frequency is
     * randomised at construction time so multiple delay instances (if ever
     * used) don't phase-lock to each other.
     */
    var wobble = ctx.createOscillator();
    wobble.type = 'sine';
    wobble.frequency.value = 0.6 + Math.random() * 0.4;  /* 0.6–1.0 Hz */
    var wobbleGain = ctx.createGain();
    wobbleGain.gain.value = 0.0025;  /* ±2.5 ms */
    wobble.connect(wobbleGain);
    wobbleGain.connect(delayNode.delayTime);
    wobble.start();

    /* Wire the delay graph */
    lastNode.connect(dryGain);         /* dry path bypasses the delay */
    lastNode.connect(delayNode);       /* wet path enters the delay */
    delayNode.connect(feedbackGain);   /* delay output loops back */
    feedbackGain.connect(delayNode);   /* feedback into delay input */
    delayNode.connect(wetGain);        /* delay output also goes to mix */
    dryGain.connect(mixOut);
    wetGain.connect(mixOut);

    lastNode = mixOut;
    chain.nodes.delays.push(delayNode);
    chain.nodes.gains.push(feedbackGain, wetGain, dryGain, mixOut, wobbleGain);
    chain.nodes.lfos.push(wobble);

    chain.fxRefs.delay = {
      delayTime: delayNode.delayTime,
      feedback:  feedbackGain.gain,
      wet:       wetGain.gain,
      dry:       dryGain.gain
    };
  }

  /* ── Spring Reverb ── */
  if (fxReverbEnabled) {
    var convolver = ctx.createConvolver();
    convolver.buffer = getReverbIR(ctx);  /* uses cached IR if size unchanged */

    var wetGain = ctx.createGain();
    wetGain.gain.value = fxReverbMix / 100;
    var dryGain = ctx.createGain();
    dryGain.gain.value = 1 - fxReverbMix / 100;
    var mixOut = ctx.createGain();
    mixOut.gain.value = 1;

    lastNode.connect(dryGain);
    lastNode.connect(convolver);
    convolver.connect(wetGain);
    dryGain.connect(mixOut);
    wetGain.connect(mixOut);

    lastNode = mixOut;
    chain.nodes.convolvers.push(convolver);
    chain.nodes.gains.push(wetGain, dryGain, mixOut);

    chain.fxRefs.reverb = { wet: wetGain.gain, dry: dryGain.gain };
  }

  /* Connect the last stage to the hardware output */
  lastNode.connect(ctx.destination);
  chain.output = lastNode;
  effectsChain = chain;
}

/**
 * Disconnect and garbage-collect all nodes in the current effects chain.
 * Safe to call when effectsChain is null.
 */
function destroyEffectsChain() {
  if (!effectsChain) return;
  var n = effectsChain.nodes;
  n.lfos.forEach(function (l)      { try { if (l.stop) l.stop(); l.disconnect(); } catch (e) {} });
  n.gains.forEach(function (g)     { try { g.disconnect(); } catch (e) {} });
  n.filters.forEach(function (f)   { try { f.disconnect(); } catch (e) {} });
  n.delays.forEach(function (d)    { try { d.disconnect(); } catch (e) {} });
  n.convolvers.forEach(function (c){ try { c.disconnect(); } catch (e) {} });
  effectsChain = null;
}

/**
 * Rebuild the effects chain while the drone is playing.
 * Disconnects the live voice graph from the old chain, builds a fresh chain,
 * then reconnects the voice graph to the new chain's input.
 * No-ops when the drone is stopped.
 */
function rebuildEffectsChain() {
  if (!playing) return;

  /* Disconnect voice from old chain */
  if (currentNodes) {
    try { currentNodes.master.disconnect(); } catch (e) {}
  }

  buildEffectsChain();

  /* Reconnect voice to new chain input (or directly to destination if chain is empty) */
  if (currentNodes) {
    var dest = effectsChain ? effectsChain.input : getCtx().destination;
    currentNodes.master.connect(dest);
  }
}


/* ══════════════════════════════════════════════════════════════════════════════
   EFFECTS LIVE-UPDATE HELPERS
   These update AudioParam values directly on the existing chain nodes, avoiding
   the cost (and audio discontinuity) of a full rebuild for simple knob scrubs.
   ══════════════════════════════════════════════════════════════════════════════ */

/**
 * Push current LFO filter state to the live chain nodes.
 * No-op if the LFO filter section is not present in the chain.
 */
function updateFxLFOLive() {
  if (!effectsChain || !effectsChain.fxRefs.lfoFilter) return;
  var r = effectsChain.fxRefs.lfoFilter;
  var cutHz = lfoCutoffHz(fxLFOCutoff);
  r.lfoFreq.value    = lfoRateHz(fxLFORate);
  r.lfoGain.value    = (fxLFODepth / 100) * cutHz;  /* depth scales with cutoff */
  r.filterFreq.value = cutHz;
  r.filter.type      = fxLFOType;
}

/**
 * Push current tape delay state to the live chain nodes.
 * Dry gain is the complement of wet gain to maintain perceived loudness.
 */
function updateFxDelayLive() {
  if (!effectsChain || !effectsChain.fxRefs.delay) return;
  var r = effectsChain.fxRefs.delay;
  r.delayTime.value = delayTimeSec(fxDelayTime);
  r.feedback.value  = fxDelayFeedback / 100;
  r.wet.value       = fxDelayMix / 100;
  r.dry.value       = 1 - fxDelayMix / 100;
}

/**
 * Push current reverb mix to the live chain nodes.
 * (Reverb size requires a full rebuild because it changes the IR buffer.)
 */
function updateFxReverbLive() {
  if (!effectsChain || !effectsChain.fxRefs.reverb) return;
  var r = effectsChain.fxRefs.reverb;
  r.wet.value = fxReverbMix / 100;
  r.dry.value = 1 - fxReverbMix / 100;
}


/* ══════════════════════════════════════════════════════════════════════════════
   VOICE GRAPH — BUILD & DESTROY
   ══════════════════════════════════════════════════════════════════════════════ */

/**
 * Build the full voice graph for the current state (voicing + timbre + note).
 *
 * Structure:
 *   [voice 1 oscs] ─┐
 *   [voice 2 oscs] ─┤→ perVoice (normalising gain) → master (volume/crossfade) → effects input
 *   [voice 3 oscs] ─┘
 *
 * master starts at gain 0 so that crossfadeTo() can ramp it in smoothly.
 *
 * @returns {{ master: GainNode, perVoice: GainNode, voices: Array }}
 */
function buildGraph() {
  var ctx    = getCtx();
  var master = ctx.createGain();
  master.gain.value = 0;  /* starts silent; crossfadeTo() ramps gain up */

  var dest = effectsChain ? effectsChain.input : ctx.destination;
  master.connect(dest);

  var midis      = getVoicingMidis();
  var voiceCount = midis.length;

  /*
   * perVoice normalises the combined amplitude so that adding more voices
   * (e.g. Power chord = 3 notes) doesn't cause clipping.
   */
  var perVoice = ctx.createGain();
  perVoice.gain.value = 1 / Math.max(voiceCount, 1);
  perVoice.connect(master);

  var allNodes = { master: master, perVoice: perVoice, voices: [] };
  midis.forEach(function (midi) {
    var freq  = 440 * Math.pow(2, (midi - 69) / 12);
    var voice = buildVoice(ctx, freq, perVoice);
    allNodes.voices.push(voice);
  });

  return allNodes;
}

/**
 * Stop all oscillators and disconnect all nodes in a voice graph.
 * Catches errors from nodes that may have already stopped.
 * @param {{ master: GainNode, perVoice: GainNode, voices: Array }|null} graph
 */
function destroyGraph(graph) {
  if (!graph) return;
  graph.voices.forEach(function (v) {
    v.oscs.forEach(function (o)    { try { o.stop(); }       catch (e) {} try { o.disconnect(); }   catch (e) {} });
    v.gains.forEach(function (g)   { try { g.disconnect(); } catch (e) {} });
    v.filters.forEach(function (f) { try { f.disconnect(); } catch (e) {} });
    v.lfos.forEach(function (l)    { try { if (l.stop) l.stop(); } catch (e) {} try { l.disconnect(); } catch (e) {} });
  });
  try { graph.perVoice.disconnect(); } catch (e) {}
  try { graph.master.disconnect();   } catch (e) {}
}


/* ══════════════════════════════════════════════════════════════════════════════
   CROSSFADE
   When the note, voicing, or timbre changes while playing, we build a new voice
   graph and crossfade from the old one to the new one over 150 ms using linear
   ramps. This prevents clicks and zipper noise.
   ══════════════════════════════════════════════════════════════════════════════ */

/**
 * Crossfade from the current voice graph (if any) to newGraph.
 * The old graph fades out over rampTime seconds and is destroyed after the
 * ramp plus a small safety margin. The new graph fades in simultaneously.
 *
 * @param {{ master: GainNode, perVoice: GainNode, voices: Array }} newGraph
 */
function crossfadeTo(newGraph) {
  var ctx      = getCtx();
  var now      = ctx.currentTime;
  var rampTime = 0.15;              /* 150 ms crossfade */
  var targetVol = volume / 100;

  if (currentNodes) {
    /* Ramp old graph to silence */
    currentNodes.master.gain.cancelScheduledValues(now);
    currentNodes.master.gain.setValueAtTime(currentNodes.master.gain.value, now);
    currentNodes.master.gain.linearRampToValueAtTime(0, now + rampTime);
    var oldGraph = currentNodes;
    /* Destroy after the ramp finishes + 50 ms safety buffer */
    setTimeout(function () { destroyGraph(oldGraph); }, (rampTime + 0.05) * 1000);
  }

  /* Ramp new graph up to the current volume level */
  newGraph.master.gain.cancelScheduledValues(now);
  newGraph.master.gain.setValueAtTime(0, now);
  newGraph.master.gain.linearRampToValueAtTime(targetVol, now + rampTime);
  currentNodes = newGraph;
}


/* ══════════════════════════════════════════════════════════════════════════════
   DRONE PLAY / STOP CONTROL
   ══════════════════════════════════════════════════════════════════════════════ */

/**
 * Toggle the drone on or off.
 */
function toggleDrone() {
  if (playing) { stopDrone(); } else { startDrone(); }
}

/**
 * Build the effects chain and voice graph, then start playback.
 * Updates the play button UI to the active state.
 */
function startDrone() {
  buildEffectsChain();
  var graph = buildGraph();
  crossfadeTo(graph);
  playing = true;
  document.getElementById('playBtn').classList.add('active');
  document.getElementById('playIcon').textContent = '■';
  document.getElementById('playLabel').textContent = 'PLAYING';
}

/**
 * Fade out and stop the drone.
 * The voice graph is destroyed after the fade; the effects chain is kept alive
 * for a short "reverb tail" period so the convolver can ring down naturally,
 * then destroyed. The tail duration is proportional to the reverb Size setting.
 */
function stopDrone() {
  if (currentNodes) {
    var ctx      = getCtx();
    var now      = ctx.currentTime;
    var rampTime = 0.15;

    currentNodes.master.gain.cancelScheduledValues(now);
    currentNodes.master.gain.setValueAtTime(currentNodes.master.gain.value, now);
    currentNodes.master.gain.linearRampToValueAtTime(0, now + rampTime);

    var oldGraph = currentNodes;
    currentNodes = null;

    /*
     * Reverb tail: keep the effects chain alive long enough to let the
     * convolution ring down. Cap at 2500 ms to avoid a long silence period on
     * very large reverb settings.
     */
    var tailMs = fxReverbEnabled
      ? Math.min((0.5 + fxReverbSize / 100 * 3.5) * 500, 2500)
      : 300;

    setTimeout(function () {
      destroyGraph(oldGraph);
      setTimeout(function () { destroyEffectsChain(); }, tailMs);
    }, (rampTime + 0.05) * 1000);
  }

  playing = false;
  document.getElementById('playBtn').classList.remove('active');
  document.getElementById('playIcon').textContent = '▶';
  document.getElementById('playLabel').textContent = 'TAP TO PLAY';
}

/**
 * Rebuild the voice graph with a crossfade when a playing parameter changes.
 * No-op when stopped.
 */
function rebuildIfPlaying() {
  if (!playing) return;
  var newGraph = buildGraph();
  crossfadeTo(newGraph);
}


/* ══════════════════════════════════════════════════════════════════════════════
   VOICE PARAMETER CHANGE HANDLERS
   ══════════════════════════════════════════════════════════════════════════════ */

/** Handle root note select change. */
function onRootChange() {
  rootNote = document.getElementById('rootSelect').value;
  savePref('root', rootNote);
  updateDisplay();
  rebuildIfPlaying();
}

/** Handle octave select change. */
function onOctaveChange() {
  octave = parseInt(document.getElementById('octaveSelect').value);
  savePref('octave', octave);
  updateDisplay();
  rebuildIfPlaying();
}

/**
 * Handle voicing segmented button selection.
 * @param {string} v - Selected voicing label.
 */
function onVoicingChange(v) {
  voicing = v;
  savePref('voicing', voicing);
  rebuildIfPlaying();
}

/**
 * Handle timbre segmented button selection.
 * @param {string} t - Selected timbre label.
 */
function onTimbreChange(t) {
  timbre = t;
  savePref('timbre', timbre);
  rebuildIfPlaying();
}

/** Handle volume slider input. Updates master gain with a short ramp to avoid zips. */
function onVolumeChange() {
  volume = parseInt(document.getElementById('volSlider').value);
  document.getElementById('volVal').textContent = volume + '%';
  savePref('volume', volume);
  if (currentNodes) {
    var ctx = getCtx();
    var now = ctx.currentTime;
    currentNodes.master.gain.cancelScheduledValues(now);
    currentNodes.master.gain.setValueAtTime(currentNodes.master.gain.value, now);
    currentNodes.master.gain.linearRampToValueAtTime(volume / 100, now + 0.02);
  }
}


/* ══════════════════════════════════════════════════════════════════════════════
   EFFECTS TOGGLE HANDLERS
   ══════════════════════════════════════════════════════════════════════════════ */

/** Enable / disable the LFO filter section. Triggers a full chain rebuild. */
function onFxLFOToggle() {
  fxLFOEnabled = document.getElementById('fxLFOEnabled').checked;
  document.getElementById('fxLFOBody').classList.toggle('fx-off', !fxLFOEnabled);
  savePref('fxLFOEnabled', fxLFOEnabled);
  rebuildEffectsChain();
}

/** Enable / disable the tape delay section. Triggers a full chain rebuild. */
function onFxDelayToggle() {
  fxDelayEnabled = document.getElementById('fxDelayEnabled').checked;
  document.getElementById('fxDelayBody').classList.toggle('fx-off', !fxDelayEnabled);
  savePref('fxDelayEnabled', fxDelayEnabled);
  rebuildEffectsChain();
}

/** Enable / disable the spring reverb section. Triggers a full chain rebuild. */
function onFxReverbToggle() {
  fxReverbEnabled = document.getElementById('fxReverbEnabled').checked;
  document.getElementById('fxReverbBody').classList.toggle('fx-off', !fxReverbEnabled);
  savePref('fxReverbEnabled', fxReverbEnabled);
  rebuildEffectsChain();
}


/* ══════════════════════════════════════════════════════════════════════════════
   EFFECTS PARAMETER CHANGE HANDLERS
   Where possible, parameters are applied live via the fxRefs references stored
   on effectsChain. A full rebuild is only triggered when the change affects the
   graph topology (e.g. changing the reverb IR buffer requires a new convolver).
   ══════════════════════════════════════════════════════════════════════════════ */

/**
 * LFO filter type change (LP / BP / HP).
 * @param {string} type - BiquadFilterNode type string.
 */
function onFxLFOType(type) {
  fxLFOType = type;
  savePref('fxLFOType', fxLFOType);
  updateFxLFOLive();
}

/** @param {string} val - Raw slider value 0–100. */
function onFxLFORate(val) {
  fxLFORate = parseInt(val);
  document.getElementById('fxLFORateVal').textContent = fmtLFORate(fxLFORate);
  savePref('fxLFORate', fxLFORate);
  updateFxLFOLive();
}

/** @param {string} val - Raw slider value 0–100. */
function onFxLFODepth(val) {
  fxLFODepth = parseInt(val);
  document.getElementById('fxLFODepthVal').textContent = fxLFODepth + '%';
  savePref('fxLFODepth', fxLFODepth);
  updateFxLFOLive();
}

/** @param {string} val - Raw slider value 0–100. */
function onFxLFOCutoff(val) {
  fxLFOCutoff = parseInt(val);
  document.getElementById('fxLFOCutoffVal').textContent = fmtCutoff(fxLFOCutoff);
  savePref('fxLFOCutoff', fxLFOCutoff);
  updateFxLFOLive();
}

/** @param {string} val - Raw slider value 0–100. */
function onFxDelayTime(val) {
  fxDelayTime = parseInt(val);
  document.getElementById('fxDelayTimeVal').textContent = fmtDelayTime(fxDelayTime);
  savePref('fxDelayTime', fxDelayTime);
  updateFxDelayLive();
}

/** @param {string} val - Raw slider value 0–85. */
function onFxDelayFb(val) {
  fxDelayFeedback = parseInt(val);
  document.getElementById('fxDelayFbVal').textContent = fxDelayFeedback + '%';
  savePref('fxDelayFeedback', fxDelayFeedback);
  updateFxDelayLive();
}

/** @param {string} val - Raw slider value 0–100. */
function onFxDelayMix(val) {
  fxDelayMix = parseInt(val);
  document.getElementById('fxDelayMixVal').textContent = fxDelayMix + '%';
  savePref('fxDelayMix', fxDelayMix);
  updateFxDelayLive();
}

/**
 * Reverb size change: invalidates the cached IR and forces a full chain rebuild
 * because the ConvolverNode.buffer cannot be hot-swapped while connected.
 * @param {string} val - Raw slider value 0–100.
 */
function onFxReverbSize(val) {
  fxReverbSize = parseInt(val);
  document.getElementById('fxReverbSizeVal').textContent = fxReverbSize + '%';
  savePref('fxReverbSize', fxReverbSize);
  cachedReverbIR = null;      /* force IR regeneration on next buildEffectsChain() */
  rebuildEffectsChain();
}

/** @param {string} val - Raw slider value 0–100. */
function onFxReverbMix(val) {
  fxReverbMix = parseInt(val);
  document.getElementById('fxReverbMixVal').textContent = fxReverbMix + '%';
  savePref('fxReverbMix', fxReverbMix);
  updateFxReverbLive();
}


/* ══════════════════════════════════════════════════════════════════════════════
   SYNC EFFECTS UI FROM STATE
   After restoring preferences at startup, this pushes every effects state
   variable back into the DOM (slider values, toggle checked states, readout
   text, and the LFO type segmented buttons).
   ══════════════════════════════════════════════════════════════════════════════ */

/**
 * Synchronise all effects UI elements with the current JS state variables.
 * Called once during init after restoreSettings().
 */
function syncEffectsUI() {
  /* ── Toggle checked states and body visibility ── */
  document.getElementById('fxLFOEnabled').checked = fxLFOEnabled;
  document.getElementById('fxLFOBody').classList.toggle('fx-off', !fxLFOEnabled);
  document.getElementById('fxDelayEnabled').checked = fxDelayEnabled;
  document.getElementById('fxDelayBody').classList.toggle('fx-off', !fxDelayEnabled);
  document.getElementById('fxReverbEnabled').checked = fxReverbEnabled;
  document.getElementById('fxReverbBody').classList.toggle('fx-off', !fxReverbEnabled);

  /* ── LFO filter slider values and readouts ── */
  document.getElementById('fxLFORate').value         = fxLFORate;
  document.getElementById('fxLFORateVal').textContent  = fmtLFORate(fxLFORate);
  document.getElementById('fxLFODepth').value        = fxLFODepth;
  document.getElementById('fxLFODepthVal').textContent = fxLFODepth + '%';
  document.getElementById('fxLFOCutoff').value       = fxLFOCutoff;
  document.getElementById('fxLFOCutoffVal').textContent = fmtCutoff(fxLFOCutoff);

  /* ── Tape delay slider values and readouts ── */
  document.getElementById('fxDelayTime').value       = fxDelayTime;
  document.getElementById('fxDelayTimeVal').textContent = fmtDelayTime(fxDelayTime);
  document.getElementById('fxDelayFb').value         = fxDelayFeedback;
  document.getElementById('fxDelayFbVal').textContent  = fxDelayFeedback + '%';
  document.getElementById('fxDelayMix').value        = fxDelayMix;
  document.getElementById('fxDelayMixVal').textContent = fxDelayMix + '%';

  /* ── Spring reverb slider values and readouts ── */
  document.getElementById('fxReverbSize').value      = fxReverbSize;
  document.getElementById('fxReverbSizeVal').textContent = fxReverbSize + '%';
  document.getElementById('fxReverbMix').value       = fxReverbMix;
  document.getElementById('fxReverbMixVal').textContent = fxReverbMix + '%';

  /*
   * LFO type segmented buttons: buildSegmented() with raw type values would
   * display "lowpass" / "bandpass" / "highpass" as labels. Instead we build
   * the row manually with abbreviated labels (LP / BP / HP) while keeping the
   * full type string as the internal value.
   */
  var typeRow    = document.getElementById('fxLFOTypeRow');
  typeRow.innerHTML = '';
  var typeLabels = [['lowpass', 'LP'], ['bandpass', 'BP'], ['highpass', 'HP']];
  typeLabels.forEach(function (pair) {
    var t   = pair[0];
    var label = pair[1];
    var btn = document.createElement('button');
    btn.className  = 'seg-btn' + (t === fxLFOType ? ' active' : '');
    btn.textContent = label;
    btn.addEventListener('click', function () {
      typeRow.querySelectorAll('.seg-btn').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      onFxLFOType(t);
    });
    typeRow.appendChild(btn);
  });
}


/* ══════════════════════════════════════════════════════════════════════════════
   RESTORE SETTINGS FROM LOCALSTORAGE
   ══════════════════════════════════════════════════════════════════════════════ */

/**
 * Load persisted preferences and apply them to the JS state variables.
 * Also applies the saved display mode (light/dark). Called once at startup,
 * before any UI builder functions.
 */
function restoreSettings() {
  var p = loadPrefs();

  /* Voice parameters */
  if (p.root   && NOTES.includes(p.root))                       rootNote = p.root;
  if (p.octave !== undefined && p.octave >= 2 && p.octave <= 5) octave   = p.octave;
  if (p.voicing && VOICINGS.includes(p.voicing))                voicing  = p.voicing;
  if (p.timbre  && TIMBRES.includes(p.timbre))                  timbre   = p.timbre;
  if (p.volume  !== undefined && p.volume >= 0 && p.volume <= 100) volume = p.volume;

  /* LFO filter */
  if (p.fxLFOEnabled !== undefined)                                        fxLFOEnabled = !!p.fxLFOEnabled;
  if (p.fxLFOType && ['lowpass', 'bandpass', 'highpass'].includes(p.fxLFOType)) fxLFOType = p.fxLFOType;
  if (p.fxLFORate    !== undefined) fxLFORate    = +p.fxLFORate;
  if (p.fxLFODepth   !== undefined) fxLFODepth   = +p.fxLFODepth;
  if (p.fxLFOCutoff  !== undefined) fxLFOCutoff  = +p.fxLFOCutoff;

  /* Tape delay */
  if (p.fxDelayEnabled  !== undefined) fxDelayEnabled  = !!p.fxDelayEnabled;
  if (p.fxDelayTime     !== undefined) fxDelayTime     = +p.fxDelayTime;
  if (p.fxDelayFeedback !== undefined) fxDelayFeedback = +p.fxDelayFeedback;
  if (p.fxDelayMix      !== undefined) fxDelayMix      = +p.fxDelayMix;

  /* Spring reverb */
  if (p.fxReverbEnabled !== undefined) fxReverbEnabled = !!p.fxReverbEnabled;
  if (p.fxReverbSize    !== undefined) fxReverbSize    = +p.fxReverbSize;
  if (p.fxReverbMix     !== undefined) fxReverbMix     = +p.fxReverbMix;

  /* Theme mode */
  applyMode(p.mode || 'light', true);
}


/* ══════════════════════════════════════════════════════════════════════════════
   INITIALISATION
   ══════════════════════════════════════════════════════════════════════════════ */

restoreSettings();

/* Build all select menus and segmented button rows */
buildRootSelect();
buildOctaveSelect();
buildSegmented('voicingRow', VOICINGS, voicing, onVoicingChange);
buildSegmented('timbreRow',  TIMBRES,  timbre,  onTimbreChange);

/* Sync select values to restored state (buildRootSelect/buildOctaveSelect set
   inner HTML but the .value assignment here ensures they reflect any
   restored preference that differs from the default) */
document.getElementById('rootSelect').value   = rootNote;
document.getElementById('octaveSelect').value = octave;
document.getElementById('volSlider').value    = volume;
document.getElementById('volVal').textContent = volume + '%';

updateDisplay();
syncEffectsUI();
