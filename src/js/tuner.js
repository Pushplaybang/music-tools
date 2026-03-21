/**
 * tuner.js — Instrument Tuner
 *
 * Description : Real-time chromatic pitch-detection tuner for guitar, bass,
 *               ukulele, and any manually specified note. Uses the Web Audio
 *               API and an autocorrelation-based (YIN-lite) pitch detector.
 *               Renders a scrolling pitch-history trace via Canvas.
 *
 * LocalStorage key: musicTool_StrobeTuner_v1
 */

/* ═══════════════════════════════════════════ */
/*  PERSISTENCE                                */
/* ═══════════════════════════════════════════ */

/** Unique key that namespaces all persisted preferences for this tool. */
const LS = 'musicTool_StrobeTuner_v1';

/**
 * Persist a single key-value pair under the tool's localStorage namespace.
 * Silently swallows errors (e.g. private-browsing quota exceeded).
 *
 * @param {string} k - Preference key.
 * @param {*}      v - Serialisable value.
 */
function savePref(k, v) {
  try {
    const d = JSON.parse(localStorage.getItem(LS) || '{}');
    d[k] = v;
    localStorage.setItem(LS, JSON.stringify(d));
  } catch (e) { /* ignore */ }
}

/**
 * Load all persisted preferences as a plain object.
 * Returns an empty object if nothing has been saved yet.
 *
 * @returns {Object}
 */
function loadPrefs() {
  try {
    return JSON.parse(localStorage.getItem(LS) || '{}');
  } catch (e) {
    return {};
  }
}


/* ═══════════════════════════════════════════ */
/*  THEME / MODE                               */
/* ═══════════════════════════════════════════ */

/**
 * Apply light or dark mode to the document body and update the badge label.
 *
 * @param {string}  m      - 'light' or 'dark'.
 * @param {boolean} noSave - When truthy, skip persisting (used during init).
 */
function applyMode(m, noSave) {
  document.body.dataset.mode = m;
  const badge = document.getElementById('modeBadge');
  if (badge) badge.textContent = m === 'dark' ? 'DARK' : 'LIGHT';
  if (!noSave) saveTheme('mode', m);
  applyAccent(document.body.dataset.accent || loadTheme().accent || 'orange', true);
}

/* Toggle light ↔ dark when the mode pill is clicked */
document.getElementById('modeToggle').addEventListener('click', () => {
  applyMode(document.body.dataset.mode === 'dark' ? 'light' : 'dark');
});


/* ═══════════════════════════════════════════ */
/*  MODALS                                     */
/* ═══════════════════════════════════════════ */

/**
 * Show a modal overlay and lock page scroll.
 * @param {string} id - Element ID of the overlay.
 */
function openModal(id) {
  document.getElementById(id).classList.add('show');
  document.body.style.overflow = 'hidden';
}

/**
 * Hide a modal overlay and restore page scroll.
 * @param {string} id - Element ID of the overlay.
 */
function closeModal(id) {
  document.getElementById(id).classList.remove('show');
  document.body.style.overflow = '';
}

/* Click outside the modal card to dismiss */
document.querySelectorAll('.modal-overlay').forEach(ov => {
  ov.addEventListener('click', e => {
    if (e.target === ov) closeModal(ov.id);
  });
});


/* ═══════════════════════════════════════════ */
/*  MUSIC DATA                                 */
/* ═══════════════════════════════════════════ */

/** Chromatic note names in ascending semitone order. */
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/** Maps ASCII sharp names to Unicode sharp symbols for display. */
const NOTE_DISPLAY = {
  'C#': 'C♯', 'D#': 'D♯', 'F#': 'F♯', 'G#': 'G♯', 'A#': 'A♯',
};

/**
 * Return the display-friendly version of a note name (e.g. 'F#' → 'F♯').
 * Falls back to the raw name for natural notes.
 *
 * @param {string} n - Note name such as 'C', 'F#'.
 * @returns {string}
 */
const displayNote = n => NOTE_DISPLAY[n] || n;

/** A4 reference frequency in Hz. Adjustable via calibration controls. */
let A4 = 440;


/* ═══════════════════════════════════════════ */
/*  FREQUENCY / MIDI HELPERS                   */
/* ═══════════════════════════════════════════ */

/**
 * Convert a MIDI note number to a frequency in Hz using the current A4 value.
 * Formula: f = A4 × 2^((m − 69) / 12)
 *
 * @param {number} m - MIDI note number (e.g. 69 = A4).
 * @returns {number} Frequency in Hz.
 */
function midiFreq(m) {
  return A4 * Math.pow(2, (m - 69) / 12);
}

/**
 * Convert a frequency in Hz to a (fractional) MIDI note number.
 * Inverse of midiFreq. Used to determine cents deviation.
 *
 * @param {number} f - Frequency in Hz.
 * @returns {number} Fractional MIDI note number.
 */
function freqToMidi(f) {
  return 69 + 12 * Math.log2(f / A4);
}

/**
 * Return the note name for a given MIDI number (wraps around octaves).
 *
 * @param {number} midi - MIDI note number (integer).
 * @returns {string} e.g. 'A', 'C#'.
 */
function noteName(midi) {
  return NOTES[((midi % 12) + 12) % 12];
}

/**
 * Return the octave number for a given MIDI note number.
 * MIDI 60 = C4, so octave = floor(midi / 12) − 1.
 *
 * @param {number} midi - MIDI note number.
 * @returns {number}
 */
function noteOctave(midi) {
  return Math.floor(midi / 12) - 1;
}


/* ═══════════════════════════════════════════ */
/*  INSTRUMENT & TUNING PRESET DATA            */
/* ═══════════════════════════════════════════ */

/**
 * Master instrument definition object.
 * Each instrument has:
 *   presets — keyed object of tuning name → array of note strings (e.g. 'E2').
 *   labels  — short string labels for each string button (e.g. 'E', 'A').
 * 'Manual' is a special case with no presets and no string buttons.
 */
const INSTRUMENTS = {
  'Guitar': {
    presets: {
      'Standard (EADGBE)':    ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'],
      'Drop D (DADGBE)':      ['D2', 'A2', 'D3', 'G3', 'B3', 'E4'],
      'Open G (DGDGBD)':      ['D2', 'G2', 'D3', 'G3', 'B3', 'D4'],
      'Open D (DADF#AD)':     ['D2', 'A2', 'D3', 'F#3', 'A3', 'D4'],
      'Open E (EBEG#BE)':     ['E2', 'B2', 'E3', 'G#3', 'B3', 'E4'],
      'Open A (EAEAC#E)':     ['E2', 'A2', 'E3', 'A3', 'C#4', 'E4'],
      'DADGAD':               ['D2', 'A2', 'D3', 'G3', 'A3', 'D4'],
      'Half Step Down (Eb)':  ['Eb2', 'Bb2', 'Eb3', 'Ab3', 'C4', 'F4'],
    },
    labels: ['E', 'A', 'D', 'G', 'B', 'e'],
  },
  'Bass': {
    presets: {
      'Standard (EADG)': ['E1', 'A1', 'D2', 'G2'],
      'Drop D (DADG)':   ['D1', 'A1', 'D2', 'G2'],
      '5-String (BEADG)':['B0', 'E1', 'A1', 'D2', 'G2'],
      'Half Step Down':  ['Eb1', 'Ab1', 'Db2', 'Gb2'],
    },
    labels: ['E', 'A', 'D', 'G'],
  },
  'Ukulele': {
    presets: {
      'Soprano GCEA':     ['G4', 'C4', 'E4', 'A4'],
      'Low G GCEA':       ['G3', 'C4', 'E4', 'A4'],
      'Baritone (DGBE)':  ['D3', 'G3', 'B3', 'E4'],
      'D Tuning (ADF#B)': ['A3', 'D4', 'F#4', 'B4'],
    },
    labels: ['G', 'C', 'E', 'A'],
  },
  /* Manual mode: no preset strings — user picks root note + octave. */
  'Manual': { presets: {}, labels: [] },
};

/**
 * Parse a note string such as 'E4', 'F#3', or 'Eb2' into its components.
 * Normalises flat spellings to their sharp equivalents.
 *
 * @param {string} s - Note string to parse.
 * @returns {{ note: string, octave: number, midi: number } | null}
 */
function parseNoteStr(s) {
  const match = s.match(/^([A-G][#b]?)(\d+)$/);
  if (!match) return null;

  let n = match[1];
  const oct = parseInt(match[2]);

  /* Convert flat spellings to sharps so they index into NOTES correctly */
  const flatMap = {
    'Bb': 'A#', 'Eb': 'D#', 'Ab': 'G#', 'Db': 'C#', 'Gb': 'F#', 'Cb': 'B',
  };
  if (flatMap[n]) n = flatMap[n];

  return {
    note: n,
    octave: oct,
    midi: (oct + 1) * 12 + NOTES.indexOf(n),
  };
}


/* ═══════════════════════════════════════════ */
/*  APPLICATION STATE                          */
/* ═══════════════════════════════════════════ */

/* -- Instrument selection state -- */
let currentInstrument = 'Guitar';
let currentPreset     = 'Standard (EADGBE)';
let currentStringIdx  = 0;   // Index into the active tuning preset array

/* -- Target note -- */
let targetMidi = null;   // MIDI number of the current target string/note
let targetFreq = null;   // Hz equivalent of targetMidi (recalculated when A4 changes)

/* -- A4 calibration -- */
let a4 = 440;            // Local copy of A4 (kept in sync with the global A4)

/* -- Microphone / Audio API handles -- */
let micActive   = false;
let audioCtx    = null;   // AudioContext for the microphone signal chain
let analyser    = null;   // AnalyserNode feeding the pitch detector
let mediaStream = null;   // MediaStream from getUserMedia
let rafHandle   = null;   // requestAnimationFrame handle for the detect loop

/* -- Detected pitch state -- */
let detectedCents = 0;
let detectedFreq  = 0;
let detectedNote  = '';
let detectedOct   = 0;

/**
 * Exponentially-smoothed cents value used to drive the needle position.
 * Smoothing factor: 0.15 (applied each animation frame, ~60 fps).
 * Raw cents are shown in the text readout for precision.
 */
let smoothedCents = 0;

/* -- Pitch trace ring buffer -- */

/** Number of samples retained in the scrolling pitch trace. */
const TRACE_SIZE = 240;

/**
 * Ring buffer of smoothed cents values (or null for silence).
 * Drawn left-to-right from traceHead to traceHead-1 (oldest to newest).
 */
let traceBuffer = new Array(TRACE_SIZE).fill(null);

/** Write head index into traceBuffer (wraps at TRACE_SIZE). */
let traceHead = 0;


/* ═══════════════════════════════════════════ */
/*  A4 CALIBRATION                             */
/* ═══════════════════════════════════════════ */

/**
 * Nudge A4 reference frequency by a given number of Hz.
 * @param {number} d - Delta in Hz (typically ±1).
 */
function adjustA4(d) {
  setA4(a4 + d);
}

/**
 * Set A4 reference frequency, clamp to the valid range [420, 460] Hz,
 * update UI, recalculate the target frequency, and persist.
 *
 * @param {number} v - Desired A4 frequency in Hz.
 */
function setA4(v) {
  v = Math.max(420, Math.min(460, v));
  a4 = v;
  A4 = v;   // keep the global in sync so midiFreq() uses the new value
  document.getElementById('a4Display').textContent = v;
  document.getElementById('a4Slider').value = v;
  updateTarget();
  savePref('a4', v);
}


/* ═══════════════════════════════════════════ */
/*  SELECT / BUTTON BUILDERS                   */
/* ═══════════════════════════════════════════ */

/** Populate the instrument <select> from INSTRUMENTS keys. */
function buildInstrumentSelect() {
  const sel = document.getElementById('instrumentSelect');
  sel.innerHTML = '';
  Object.keys(INSTRUMENTS).forEach(k => {
    const o = document.createElement('option');
    o.value = k;
    o.textContent = k;
    sel.appendChild(o);
  });
}

/** Populate the tuning-preset <select> for the current instrument. */
function buildTuningPresetSelect() {
  const sel = document.getElementById('tuningPresetSelect');
  sel.innerHTML = '';
  const presets = INSTRUMENTS[currentInstrument].presets;
  Object.keys(presets).forEach(k => {
    const o = document.createElement('option');
    o.value = k;
    o.textContent = k;
    sel.appendChild(o);
  });
  /* Restore saved preset or fall back to the first available */
  if (currentPreset && presets[currentPreset]) {
    sel.value = currentPreset;
  } else {
    currentPreset = Object.keys(presets)[0] || '';
    sel.value = currentPreset;
  }
}

/** Populate the manual note and octave <select> elements. */
function buildManualSelects() {
  /* Root note selector */
  const ns = document.getElementById('manualNoteSelect');
  ns.innerHTML = '';
  NOTES.forEach(n => {
    const o = document.createElement('option');
    o.value = n;
    o.textContent = displayNote(n);
    ns.appendChild(o);
  });

  /* Octave selector (0–8) */
  const os = document.getElementById('manualOctaveSelect');
  os.innerHTML = '';
  for (let i = 0; i <= 8; i++) {
    const o = document.createElement('option');
    o.value = i;
    o.textContent = 'Oct ' + i;
    os.appendChild(o);
  }
  os.value = 4;   // default to octave 4 (middle range)
}

/**
 * Render the string-selector buttons for the active preset.
 * In Manual mode, this area is left empty.
 */
function buildStringButtons() {
  const row = document.getElementById('stringRow');
  row.innerHTML = '';

  if (currentInstrument === 'Manual') return;

  const preset = INSTRUMENTS[currentInstrument].presets[currentPreset];
  const labels = INSTRUMENTS[currentInstrument].labels;
  if (!preset) return;

  preset.forEach((noteStr, i) => {
    const parsed = parseNoteStr(noteStr);
    if (!parsed) return;

    const btn = document.createElement('button');
    btn.className = 'str-btn' + (i === currentStringIdx ? ' active' : '');

    /* Show the human-readable string label (e.g. 'E') and the note+octave below */
    const lbl = labels[i] || parsed.note;
    btn.innerHTML =
      `<span style="font-weight:700">${lbl}</span>` +
      `<br><span style="font-size:.55rem;opacity:.7">${displayNote(parsed.note)}${parsed.octave}</span>`;

    btn.addEventListener('click', () => {
      currentStringIdx = i;
      buildStringButtons();
      updateTarget();
      savePref('stringIdx', i);
    });

    row.appendChild(btn);
  });
}


/* ═══════════════════════════════════════════ */
/*  CHANGE HANDLERS                            */
/* ═══════════════════════════════════════════ */

/** Called when the user changes the instrument select. */
function onInstrumentChange() {
  currentInstrument = document.getElementById('instrumentSelect').value;
  currentStringIdx = 0;

  const isManual = currentInstrument === 'Manual';

  /* Toggle visibility of preset vs. manual controls */
  document.getElementById('tuningPresetGroup').style.display  = isManual ? 'none' : '';
  document.getElementById('manualNoteGroup').style.display    = isManual ? '' : 'none';
  document.getElementById('manualOctaveGroup').style.display  = isManual ? '' : 'none';

  if (!isManual) buildTuningPresetSelect();
  buildStringButtons();
  updateTarget();

  savePref('instrument', currentInstrument);
  savePref('preset', currentPreset);
}

/** Called when the user changes the tuning-preset select. */
function onTuningPresetChange() {
  currentPreset = document.getElementById('tuningPresetSelect').value;
  currentStringIdx = 0;
  buildStringButtons();
  updateTarget();
  savePref('preset', currentPreset);
}

/** Called when either manual note or manual octave select changes. */
function onManualChange() {
  updateTarget();
}

/**
 * Recalculate targetMidi and targetFreq from the current selection and
 * refresh the reference-note display (note name + Hz).
 */
function updateTarget() {
  if (currentInstrument === 'Manual') {
    const note = document.getElementById('manualNoteSelect').value;
    const oct  = parseInt(document.getElementById('manualOctaveSelect').value);
    targetMidi = (oct + 1) * 12 + NOTES.indexOf(note);
    targetFreq = midiFreq(targetMidi);
    document.getElementById('refNoteVal').textContent  = displayNote(note) + oct;
    document.getElementById('refFreqVal').textContent  = targetFreq.toFixed(2) + ' Hz';
  } else {
    const preset = INSTRUMENTS[currentInstrument].presets[currentPreset];
    if (!preset || currentStringIdx >= preset.length) return;

    const parsed = parseNoteStr(preset[currentStringIdx]);
    if (!parsed) return;

    targetMidi = parsed.midi;
    targetFreq = midiFreq(targetMidi);
    document.getElementById('refNoteVal').textContent  = displayNote(parsed.note) + parsed.octave;
    document.getElementById('refFreqVal').textContent  = targetFreq.toFixed(2) + ' Hz';
  }
}


/* ═══════════════════════════════════════════ */
/*  PITCH DETECTION — AUTOCORRELATION (YIN-lite) */
/* ═══════════════════════════════════════════ */

/**
 * Estimate the fundamental frequency of a PCM audio buffer using a simplified
 * autocorrelation algorithm (inspired by YIN).
 *
 * Algorithm overview:
 *   1. Compute RMS to gate on silence — return -1 if the signal is too quiet.
 *   2. Trim the buffer to the first zero-crossing region to reduce edge
 *      effects from the FFT window.
 *   3. Build the autocorrelation function c[i] = Σ buf[j] × buf[j+i].
 *   4. Skip the leading peak at lag=0 (self-correlation), then find the
 *      highest subsequent peak — its lag index is the period in samples.
 *   5. Apply parabolic interpolation around the peak for sub-sample accuracy.
 *   6. Return sampleRate / interpolatedPeriod as the frequency in Hz.
 *
 * @param {Float32Array} buf        - PCM audio samples in [-1, 1].
 * @param {number}       sampleRate - Audio context sample rate in Hz.
 * @returns {number} Detected frequency in Hz, or -1 if no pitch detected.
 */
function autoCorrelate(buf, sampleRate) {
  const SIZE = buf.length;

  /* ── Gate: ignore frames where RMS falls below the noise floor ── */
  const rms = Math.sqrt(buf.reduce((s, x) => s + x * x, 0) / SIZE);
  if (rms < 0.008) return -1;

  /* ── Trim to first zero-crossing region to reduce windowing artefacts ── */
  let r1 = 0, r2 = SIZE - 1;
  for (let i = 0; i < SIZE / 2; i++) { if (buf[i] < 0) { r1 = i; break; } }
  for (let i = 1; i < SIZE / 2; i++) { if (buf[SIZE - i] < 0) { r2 = SIZE - i; break; } }

  const buf2  = buf.slice(r1, r2);
  const size2 = buf2.length;
  const MAX_SAMPLES = Math.floor(size2 / 2);

  /* ── Build autocorrelation function ── */
  const c = new Float32Array(MAX_SAMPLES);
  for (let i = 0; i < MAX_SAMPLES; i++) {
    /* Dot-product of the buffer with a lagged version of itself */
    for (let j = 0; j < Math.min(MAX_SAMPLES, size2 - i); j++) {
      c[i] += buf2[j] * buf2[j + i];
    }
  }

  /* ── Skip the initial descending slope (lag=0 peak) ── */
  let d = 0;
  while (c[d] > c[d + 1]) d++;

  /* ── Find the highest peak after the initial slope ── */
  let maxC = -1, maxPos = -1;
  for (let i = d; i < MAX_SAMPLES; i++) {
    if (c[i] > maxC) { maxC = c[i]; maxPos = i; }
  }

  /* No valid peak found */
  if (maxPos < 0 || maxC < 0.01) return -1;

  /* ── Parabolic interpolation for sub-sample period accuracy ──
     Fits a parabola through the three samples around the peak and
     solves for the true maximum, giving fractional lag refinement.     */
  const beter1 = c[maxPos - 1] || c[maxPos];
  const beter2 = c[maxPos + 1] || c[maxPos];
  const x = 0.5 * (beter1 - beter2) / (beter1 - 2 * c[maxPos] + beter2);

  /* Period in samples → frequency in Hz */
  return sampleRate / (maxPos + x);
}


/* ═══════════════════════════════════════════ */
/*  MICROPHONE                                 */
/* ═══════════════════════════════════════════ */

/**
 * Start microphone capture and kick off the pitch-detection loop.
 * Requests raw audio by disabling browser processing (echo cancellation,
 * auto-gain, noise suppression) so the autocorrelation gets clean samples.
 */
async function toggleMic() {
  if (micActive) { stopMic(); return; }
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        autoGainControl:  false,
        noiseSuppression: false,
      },
      video: false,
    });

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaStreamSource(mediaStream);

    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 4096;   // large FFT for better low-frequency resolution
    source.connect(analyser);

    micActive = true;
    document.getElementById('micBtn').classList.add('active');
    document.getElementById('micBtn').textContent = '🎙️';
    document.getElementById('micBtnLabel').textContent = 'LISTENING…';
    document.getElementById('micStatus').textContent = 'Microphone active';
    savePref('micPref', true);

    detectLoop();
    startTraceLoop();
  } catch (e) {
    document.getElementById('micStatus').textContent = 'Mic permission denied';
    document.getElementById('micBtnLabel').textContent = 'TAP TO LISTEN';
  }
}

/** Stop the microphone, close the AudioContext, and reset the display. */
function stopMic() {
  micActive = false;

  if (mediaStream)  { mediaStream.getTracks().forEach(t => t.stop()); mediaStream = null; }
  if (audioCtx)     { audioCtx.close(); audioCtx = null; }
  if (rafHandle)    { cancelAnimationFrame(rafHandle); rafHandle = null; }

  document.getElementById('micBtn').classList.remove('active');
  document.getElementById('micBtn').textContent = '🎤';
  document.getElementById('micBtnLabel').textContent = 'TAP TO LISTEN';
  document.getElementById('micStatus').textContent = '';

  resetDisplay();

  /* Clear trace state */
  traceBuffer.fill(null);
  traceHead = 0;
  smoothedCents = 0;

  const lf = document.getElementById('levelFill');
  if (lf) lf.style.width = '0%';

  savePref('micPref', false);
}

/** Reset all tuner UI elements to their idle / no-signal state. */
function resetDisplay() {
  document.getElementById('noteDisplay').textContent = '—';
  document.getElementById('octaveDisplay').textContent = '';
  document.getElementById('freqDisplay').textContent = '— Hz';
  document.getElementById('centsDisplay').textContent = '';
  document.getElementById('centsDisplay').className = 'cents-readout';
  document.getElementById('meterNeedle').style.left = '50%';
  document.getElementById('inTuneLed').classList.remove('lit');

  const td = document.getElementById('tunerDisplay');
  if (td) td.classList.remove('in-tune', 'pulse');

  const pitchFill = document.getElementById('pitchBarFill');
  const pitchVal  = document.getElementById('pitchBarVal');
  if (pitchFill) pitchFill.style.width = '50%';
  if (pitchVal)  pitchVal.textContent = '—';
}


/* ═══════════════════════════════════════════ */
/*  DETECT LOOP                                */
/* ═══════════════════════════════════════════ */

/**
 * Main pitch-detection loop, driven by requestAnimationFrame (~60 fps).
 *
 * Each frame:
 *   1. Pull a time-domain PCM snapshot from the AnalyserNode.
 *   2. Compute RMS and update the level-meter bar.
 *   3. Run autocorrelation to get a detected frequency.
 *   4. In Autodetect mode, measure cents from the nearest chromatic note.
 *      In Manual mode, measure cents relative to the selected target.
 *   5. Exponentially smooth the cents value for the needle animation.
 *   6. Push the smoothed value (or null for silence) into the trace ring buffer.
 *   7. Update all display elements.
 */
function detectLoop() {
  if (!micActive) return;

  const buf = new Float32Array(analyser.fftSize);
  analyser.getFloatTimeDomainData(buf);

  /* ── Input level meter ── */
  let sumSquares = 0;
  for (let i = 0; i < buf.length; i++) {
    const sample = buf[i];
    sumSquares += sample * sample;
  }
  const rms = Math.sqrt(sumSquares / buf.length);

  const lf = document.getElementById('levelFill');
  if (lf) {
    /* Map RMS to a 0–100% bar width; colour shifts grey → accent → red */
    lf.style.width      = Math.min(100, Math.round(rms / 0.3 * 100)) + '%';
    lf.style.background =
      rms < 0.01 ? 'var(--muted)' :
      rms < 0.15 ? 'var(--accent)' :
                   'var(--wrong)';
  }

  /* ── Pitch detection ── */
  const freq       = autoCorrelate(buf, audioCtx.sampleRate);
  const autodetect = document.getElementById('autodetectToggle').checked;

  if (freq > 30 && freq < 5000) {
    /* Valid pitch detected */
    const midi        = freqToMidi(freq);
    const nearestMidi = Math.round(midi);

    detectedFreq = freq;
    detectedNote = noteName(nearestMidi);
    detectedOct  = noteOctave(nearestMidi);

    let displayCents;

    if (autodetect) {
      /* Autodetect: cents from the nearest chromatic note.
         (midi − nearestMidi) × 100 gives the fractional semitone offset. */
      displayCents = Math.round((midi - nearestMidi) * 100);
      document.getElementById('autodetectNote').textContent = '';
    } else {
      /* Manual target: cents from the user-selected note frequency.
         Using log2 ratio × 1200 is the standard formula for cents. */
      if (targetFreq) {
        displayCents = Math.round(Math.log2(freq / targetFreq) * 1200);
        displayCents = Math.max(-50, Math.min(50, displayCents));
      } else {
        displayCents = Math.round((midi - nearestMidi) * 100);
      }
    }

    detectedCents = Math.max(-50, Math.min(50, displayCents));

    /* ── Exponential smoothing for needle animation ──
       α = 0.15 keeps the needle relatively stable; the raw value is used
       for the text readout so musicians see the true measurement.          */
    smoothedCents += (detectedCents - smoothedCents) * 0.15;

    /* Push smoothed value into the ring buffer for the pitch trace */
    traceBuffer[traceHead] = smoothedCents;
    traceHead = (traceHead + 1) % TRACE_SIZE;

    updateTunerDisplay(detectedNote, detectedOct, freq, detectedCents, autodetect, smoothedCents);
  } else {
    /* No pitch detected — smoothly drift the needle back to centre */
    smoothedCents += (0 - smoothedCents) * 0.15;
    traceBuffer[traceHead] = null;
    traceHead = (traceHead + 1) % TRACE_SIZE;

    document.getElementById('meterNeedle').style.left = (50 + smoothedCents) + '%';
  }

  rafHandle = requestAnimationFrame(detectLoop);
}

/**
 * Update all tuner display elements for a newly detected pitch.
 *
 * @param {string}  note      - Detected note name (e.g. 'F#').
 * @param {number}  oct       - Detected octave (e.g. 4).
 * @param {number}  freq      - Raw detected frequency in Hz.
 * @param {number}  cents     - Raw cents deviation (−50 to +50).
 * @param {boolean} autodetect - Whether autodetect mode is active.
 * @param {number}  smoothed  - Smoothed cents value for needle position.
 */
function updateTunerDisplay(note, oct, freq, cents, autodetect, smoothed) {
  /* ── Note name with Unicode sharp superscript ── */
  const parts = note.split('#');
  if (parts.length > 1) {
    document.getElementById('noteDisplay').innerHTML =
      parts[0] + '<span class="note-sharp">♯</span>';
  } else {
    document.getElementById('noteDisplay').textContent = note;
  }
  document.getElementById('octaveDisplay').textContent = oct;
  document.getElementById('freqDisplay').textContent   = freq.toFixed(1) + ' Hz';

  if (autodetect) {
    document.getElementById('autodetectNote').textContent = 'Nearest: ' + displayNote(note) + oct;
  }

  /* ── Needle position — uses smoothed value to reduce jitter ── */
  document.getElementById('meterNeedle').style.left = (50 + (smoothed ?? cents)) + '%';

  /* ── Needle colour — indicates tuning accuracy ── */
  const needle  = document.getElementById('meterNeedle');
  const inTune  = Math.abs(cents) <= 2;

  if (inTune) {
    needle.style.background = 'var(--cents-in)';
    needle.style.boxShadow  = '0 0 0 2px var(--meter-bg), 0 0 12px var(--cents-in)';
  } else if (Math.abs(cents) > 15) {
    /* Strongly off — use sharp/flat colour with a bright glow */
    needle.style.background = cents > 0 ? 'var(--cents-sharp)' : 'var(--cents-flat)';
    needle.style.boxShadow  = '0 0 0 2px var(--meter-bg), 0 0 12px var(--wrong-glow)';
  } else if (cents > 0) {
    needle.style.background = 'var(--cents-sharp)';
    needle.style.boxShadow  = '0 0 0 2px var(--meter-bg), 0 0 8px var(--cents-sharp)';
  } else {
    needle.style.background = 'var(--cents-flat)';
    needle.style.boxShadow  = '0 0 0 2px var(--meter-bg), 0 0 8px var(--cents-flat)';
  }

  /* ── Cents text readout — uses raw integer for precision ── */
  const cd = document.getElementById('centsDisplay');
  if (inTune) {
    cd.textContent = '✓ IN TUNE';
    cd.className   = 'cents-readout in-tune';
  } else if (cents > 0) {
    cd.textContent = '+' + cents + '¢ sharp';
    cd.className   = 'cents-readout sharp';
  } else {
    cd.textContent = cents + '¢ flat';
    cd.className   = 'cents-readout flat';
  }

  /* ── In-tune LED and display glow ── */
  document.getElementById('inTuneLed').classList.toggle('lit', inTune);

  const tunerDisp = document.getElementById('tunerDisplay');
  if (tunerDisp) {
    tunerDisp.classList.toggle('in-tune', inTune);
    /* 'pulse' adds the breathing animation — only when very close (< 5 ¢) */
    tunerDisp.classList.toggle('pulse', inTune && Math.abs(cents) < 5);
  }

  /* ── Pitch deviation bar ──
     Maps the −50 to +50 ¢ range onto a 0–100% progress bar.
     Centred at 50% = 0 ¢ deviation.                              */
  const pitchFill  = document.getElementById('pitchBarFill');
  const pitchVal   = document.getElementById('pitchBarVal');
  if (pitchFill && pitchVal) {
    const pct = Math.max(0, Math.min(100, ((cents + 50) / 100) * 100));
    pitchFill.style.width = pct + '%';
    pitchVal.textContent  = (cents >= 0 ? '+' : '') + Math.round(cents) + '¢';

    /* Green gradient when in tune, accent gradient when off */
    pitchFill.style.background = Math.abs(cents) < 5
      ? 'linear-gradient(90deg, var(--correct), var(--accent))'
      : 'linear-gradient(90deg, var(--accent), var(--accent2))';
  }
}


/* ═══════════════════════════════════════════ */
/*  PITCH TRACE CANVAS                         */
/* ═══════════════════════════════════════════ */

/** Canvas element for the scrolling pitch-history trace. */
const canvas = document.getElementById('strobeCanvas');

/** requestAnimationFrame handle for the trace drawing loop (separate from detectLoop). */
let traceAnimFrame = null;

/* -- Theme colour cache --
   Computing getComputedStyle on every frame is expensive. Instead we cache
   the relevant CSS custom-property values and invalidate the cache whenever
   the data-mode attribute on the body changes.                             */
let cachedClrAccent;
let cachedClrCorrect;
let cachedClrBorder;

/** Pull the current theme's CSS custom-property values into the local cache. */
function updateTraceThemeColors() {
  const cs = getComputedStyle(document.body);
  cachedClrAccent  = cs.getPropertyValue('--accent').trim();
  cachedClrCorrect = cs.getPropertyValue('--correct').trim();
  cachedClrBorder  = cs.getPropertyValue('--border').trim();
}

/**
 * MutationObserver that invalidates the colour cache whenever the
 * data-mode attribute changes (light ↔ dark toggle).
 */
const traceThemeObserver = new MutationObserver(mutationsList => {
  for (const mutation of mutationsList) {
    if (mutation.type === 'attributes' && mutation.attributeName === 'data-mode') {
      updateTraceThemeColors();
      break;
    }
  }
});

traceThemeObserver.observe(document.documentElement || document.body, {
  attributes: true,
  attributeFilter: ['data-mode'],
});

/* Populate the cache with the page's initial theme */
updateTraceThemeColors();

/**
 * Ensure the canvas pixel dimensions match the element's CSS size × DPR
 * to avoid blurry rendering on high-density displays.
 */
function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  const W = canvas.offsetWidth;
  const H = canvas.offsetHeight;
  if (!W || !H) return;

  const targetW = Math.round(W * dpr);
  const targetH = Math.round(H * dpr);

  /* Only resize if dimensions actually changed to avoid layout thrashing */
  if (canvas.width !== targetW || canvas.height !== targetH) {
    canvas.width  = targetW;
    canvas.height = targetH;
  }
}

/**
 * Draw one frame of the scrolling pitch-history trace on the canvas.
 *
 * Drawing approach:
 *   - The ring buffer contains TRACE_SIZE samples ordered from oldest
 *     (at traceHead) to newest (at traceHead − 1 mod TRACE_SIZE).
 *   - Each sample maps to a horizontal bucket of width W / TRACE_SIZE.
 *   - The y-axis represents cents deviation: centre = 0 ¢, top = +50 ¢,
 *     bottom = −50 ¢.
 *   - Segments are coloured green (within ±5 ¢) or accent (further out).
 *   - The leftmost 20% of segments fade to transparent for a visual trail.
 *   - Gaps (null samples) are skipped so silence appears as blank space.
 */
function drawPitchTrace() {
  resizeCanvas();

  const dpr = window.devicePixelRatio || 1;
  const W   = canvas.offsetWidth;
  const H   = canvas.offsetHeight;

  if (!W || !H) {
    /* Canvas not yet visible; reschedule if mic is running */
    traceAnimFrame = micActive ? requestAnimationFrame(drawPitchTrace) : null;
    return;
  }

  const ctx = canvas.getContext('2d');
  /* Apply DPR transform so all drawing coordinates are in CSS pixels */
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);

  const clrAccent  = cachedClrAccent;
  const clrCorrect = cachedClrCorrect;
  const clrBorder  = cachedClrBorder;

  const yMid      = H / 2;
  const pxPerCent = H / 100;   // pixels per cent of pitch deviation

  /* ── In-tune band: faint green fill for ±2 ¢ zone ── */
  ctx.fillStyle   = clrCorrect;
  ctx.globalAlpha = 0.15;
  ctx.fillRect(0, yMid - 2 * pxPerCent, W, 4 * pxPerCent);
  ctx.globalAlpha = 1;

  /* ── Centre reference line (dashed) at 0 ¢ ── */
  ctx.strokeStyle = clrBorder;
  ctx.lineWidth   = 0.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(0, yMid);
  ctx.lineTo(W, yMid);
  ctx.stroke();
  ctx.setLineDash([]);

  /* ── Pitch trace segments ──
     Draw each adjacent pair (i, i+1) as a line segment.
     The fade region spans the first FADE samples (oldest 20%).            */
  const bw   = W / TRACE_SIZE;        // pixel width of each buffer slot
  const FADE = Math.floor(TRACE_SIZE * 0.2);

  ctx.lineWidth = 1.5;
  ctx.lineCap   = 'round';

  for (let i = 0; i < TRACE_SIZE - 1; i++) {
    const v0 = traceBuffer[(traceHead + i)     % TRACE_SIZE];
    const v1 = traceBuffer[(traceHead + i + 1) % TRACE_SIZE];

    /* Skip gaps where no pitch was detected */
    if (v0 === null || v1 === null) continue;

    const x0 = (i + 0.5) * bw;
    const x1 = (i + 1.5) * bw;
    /* Map cents to y: 0 ¢ = centre, positive = upward, negative = downward */
    const y0 = yMid - (v0 / 50) * (H / 2);
    const y1 = yMid - (v1 / 50) * (H / 2);

    /* Fade alpha for the oldest 20% of the trace */
    const a = i < FADE ? (i / FADE) : 1;
    ctx.globalAlpha = a * 0.88;

    /* Colour: green when near target, accent when off */
    ctx.strokeStyle = Math.abs((v0 + v1) / 2) <= 5 ? clrCorrect : clrAccent;

    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;

  traceAnimFrame = micActive ? requestAnimationFrame(drawPitchTrace) : null;
}

/**
 * Start the trace drawing loop if it is not already running.
 * Called when the microphone becomes active.
 */
function startTraceLoop() {
  if (!traceAnimFrame) {
    traceAnimFrame = requestAnimationFrame(drawPitchTrace);
  }
}

/* Pause the trace loop when the tab is hidden to save CPU.
   Resume when the tab becomes visible again (if mic is still active). */
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (traceAnimFrame) { cancelAnimationFrame(traceAnimFrame); traceAnimFrame = null; }
  } else if (micActive) {
    startTraceLoop();
  }
});


/* ═══════════════════════════════════════════ */
/*  REFERENCE TONE                             */
/* ═══════════════════════════════════════════ */

/**
 * Play the target note as a 2-second sine-wave reference tone through the
 * device's audio output. Uses a dedicated short-lived AudioContext so it
 * does not interfere with the microphone capture context.
 *
 * The gain envelope:
 *   0 ms  — 0 (silence)
 *   20 ms — 0.3 (fast attack to avoid click)
 *   1800 ms — 0.3 (sustain)
 *   2000 ms — 0 (fast fade to avoid click)
 */
function playRefTone() {
  if (!targetFreq) return;

  const btn = document.getElementById('playRefBtn');
  btn.disabled = true;
  btn.classList.add('playing');

  let refCtx = null;
  try {
    refCtx = new (window.AudioContext || window.webkitAudioContext)();

    const osc = refCtx.createOscillator();
    const g   = refCtx.createGain();

    osc.type            = 'sine';
    osc.frequency.value = targetFreq;

    const t = refCtx.currentTime;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.3, t + 0.02);    // attack
    g.gain.setValueAtTime(0.3, t + 1.8);              // sustain
    g.gain.linearRampToValueAtTime(0, t + 2.0);       // release

    osc.connect(g);
    g.connect(refCtx.destination);

    osc.start(t);
    osc.stop(t + 2.05);   // tiny pad after envelope end to avoid truncation

    osc.onended = () => {
      refCtx.close();
      btn.disabled = false;
      btn.classList.remove('playing');
    };
  } catch (e) {
    if (refCtx) { try { refCtx.close(); } catch (_) { /* ignore */ } }
    btn.disabled = false;
    btn.classList.remove('playing');
    if (window && window.console && console.error) {
      console.error('Failed to play reference tone:', e);
    }
  }
}


/* ═══════════════════════════════════════════ */
/*  INITIALISATION                             */
/* ═══════════════════════════════════════════ */

/**
 * Build all select elements and string buttons in their initial state.
 * Called once on page load and again after restoreSettings adjusts the
 * current instrument.
 */
function buildAll() {
  buildInstrumentSelect();

  const isManual = currentInstrument === 'Manual';
  document.getElementById('tuningPresetGroup').style.display  = isManual ? 'none' : '';
  document.getElementById('manualNoteGroup').style.display    = isManual ? '' : 'none';
  document.getElementById('manualOctaveGroup').style.display  = isManual ? '' : 'none';

  if (!isManual) buildTuningPresetSelect();
  buildManualSelects();
  buildStringButtons();
  updateTarget();
}

/**
 * Load persisted preferences from localStorage and restore the UI state.
 * Applied on page load before any user interaction.
 */
function restoreSettings() {
  const p = loadPrefs();

  /* Theme mode — apply silently (no save) to avoid a redundant write */
  applyMode(loadTheme().mode || 'dark', true);

  /* A4 calibration */
  if (p.a4) setA4(p.a4);

  /* Autodetect toggle */
  if (p.autodetect != null) {
    document.getElementById('autodetectToggle').checked = p.autodetect;
  }

  /* Instrument & preset — set state variables before calling buildAll */
  if (p.instrument) {
    currentInstrument = p.instrument;
    document.getElementById('instrumentSelect').value = p.instrument;
  }
  if (p.preset)     currentPreset    = p.preset;
  if (p.stringIdx != null) currentStringIdx = p.stringIdx;

  buildAll();

  /* Second pass: re-apply instrument + preset values to selects that
     were just rebuilt by buildAll (buildAll resets their selectedIndex) */
  if (p.instrument) {
    const sel = document.getElementById('instrumentSelect');
    if (sel) sel.value = p.instrument;
    onInstrumentChange();

    if (p.preset) {
      const ps = document.getElementById('tuningPresetSelect');
      if (ps) { ps.value = p.preset; onTuningPresetChange(); }
    }

    if (p.stringIdx != null) {
      currentStringIdx = p.stringIdx;
      buildStringButtons();
      updateTarget();
    }
  }
}

/* ── Bootstrap ── */
buildInstrumentSelect();
buildManualSelects();

/* Persist autodetect state changes */
document.getElementById('autodetectToggle').addEventListener('change', e => {
  savePref('autodetect', e.target.checked);
  document.getElementById('autodetectNote').textContent = '';
});

restoreSettings();
