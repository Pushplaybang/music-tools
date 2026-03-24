// ══════════════════════════════════════════════════════════════════
// TUNING DATA
// String definitions for each instrument (high → low string order).
// Each entry: { note, oct, label } where label is the display name.
// ══════════════════════════════════════════════════════════════════

const GUITAR_TUNINGS = {
  'Standard (EADGBE)':   [{ note: 'E',  oct: 4, label: 'e'  }, { note: 'B',  oct: 3, label: 'B'  }, { note: 'G',  oct: 3, label: 'G'  }, { note: 'D',  oct: 3, label: 'D'  }, { note: 'A',  oct: 2, label: 'A'  }, { note: 'E',  oct: 2, label: 'E'  }],
  'Drop D (DADGBE)':     [{ note: 'E',  oct: 4, label: 'e'  }, { note: 'B',  oct: 3, label: 'B'  }, { note: 'G',  oct: 3, label: 'G'  }, { note: 'D',  oct: 3, label: 'D'  }, { note: 'A',  oct: 2, label: 'A'  }, { note: 'D',  oct: 2, label: 'D'  }],
  'Open G (DGDGBD)':     [{ note: 'D',  oct: 4, label: 'D'  }, { note: 'B',  oct: 3, label: 'B'  }, { note: 'G',  oct: 3, label: 'G'  }, { note: 'D',  oct: 3, label: 'D'  }, { note: 'G',  oct: 2, label: 'G'  }, { note: 'D',  oct: 2, label: 'D'  }],
  'Open D (DADF#AD)':    [{ note: 'D',  oct: 4, label: 'D'  }, { note: 'A',  oct: 3, label: 'A'  }, { note: 'F#', oct: 3, label: 'F#' }, { note: 'D',  oct: 3, label: 'D'  }, { note: 'A',  oct: 2, label: 'A'  }, { note: 'D',  oct: 2, label: 'D'  }],
  'Open E (EBEG#BE)':    [{ note: 'E',  oct: 4, label: 'E'  }, { note: 'B',  oct: 3, label: 'B'  }, { note: 'G#', oct: 3, label: 'G#' }, { note: 'E',  oct: 3, label: 'E'  }, { note: 'B',  oct: 2, label: 'B'  }, { note: 'E',  oct: 2, label: 'E'  }],
  'Open A (EAEAC#E)':    [{ note: 'E',  oct: 4, label: 'E'  }, { note: 'C#', oct: 4, label: 'C#' }, { note: 'A',  oct: 3, label: 'A'  }, { note: 'E',  oct: 3, label: 'E'  }, { note: 'A',  oct: 2, label: 'A'  }, { note: 'E',  oct: 2, label: 'E'  }],
  'DADGAD':              [{ note: 'D',  oct: 4, label: 'D'  }, { note: 'A',  oct: 3, label: 'A'  }, { note: 'G',  oct: 3, label: 'G'  }, { note: 'D',  oct: 3, label: 'D'  }, { note: 'A',  oct: 2, label: 'A'  }, { note: 'D',  oct: 2, label: 'D'  }],
  'Half Step Down (Eb)': [{ note: 'D#', oct: 4, label: 'Eb' }, { note: 'A#', oct: 3, label: 'Bb' }, { note: 'F#', oct: 3, label: 'Gb' }, { note: 'C#', oct: 3, label: 'Db' }, { note: 'G#', oct: 2, label: 'Ab' }, { note: 'D#', oct: 2, label: 'Eb' }],
};

const BASS_TUNINGS = {
  'Standard (EADG)':     [{ note: 'G',  oct: 2, label: 'G'  }, { note: 'D',  oct: 2, label: 'D'  }, { note: 'A',  oct: 1, label: 'A'  }, { note: 'E',  oct: 1, label: 'E'  }],
  'Drop D (DADG)':       [{ note: 'G',  oct: 2, label: 'G'  }, { note: 'D',  oct: 2, label: 'D'  }, { note: 'A',  oct: 1, label: 'A'  }, { note: 'D',  oct: 1, label: 'D'  }],
  'Half Step Down (Eb)': [{ note: 'F#', oct: 2, label: 'Gb' }, { note: 'C#', oct: 2, label: 'Db' }, { note: 'G#', oct: 1, label: 'Ab' }, { note: 'D#', oct: 1, label: 'Eb' }],
  '5-String (BEADG)':    [{ note: 'G',  oct: 2, label: 'G'  }, { note: 'D',  oct: 2, label: 'D'  }, { note: 'A',  oct: 1, label: 'A'  }, { note: 'E',  oct: 1, label: 'E'  }, { note: 'B',  oct: 0, label: 'B'  }],
};

const UKE_TUNINGS = {
  'Soprano GCEA (re-entrant)': [{ note: 'G',  oct: 4, label: 'G'  }, { note: 'C',  oct: 4, label: 'C'  }, { note: 'E',  oct: 4, label: 'E'  }, { note: 'A',  oct: 4, label: 'A'  }],
  'Low G GCEA (linear)':       [{ note: 'G',  oct: 3, label: 'G'  }, { note: 'C',  oct: 4, label: 'C'  }, { note: 'E',  oct: 4, label: 'E'  }, { note: 'A',  oct: 4, label: 'A'  }],
  'Baritone DGBE':             [{ note: 'E',  oct: 4, label: 'E'  }, { note: 'B',  oct: 3, label: 'B'  }, { note: 'G',  oct: 3, label: 'G'  }, { note: 'D',  oct: 3, label: 'D'  }],
  'D Tuning ADF#B':            [{ note: 'B',  oct: 4, label: 'B'  }, { note: 'F#', oct: 4, label: 'F#' }, { note: 'D',  oct: 4, label: 'D'  }, { note: 'A',  oct: 3, label: 'A'  }],
  'Open C GCEG':               [{ note: 'G',  oct: 4, label: 'G'  }, { note: 'E',  oct: 4, label: 'E'  }, { note: 'C',  oct: 4, label: 'C'  }, { note: 'G',  oct: 3, label: 'G'  }],
};

// Active tuning for each instrument — updated when the user changes the tuning dropdown
let currentGuitarStrings = GUITAR_TUNINGS['Standard (EADGBE)'];
let currentBassStrings   = BASS_TUNINGS['Standard (EADG)'];
let currentUkeStrings    = UKE_TUNINGS['Soprano GCEA (re-entrant)'];

// ══════════════════════════════════════════════════════════════════
// PERSISTENCE
// All preferences are stored as a single JSON object under one key.
// Versioned key prevents stale data from an older schema causing bugs.
// ══════════════════════════════════════════════════════════════════

const LS = 'earTrainer_v6';

function savePref(k, v) {
  try {
    const d = JSON.parse(localStorage.getItem(LS) || '{}');
    d[k] = v;
    localStorage.setItem(LS, JSON.stringify(d));
  } catch (e) {}
}

function loadPrefs() {
  try {
    return JSON.parse(localStorage.getItem(LS) || '{}');
  } catch (e) {
    return {};
  }
}

// ══════════════════════════════════════════════════════════════════
// MODE — Light / Dark
// ══════════════════════════════════════════════════════════════════

function applyMode(m, noSave) {
  document.body.dataset.mode = m;
  const badge = document.getElementById('modeBadge');
  if (badge) badge.textContent = m === 'dark' ? 'DARK' : 'LIGHT';
  if (!noSave) saveTheme('mode', m);
  // Re-apply accent colours for the new mode (values differ between light and dark)
  applyAccent(document.body.dataset.accent || loadTheme().accent || 'orange', true);
  // Refresh knob SVG colours to match the new mode + accent
  Object.keys(soundKnobRefs).forEach(function(k) {
    if (soundKnobRefs[k]) soundKnobRefs[k].refresh();
  });
}

document.getElementById('modeToggle').addEventListener('click', () => {
  applyMode(document.body.dataset.mode === 'dark' ? 'light' : 'dark');
});

// ══════════════════════════════════════════════════════════════════
// MODALS
// Generic open/close helpers. Clicking the backdrop closes all
// modals except scoreOverlay, which requires an explicit action.
// ══════════════════════════════════════════════════════════════════

function openModal(id) {
  document.getElementById(id).classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  document.getElementById(id).classList.remove('show');
  document.body.style.overflow = '';
}

document.querySelectorAll('.modal-overlay').forEach(ov => {
  ov.addEventListener('click', e => {
    if (e.target === ov && ov.id !== 'scoreOverlay') closeModal(ov.id);
  });
});

// ══════════════════════════════════════════════════════════════════
// VISUALISER TABS — Piano / Guitar / Bass / Ukulele
// ══════════════════════════════════════════════════════════════════

let currentVis = 'piano';

document.querySelectorAll('.vis-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    currentVis = tab.dataset.vis;
    document.querySelectorAll('.vis-tab').forEach(t => t.classList.toggle('active', t === tab));
    document.querySelectorAll('.vis-panel').forEach(p => p.classList.toggle('active', p.id === 'vis-' + currentVis));
    updateTuningVisibility();
    render();
    savePref('vis', currentVis);
  });
});

// ══════════════════════════════════════════════════════════════════
// TUNING SELECTOR
// Populates the dropdown for the active instrument and applies the
// last saved tuning preference for that instrument.
// ══════════════════════════════════════════════════════════════════

/** Returns the tuning map object for the currently visible instrument. */
function getTuningMap() {
  return currentVis === 'guitar' ? GUITAR_TUNINGS
       : currentVis === 'bass'   ? BASS_TUNINGS
       :                           UKE_TUNINGS;
}

/** Rebuilds the tuning <select> options for the current instrument. */
function buildTuningSelect() {
  const sel = document.getElementById('tuningSelect');
  sel.innerHTML = '';
  const map = getTuningMap();
  Object.keys(map).forEach(k => {
    const o = document.createElement('option');
    o.value = k;
    o.textContent = k;
    sel.appendChild(o);
  });
  // Restore the previously saved tuning for this instrument
  const p = loadPrefs();
  const savedKey = currentVis === 'guitar' ? p.guitarTuning
                 : currentVis === 'bass'   ? p.bassTuning
                 :                           p.ukeTuning;
  if (savedKey && map[savedKey]) sel.value = savedKey;
  applySavedTuning();
}

/** Applies the selected tuning to the active instrument's string array. */
function applySavedTuning() {
  const name = document.getElementById('tuningSelect').value;
  if (currentVis === 'guitar') {
    currentGuitarStrings = GUITAR_TUNINGS[name] || GUITAR_TUNINGS['Standard (EADGBE)'];
    savePref('guitarTuning', name);
  } else if (currentVis === 'bass') {
    currentBassStrings = BASS_TUNINGS[name] || BASS_TUNINGS['Standard (EADG)'];
    savePref('bassTuning', name);
  } else {
    currentUkeStrings = UKE_TUNINGS[name] || UKE_TUNINGS['Soprano GCEA (re-entrant)'];
    savePref('ukeTuning', name);
  }
  render();
}

document.getElementById('tuningSelect').addEventListener('change', applySavedTuning);

/** Shows/hides the tuning control and updates its label for the active instrument. */
function updateTuningVisibility() {
  const show = currentVis === 'guitar' || currentVis === 'bass' || currentVis === 'ukulele';
  const grp  = document.getElementById('tuningGroup');
  const sel  = document.getElementById('tuningSelect');
  if (show) {
    grp.classList.remove('disabled');
    sel.disabled = false;
  } else {
    grp.classList.add('disabled');
    sel.disabled = true;
  }
  document.getElementById('tuningLabel').textContent = show
    ? (currentVis === 'guitar' ? 'Guitar Tuning' : currentVis === 'bass' ? 'Bass Tuning' : 'Ukulele Tuning')
    : 'Tuning';
  if (show) buildTuningSelect();
}

// ══════════════════════════════════════════════════════════════════
// AUDIO ENGINE
// All synthesis uses the Web Audio API. The AudioContext is created
// lazily and resumed on the first user gesture (browser policy).
// ══════════════════════════════════════════════════════════════════

let audioCtx      = null;
let currentTimbre = 'piano';

// Sound-shaping parameters (0–100 scale, mapped to real values by helpers below)
let toneVolume    = 80;
let toneBrightness = 50;
let toneAttack    = 10;
let toneRelease   = 50;
let toneNoise     = 0;
let toneReverb    = 15;
let toneLayer     = 'none';
let toneFilterEnv = 50;
let toneNoiseTone = 50;

let reverbNode  = null;  // Cached convolver IR — invalidated when toneReverb changes
var soundKnobRefs = {};  // Live references to each SVG knob (for refresh/setValue)

// ── Parameter mapping helpers ──

function getVolume()          { return toneVolume / 100; }
function getBrightness()      { return 200 + (toneBrightness / 100) * 7800; }
function getAttackTime()      { return 0.005 + (toneAttack / 100) * 0.295; }
function getReleaseTime()     { return 0.2 + (toneRelease / 100) * 2.8; }
function getFilterEnvAmount() { return (toneFilterEnv - 50) / 50; } // -1 to +1
function getNoiseToneQ()      { return 0.3 + (toneNoiseTone / 100) * 11.7; }

/** Updates a single sound-shaping parameter and persists it to localStorage. */
function updateSoundParam(key, val, elId) {
  if (key === 'toneLayer') {
    toneLayer = val;
    savePref(key, val);
    return;
  }
  val = +val;
  if      (key === 'toneVolume')    toneVolume    = val;
  else if (key === 'toneBrightness')toneBrightness = val;
  else if (key === 'toneAttack')    toneAttack    = val;
  else if (key === 'toneRelease')   toneRelease   = val;
  else if (key === 'toneNoise')     toneNoise     = val;
  else if (key === 'toneReverb')  { toneReverb    = val; reverbNode = null; } // invalidate cached IR
  else if (key === 'toneFilterEnv') toneFilterEnv = val;
  else if (key === 'toneNoiseTone') toneNoiseTone = val;
  savePref(key, val);
}

// ── SVG Knob builder ──
// Draggable rotary knob with arc track, value readout, and label.
// Adapted from the Stasis v3 design system.
function buildKnob(container, label, initPct, onChange) {
  var SIZE = 60, RT = 20, RI = 15, START = 220, RANGE = 280;
  var val = initPct / 100, drag = false, sY = 0, sV = 0;
  var NS = 'http://www.w3.org/2000/svg';

  // DOM structure: wrap > svg + label + value readout
  var wrap  = document.createElement('div');  wrap.className  = 'knob-wrap';
  var lbl   = document.createElement('div');  lbl.className   = 'knob-label';  lbl.textContent = label;
  var valEl = document.createElement('div');  valEl.className = 'knob-value';  valEl.textContent = Math.round(val * 100);

  var svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('width', SIZE);
  svg.setAttribute('height', SIZE);
  svg.setAttribute('viewBox', '0 0 ' + SIZE + ' ' + SIZE);
  svg.classList.add('knob-svg');
  svg.style.overflow = 'visible';

  // Radial gradient for the knob body shine effect
  var defs = document.createElementNS(NS, 'defs');
  var grd  = document.createElementNS(NS, 'radialGradient');
  var gid  = 'ksh_' + Math.random().toString(36).slice(2); // unique id per knob instance
  grd.id = gid;
  grd.setAttribute('cx', '38%'); grd.setAttribute('cy', '30%'); grd.setAttribute('r', '58%');
  var gs1 = document.createElementNS(NS, 'stop'); gs1.setAttribute('offset', '0%');
  var gs2 = document.createElementNS(NS, 'stop'); gs2.setAttribute('offset', '100%'); gs2.setAttribute('stop-color', 'rgba(255,255,255,0)');
  grd.appendChild(gs1); grd.appendChild(gs2); defs.appendChild(grd); svg.appendChild(defs);

  var cx = SIZE / 2, cy = SIZE / 2;
  var trackEl = document.createElementNS(NS, 'path');   // Full arc background
  trackEl.setAttribute('stroke-width', '2.5'); trackEl.setAttribute('fill', 'none'); trackEl.setAttribute('stroke-linecap', 'round');
  var fillEl  = document.createElementNS(NS, 'path');   // Filled arc (value indicator)
  fillEl.setAttribute('stroke-width', '2.5'); fillEl.setAttribute('fill', 'none'); fillEl.setAttribute('stroke-linecap', 'round');
  var bodyEl  = document.createElementNS(NS, 'circle'); // Main knob body circle
  bodyEl.setAttribute('cx', cx); bodyEl.setAttribute('cy', cy); bodyEl.setAttribute('r', RI);
  var shineEl = document.createElementNS(NS, 'circle'); // Gradient shine overlay
  shineEl.setAttribute('cx', cx); shineEl.setAttribute('cy', cy); shineEl.setAttribute('r', RI);
  shineEl.setAttribute('fill', 'url(#' + gid + ')');
  var indEl   = document.createElementNS(NS, 'line');   // Position indicator line
  indEl.setAttribute('stroke-width', '1.5'); indEl.setAttribute('stroke-linecap', 'round');

  [trackEl, fillEl, bodyEl, shineEl, indEl].forEach(function(el) { svg.appendChild(el); });

  /** Returns an SVG arc path from angle a1 to a2 at radius r (degrees, 0 = top). */
  function arc(r, a1, a2) {
    var s  = (a1 - 90) * Math.PI / 180;
    var e  = (a2 - 90) * Math.PI / 180;
    var lg = a2 - a1 > 180 ? 1 : 0;
    return 'M' + (cx + r * Math.cos(s)) + ' ' + (cy + r * Math.sin(s))
         + ' A ' + r + ' ' + r + ' 0 ' + lg + ' 1 '
         + (cx + r * Math.cos(e)) + ' ' + (cy + r * Math.sin(e));
  }

  function isDark() { return document.body.dataset.mode === 'dark'; }
  function getCSS(v) { return getComputedStyle(document.body).getPropertyValue(v).trim(); }

  /** Applies mode-aware colours to all knob SVG elements. */
  function styleMode() {
    var dark = isDark();
    var acc  = getCSS('--accent');
    trackEl.setAttribute('stroke', dark ? 'rgba(100,140,255,0.10)' : 'rgba(55,85,180,0.10)');
    fillEl.setAttribute('stroke', acc);
    fillEl.setAttribute('filter', 'drop-shadow(0 0 3px ' + (dark ? 'rgba(0,216,255,0.48)' : 'rgba(0,128,192,0.32)') + ')');
    bodyEl.setAttribute('fill', getCSS('--surface-hi'));
    bodyEl.setAttribute('filter', dark
      ? 'drop-shadow(3px 4px 14px rgba(0,0,0,0.65)) drop-shadow(-1px -1px 2px rgba(255,255,255,0.035))'
      : 'drop-shadow(3px 4px 12px rgba(40,60,150,0.13)) drop-shadow(-3px -3px 8px rgba(255,255,255,0.92))');
    gs1.setAttribute('stop-color', dark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.40)');
    indEl.setAttribute('stroke', acc);
  }

  /** Redraws the knob arc and indicator needle for the current value. */
  function update() {
    styleMode();
    var ang = START + val * RANGE;
    trackEl.setAttribute('d', arc(RT, START, START + RANGE));
    fillEl.setAttribute('d', val > 0.01 ? arc(RT, START, ang) : 'M0 0');
    var rad = (ang - 90) * Math.PI / 180;
    indEl.setAttribute('x1', cx + (RI - 8) * Math.cos(rad));
    indEl.setAttribute('y1', cy + (RI - 8) * Math.sin(rad));
    indEl.setAttribute('x2', cx + (RI - 3) * Math.cos(rad));
    indEl.setAttribute('y2', cy + (RI - 3) * Math.sin(rad));
    valEl.textContent = Math.round(val * 100);
  }

  // ── Mouse drag interaction ──
  svg.addEventListener('mousedown', function(e) { drag = true; sY = e.clientY; sV = val; e.preventDefault(); });
  window.addEventListener('mousemove', function(e) {
    if (drag) {
      var nv = Math.max(0, Math.min(1, sV - (e.clientY - sY) / 110));
      if (nv !== val) { val = nv; update(); onChange(Math.round(val * 100)); }
    }
  });
  window.addEventListener('mouseup', function() { drag = false; });

  // ── Touch drag interaction ──
  svg.addEventListener('touchstart', function(e) { drag = true; sY = e.touches[0].clientY; sV = val; }, { passive: true });
  window.addEventListener('touchmove', function(e) {
    if (drag) {
      var nv = Math.max(0, Math.min(1, sV - (e.touches[0].clientY - sY) / 110));
      if (nv !== val) { val = nv; update(); onChange(Math.round(val * 100)); }
    }
  }, { passive: true });
  window.addEventListener('touchend', function() { drag = false; });

  wrap.appendChild(svg); wrap.appendChild(lbl); wrap.appendChild(valEl);
  container.appendChild(wrap);
  update();

  return {
    setValue: function(pct) { val = Math.max(0, Math.min(1, pct / 100)); update(); },
    getValue: function()    { return Math.round(val * 100); },
    refresh:  function()    { update(); },
  };
}

/** Builds the full row of sound-shaping knobs and caches references in soundKnobRefs. */
function buildSoundKnobs() {
  var row = document.getElementById('soundKnobRow');
  if (!row) return;
  row.innerHTML = '';
  soundKnobRefs = {};
  var knobs = [
    { key: 'toneVolume',    label: 'VOL',   def: 80 },
    { key: 'toneBrightness',label: 'BRT',   def: 50 },
    { key: 'toneAttack',    label: 'ATK',   def: 10 },
    { key: 'toneRelease',   label: 'REL',   def: 50 },
    { key: 'toneNoise',     label: 'NSE',   def: 0  },
    { key: 'toneReverb',    label: 'RVB',   def: 15 },
    { key: 'toneFilterEnv', label: 'F.ENV', def: 50 },
    { key: 'toneNoiseTone', label: 'N.TNE', def: 50 },
  ];
  knobs.forEach(function(k) {
    soundKnobRefs[k.key] = buildKnob(row, k.label, k.def, function(v) { updateSoundParam(k.key, v); });
  });
}

/**
 * Returns (or builds) the shared convolver node used for reverb.
 * IR is a simple exponential noise decay. Cached and invalidated
 * when toneReverb changes.
 */
function getReverbNode() {
  if (reverbNode) return reverbNode;
  var ctx = getCtx();
  var len = ctx.sampleRate * 1.5;
  var buf = ctx.createBuffer(2, len, ctx.sampleRate);
  for (var ch = 0; ch < 2; ch++) {
    var d = buf.getChannelData(ch);
    for (var i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.4));
    }
  }
  reverbNode = ctx.createConvolver();
  reverbNode.buffer = buf;
  return reverbNode;
}

/** Lazily creates and resumes the AudioContext (required by browser autoplay policy). */
function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

/** Plays a tone at frequency f starting at audio time t0 for dur seconds. */
function playTone(f, t0, dur = 0.75) {
  _playToneImpl(f, t0, dur, getCtx().destination);
}

/**
 * Core tone synthesis engine.
 *
 * Signal chain:
 *   oscillators/noise → master gain (mg) → lowpass (lp) → dry/wet reverb split → dest
 *
 * Timbre options:
 *   'piano' — noise transient + decaying sine (percussive attack)
 *   'soft'  — long sustain sine with sub-octave for warmth
 *   default — triangle oscillator with 2nd-harmonic overtone (synth-like)
 *
 * Additional layers mixed on top:
 *   toneNoise — bandpass-filtered white noise for texture
 *   toneLayer — a second oscillator at octave / fifth / sub / detune
 */
function _playToneImpl(f, t0, dur, dest) {
  const ctx      = getCtx();
  const vol      = getVolume();
  const atk      = getAttackTime();
  const rel      = getReleaseTime();
  const bright   = getBrightness();
  const totalDur = dur + rel;

  // ── Master gain → lowpass filter ──
  const mg = ctx.createGain();
  mg.gain.value = vol;
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';

  // Optional filter envelope: sweeps cutoff from low→high or high→low over the note
  const fEnv = getFilterEnvAmount(); // -1 to +1
  if (Math.abs(fEnv) > 0.02) {
    const lo     = 200, hi = bright;
    const startF = fEnv < 0 ? hi   : Math.max(lo, hi * (1 - Math.abs(fEnv)));
    const endF   = fEnv < 0 ? Math.max(lo, hi * (1 - Math.abs(fEnv))) : hi;
    lp.frequency.setValueAtTime(startF, t0);
    lp.frequency.exponentialRampToValueAtTime(Math.max(20, endF), t0 + totalDur * 0.8);
  } else {
    lp.frequency.value = bright;
  }
  mg.connect(lp);

  // ── Reverb send (wet/dry split) ──
  const rvbAmt = toneReverb / 100;
  if (rvbAmt > 0) {
    const dry = ctx.createGain();
    const wet = ctx.createGain();
    dry.gain.value = 1 - rvbAmt * 0.5;
    wet.gain.value = rvbAmt;
    lp.connect(dry); dry.connect(dest);
    // ConvolverNode cannot be shared across simultaneous calls — create a fresh one each time
    const cv = ctx.createConvolver();
    cv.buffer = getReverbNode().buffer;
    lp.connect(cv); cv.connect(wet); wet.connect(dest);
  } else {
    lp.connect(dest);
  }

  // ── Core timbre ──
  if (currentTimbre === 'piano') {
    // Short noise burst through a bandpass filter creates a percussive attack transient
    const bufLen = Math.ceil(ctx.sampleRate * 0.01);
    const buf    = ctx.createBuffer(1, bufLen, ctx.sampleRate);
    const d      = buf.getChannelData(0);
    for (let i = 0; i < bufLen; i++) d[i] = (Math.random() * 2 - 1);
    const ns = ctx.createBufferSource(); ns.buffer = buf;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = 2;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0, t0);
    ng.gain.linearRampToValueAtTime(0.5, t0 + atk);
    ng.gain.exponentialRampToValueAtTime(0.15, t0 + 0.1);
    ng.gain.exponentialRampToValueAtTime(0.001, t0 + Math.min(totalDur, 0.5));
    ns.connect(bp); bp.connect(ng); ng.connect(mg); ns.start(t0);

    // Sustain: sine wave with fast attack and long exponential decay
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.type = 'sine'; osc.frequency.setValueAtTime(f, t0);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(0.28, t0 + atk);
    g.gain.exponentialRampToValueAtTime(0.09, t0 + atk + 0.05);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + totalDur);
    osc.connect(g); g.connect(mg); osc.start(t0); osc.stop(t0 + totalDur + 0.05);

  } else if (currentTimbre === 'soft') {
    // Long sustain sine with a quiet sub-octave for warmth
    const sustain = Math.max(totalDur, 1.5);
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.type = 'sine'; osc.frequency.setValueAtTime(f, t0);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(0.32, t0 + atk);
    g.gain.setValueAtTime(0.32, t0 + sustain * 0.7);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + sustain);
    osc.connect(g); g.connect(mg); osc.start(t0); osc.stop(t0 + sustain + 0.05);

    const sub = ctx.createOscillator();
    const sg  = ctx.createGain();
    sub.type = 'sine'; sub.frequency.setValueAtTime(f / 2, t0);
    sg.gain.setValueAtTime(0, t0);
    sg.gain.linearRampToValueAtTime(0.08, t0 + atk);
    sg.gain.setValueAtTime(0.08, t0 + sustain * 0.7);
    sg.gain.exponentialRampToValueAtTime(0.001, t0 + sustain);
    sub.connect(sg); sg.connect(mg); sub.start(t0); sub.stop(t0 + sustain + 0.05);

  } else {
    // Synth: triangle wave through a lowpass, with a 2nd-harmonic overtone
    const osc  = ctx.createOscillator();
    const g    = ctx.createGain();
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass'; filt.frequency.value = 2800;
    osc.type = 'triangle'; osc.frequency.setValueAtTime(f, t0);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(0.38, t0 + atk);
    g.gain.exponentialRampToValueAtTime(0.18, t0 + totalDur * 0.4);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + totalDur);

    const o2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    o2.type = 'sine'; o2.frequency.setValueAtTime(f * 2, t0);
    g2.gain.setValueAtTime(0, t0);
    g2.gain.linearRampToValueAtTime(0.1, t0 + atk);
    g2.gain.exponentialRampToValueAtTime(0.001, t0 + totalDur * 0.6);
    o2.connect(g2); g2.connect(mg); o2.start(t0); o2.stop(t0 + totalDur);

    osc.connect(filt); filt.connect(g); g.connect(mg); osc.start(t0); osc.stop(t0 + totalDur);
  }

  // ── Noise layer (optional) ──
  // Bandpass-filtered white noise adds texture (breath, bow, room noise, etc.)
  if (toneNoise > 0) {
    const nAmt    = toneNoise / 100 * 0.15;
    const nBufLen = Math.ceil(ctx.sampleRate * totalDur);
    const nBuf    = ctx.createBuffer(1, nBufLen, ctx.sampleRate);
    const nd      = nBuf.getChannelData(0);
    for (let i = 0; i < nBufLen; i++) nd[i] = (Math.random() * 2 - 1);
    const nSrc  = ctx.createBufferSource(); nSrc.buffer = nBuf;
    const nFilt = ctx.createBiquadFilter(); nFilt.type = 'bandpass'; nFilt.frequency.value = f; nFilt.Q.value = getNoiseToneQ();
    const nGain = ctx.createGain();
    nGain.gain.setValueAtTime(0, t0);
    nGain.gain.linearRampToValueAtTime(nAmt, t0 + atk);
    nGain.gain.exponentialRampToValueAtTime(0.001, t0 + totalDur);
    nSrc.connect(nFilt); nFilt.connect(nGain); nGain.connect(mg);
    nSrc.start(t0); nSrc.stop(t0 + totalDur + 0.05);
  }

  // ── Layer oscillator (optional second voice) ──
  // Adds a harmonically-related oscillator for richness / chorus
  if (toneLayer !== 'none') {
    let lf = f;
    if      (toneLayer === 'octave') lf = f * 2;
    else if (toneLayer === 'fifth')  lf = f * 1.5;
    else if (toneLayer === 'sub')    lf = f / 2;
    // 'detune' keeps same frequency but adds cents offset for a chorus effect
    const lo = ctx.createOscillator();
    const lg = ctx.createGain();
    lo.type = toneLayer === 'sub' ? 'sine' : 'triangle';
    lo.frequency.setValueAtTime(lf, t0);
    if (toneLayer === 'detune') lo.detune.setValueAtTime(12, t0); // ~12 cents
    const layerVol = toneLayer === 'sub' ? 0.12 : 0.1;
    lg.gain.setValueAtTime(0, t0);
    lg.gain.linearRampToValueAtTime(layerVol, t0 + atk);
    lg.gain.exponentialRampToValueAtTime(0.001, t0 + totalDur);
    lo.connect(lg); lg.connect(mg); lo.start(t0); lo.stop(t0 + totalDur + 0.05);
  }
}

/** Plays a tone routed to an explicit AudioNode destination (used by the scale sequencer). */
function playToneToNode(f, t0, dur, dest) { _playToneImpl(f, t0, dur, dest); }

/** Plays all frequencies in a chord simultaneously. */
function playChordFreqs(freqs) {
  const t0 = getCtx().currentTime;
  freqs.forEach(f => playTone(f, t0, 1.6));
}

// ══════════════════════════════════════════════════════════════════
// MUSIC DATA
// Note names, scale patterns, interval names, and chord types.
// ══════════════════════════════════════════════════════════════════

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Enharmonic equivalents for display (e.g. C# → C#/Db)
const ENH = { 'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb' };

/** Returns display name for a note, appending enharmonic equivalent if one exists. */
const nn = n => ENH[n] ? n + '/' + ENH[n] : n;

// Frequency / MIDI conversion utilities
const midiFreq   = m => 440 * Math.pow(2, (m - 69) / 12);
const noteFreq   = (note, oct) => midiFreq((oct + 1) * 12 + NOTES.indexOf(note));
const noteToMidi = (note, oct) => (oct + 1) * 12 + NOTES.indexOf(note);

// Scale patterns — semitone intervals from root (including the octave boundary as last entry)
const SCALES = {
  'Chromatic':        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  'Major':            [0, 2, 4, 5, 7, 9, 11, 12],
  'Natural Minor':    [0, 2, 3, 5, 7, 8, 10, 12],
  'Harmonic Minor':   [0, 2, 3, 5, 7, 8, 11, 12],
  'Melodic Minor':    [0, 2, 3, 5, 7, 9, 11, 12],
  'Dorian':           [0, 2, 3, 5, 7, 9, 10, 12],
  'Phrygian':         [0, 1, 3, 5, 7, 8, 10, 12],
  'Lydian':           [0, 2, 4, 6, 7, 9, 11, 12],
  'Mixolydian':       [0, 2, 4, 5, 7, 9, 10, 12],
  'Locrian':          [0, 1, 3, 5, 6, 8, 10, 12],
  'Pentatonic Major': [0, 2, 4, 7, 9, 12],
  'Pentatonic Minor': [0, 3, 5, 7, 10, 12],
  'Blues':            [0, 3, 5, 6, 7, 10, 12],
  'Whole Tone':       [0, 2, 4, 6, 8, 10, 12],
  'Diminished':       [0, 2, 3, 5, 6, 8, 9, 11, 12],
};

// Grouped for the scale <select> optgroups
const SCALE_GROUPS = [
  { label: 'Major Modes',        scales: ['Major', 'Dorian', 'Phrygian', 'Lydian', 'Mixolydian', 'Locrian'] },
  { label: 'Minor Scales',       scales: ['Natural Minor', 'Harmonic Minor', 'Melodic Minor'] },
  { label: 'Pentatonic & Blues', scales: ['Pentatonic Major', 'Pentatonic Minor', 'Blues'] },
  { label: 'Symmetric & Other',  scales: ['Chromatic', 'Whole Tone', 'Diminished'] },
];

// Prettier names for certain scales shown in the dropdown
const SCALE_DISPLAY = {
  'Major':         'Major (Ionian)',
  'Natural Minor': 'Natural Minor (Aeolian)',
};

// Semitone count → interval name mapping (for the interval quiz)
const INTERVAL_NAMES = {
  1:  'Minor 2nd',   2: 'Major 2nd',  3: 'Minor 3rd',  4: 'Major 3rd',
  5:  'Perfect 4th', 6: 'Tritone',    7: 'Perfect 5th', 8: 'Minor 6th',
  9:  'Major 6th',  10: 'Minor 7th', 11: 'Major 7th',  12: 'Octave',
};

// Chord types tested in the chord quiz
const CHORD_TYPES = [
  { name: 'Major',         semis: [0, 4, 7]       },
  { name: 'Minor',         semis: [0, 3, 7]       },
  { name: 'Diminished',    semis: [0, 3, 6]       },
  { name: 'Augmented',     semis: [0, 4, 8]       },
  { name: 'Sus2',          semis: [0, 2, 7]       },
  { name: 'Sus4',          semis: [0, 5, 7]       },
  { name: 'Major 7th',     semis: [0, 4, 7, 11]   },
  { name: 'Dom 7th',       semis: [0, 4, 7, 10]   },
  { name: 'Minor 7th',     semis: [0, 3, 7, 10]   },
  { name: 'Half Dim 7th',  semis: [0, 3, 6, 10]   },
  { name: 'Dim 7th',       semis: [0, 3, 6, 9]    },
  { name: 'Minor Maj 7th', semis: [0, 3, 7, 11]   },
];

/** Returns the currently selected octave range (number of octaves). */
function getRange() {
  const s = document.getElementById('rangeSelect');
  return s ? parseInt(s.value) || 1 : 1;
}

/**
 * Returns all notes in the configured scale as { note, octave, semis } objects.
 * Expands across multiple octaves when range > 1.
 */
function getScaleNotes() {
  const root  = document.getElementById('rootSelect').value;
  const sn    = document.getElementById('scaleSelect').value;
  const oct   = parseInt(document.getElementById('octaveSelect').value);
  const ri    = NOTES.indexOf(root);
  const range = getRange();
  const pat   = SCALES[sn].slice(0, -1); // strip the duplicate octave boundary

  // Expand the pattern across the requested number of octaves
  const expanded = [];
  for (let r = 0; r < range; r++) pat.forEach(i => expanded.push(i + r * 12));
  expanded.push(range * 12); // add the top octave note

  return expanded.map(i => {
    const ts = ri + i;
    return { note: NOTES[ts % 12], octave: oct + Math.floor(ts / 12), semis: i };
  });
}

/** Returns the set of pitch classes (0–11) present in the current scale. */
function getScalePCs() {
  return new Set(getScaleNotes().map(n => NOTES.indexOf(n.note)));
}

/**
 * Derives all diatonic chords from the current scale.
 * Tests every CHORD_TYPE at every scale degree — only chords whose notes
 * all belong to the scale's pitch-class set are included.
 */
function getScaleChords() {
  const scalePCs = getScalePCs();
  const oct      = parseInt(document.getElementById('octaveSelect').value);
  const results  = [];

  [...scalePCs].forEach(degPC => {
    CHORD_TYPES.forEach(ct => {
      const pcs = ct.semis.map(s => (degPC + s) % 12);
      if (pcs.every(pc => scalePCs.has(pc))) {
        const notes = ct.semis.map(s => {
          const midi = noteToMidi(NOTES[degPC], oct) + s;
          return { note: NOTES[midi % 12], octave: Math.floor(midi / 12) - 1, pc: midi % 12 };
        });
        results.push({ rootPc: degPC, rootNote: NOTES[degPC], type: ct.name, notes, pcs });
      }
    });
  });
  return results;
}

// ══════════════════════════════════════════════════════════════════
// CONFIGURATION SELECTS
// Builds root / scale / octave / range dropdowns and wires up
// change listeners to re-render and persist preferences.
// ══════════════════════════════════════════════════════════════════

function buildSelects() {
  // Root note
  const rs = document.getElementById('rootSelect');
  NOTES.forEach(n => {
    const o = document.createElement('option');
    o.value = n; o.textContent = nn(n);
    rs.appendChild(o);
  });

  // Scale (grouped by category)
  const ss = document.getElementById('scaleSelect');
  SCALE_GROUPS.forEach(g => {
    const og = document.createElement('optgroup');
    og.label = g.label;
    g.scales.forEach(s => {
      const o = document.createElement('option');
      o.value = s; o.textContent = SCALE_DISPLAY[s] || s;
      og.appendChild(o);
    });
    ss.appendChild(og);
  });
  ss.value = 'Major';

  // Octave
  const os = document.getElementById('octaveSelect');
  for (let o = 2; o <= 6; o++) {
    const e = document.createElement('option');
    e.value = o; e.textContent = 'Octave ' + o + (o === 4 ? ' (Middle C)' : '');
    os.appendChild(e);
  }
  os.value = 4;

  // Octave range
  const rangeEl = document.getElementById('rangeSelect');
  ['1 Octave', '2 Octaves', '3 Octaves'].forEach((t, i) => {
    const o = document.createElement('option');
    o.value = i + 1; o.textContent = t;
    rangeEl.appendChild(o);
  });
  rangeEl.value = 1;

  // Change listeners — re-render and save on every config change
  rs.addEventListener('change',      () => { render(); savePref('root',  rs.value);               updateConfigSummary(); });
  ss.addEventListener('change',      () => { render(); savePref('scale', ss.value);               updateConfigSummary(); });
  os.addEventListener('change',      () => { render(); savePref('octave',os.value);               updateConfigSummary(); });
  rangeEl.addEventListener('change', () => { render(); savePref('range', parseInt(rangeEl.value)); updateConfigSummary(); });
}

// ══════════════════════════════════════════════════════════════════
// QUIZ MODE SELECTION
// Switches between Note Names / Intervals / Chords modes.
// Prompts confirmation if a quiz is in progress to avoid data loss.
// ══════════════════════════════════════════════════════════════════

let currentQuizMode   = 'notes';
let intervalDirection = 'any';

document.querySelectorAll('.quiz-mode-btn[data-mode]').forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.dataset.mode === currentQuizMode) return;
    if (qTotal > 0 && !confirm('Switch mode? This will reset your score.')) return;
    currentQuizMode = btn.dataset.mode;
    document.querySelectorAll('.quiz-mode-btn[data-mode]').forEach(b => b.classList.toggle('active', b === btn));
    document.getElementById('intervalDirRow').style.display = currentQuizMode === 'intervals' ? '' : 'none';
    doReset();
    savePref('quizMode', currentQuizMode);
  });
});

/** Sets the interval direction filter (ascending / descending / any). */
function setIntervalDir(dir) {
  intervalDirection = dir;
  document.querySelectorAll('#intervalDirRow .quiz-mode-btn').forEach(b => b.classList.toggle('active', b.dataset.dir === dir));
  savePref('intervalDirection', dir);
}

// ══════════════════════════════════════════════════════════════════
// RESTORE SETTINGS
// Reads all saved preferences from localStorage and applies them
// to UI controls and JS state on page load.
// ══════════════════════════════════════════════════════════════════

function restoreSettings() {
  const p = loadPrefs();

  // Scale / octave config
  if (p.root)   document.getElementById('rootSelect').value   = p.root;
  if (p.scale)  document.getElementById('scaleSelect').value  = p.scale;
  if (p.octave) document.getElementById('octaveSelect').value = p.octave;
  if (p.range)  document.getElementById('rangeSelect').value  = p.range;

  // Toggles
  if (p.rootFirst === false) document.getElementById('rootFirstToggle').checked = false;

  // Scale playback speed
  if (p.scaleFast) {
    scaleFast = true;
    var sb = document.getElementById('btnSpeed');
    if (sb) sb.textContent = '2×';
  }

  // Timbre
  if (p.timbre) {
    currentTimbre = p.timbre;
    document.getElementById('timbreSelect').value = p.timbre;
  }

  // Per-question timer
  {
    const dur = p.timerDuration !== undefined ? p.timerDuration : 0;
    currentTimerDuration = dur;
    document.querySelectorAll('.timer-dur-btn').forEach(b => b.classList.toggle('active', parseInt(b.dataset.dur) === dur));
    document.getElementById('timerWrap').classList.toggle('active', dur > 0);
    if (dur > 0) updateTimerRing(dur);
  }

  // Visualiser tab
  if (p.vis) {
    currentVis = p.vis;
    document.querySelectorAll('.vis-tab').forEach(t => t.classList.toggle('active', t.dataset.vis === p.vis));
    document.querySelectorAll('.vis-panel').forEach(pn => pn.classList.toggle('active', pn.id === 'vis-' + p.vis));
  }

  // Quiz mode
  if (p.quizMode) {
    currentQuizMode = p.quizMode;
    document.querySelectorAll('.quiz-mode-btn[data-mode]').forEach(b => b.classList.toggle('active', b.dataset.mode === p.quizMode));
    document.getElementById('intervalDirRow').style.display = currentQuizMode === 'intervals' ? '' : 'none';
  }

  // Interval direction
  if (p.intervalDirection) {
    intervalDirection = p.intervalDirection;
    document.querySelectorAll('#intervalDirRow .quiz-mode-btn').forEach(b => b.classList.toggle('active', b.dataset.dir === intervalDirection));
  }

  // Tone-shaping knobs — restore values, build SVG knobs, then set their visual positions
  var knobDefaults = { toneVolume: 80, toneBrightness: 50, toneAttack: 10, toneRelease: 50, toneNoise: 0, toneReverb: 15, toneFilterEnv: 50, toneNoiseTone: 50 };
  Object.keys(knobDefaults).forEach(function(k) {
    var v = p[k] !== undefined ? p[k] : knobDefaults[k];
    updateSoundParam(k, v);
  });
  buildSoundKnobs();
  Object.keys(knobDefaults).forEach(function(k) {
    var v = p[k] !== undefined ? p[k] : knobDefaults[k];
    if (soundKnobRefs[k]) soundKnobRefs[k].setValue(v);
  });

  // Layer oscillator dropdown
  if (p.toneLayer) {
    toneLayer = p.toneLayer;
    document.getElementById('layerSelect').value = p.toneLayer;
  }

  updateTuningVisibility();
  applyMode(loadTheme().mode || 'dark', true);
  updateConfigSummary();
}

// ══════════════════════════════════════════════════════════════════
// RANDOMISE
// One-click randomisation of scale config and sound parameters.
// ══════════════════════════════════════════════════════════════════

/** Picks a random root, scale, and nudges the octave ±1. */
function randomiseConfig() {
  const rs = document.getElementById('rootSelect');
  const ss = document.getElementById('scaleSelect');
  const os = document.getElementById('octaveSelect');
  rs.value = NOTES[Math.floor(Math.random() * 12)];
  ss.value = Object.keys(SCALES)[Math.floor(Math.random() * Object.keys(SCALES).length)];
  // Nudge octave ±1 (clamped to valid range 2–6)
  os.value = Math.max(2, Math.min(6, parseInt(os.value) + (Math.floor(Math.random() * 3) - 1)));
  savePref('root', rs.value); savePref('scale', ss.value); savePref('octave', os.value);
  render();
  updateConfigSummary();
}

/** Randomises all tone-shaping knobs and the timbre/layer dropdowns. */
function randomiseSound() {
  var ranges = {
    toneVolume:    [40, 100], toneBrightness: [10, 90], toneAttack:    [0,  60],
    toneRelease:   [15, 85],  toneNoise:      [0,  60], toneReverb:    [0,  70],
    toneFilterEnv: [15, 85],  toneNoiseTone:  [10, 90],
  };
  Object.keys(ranges).forEach(function(k) {
    var r = ranges[k];
    var v = r[0] + Math.floor(Math.random() * (r[1] - r[0] + 1));
    updateSoundParam(k, v);
    if (soundKnobRefs[k]) soundKnobRefs[k].setValue(v);
  });
  var timbres   = ['piano', 'synth', 'soft'];
  var layers    = ['none', 'octave', 'fifth', 'detune', 'sub'];
  var ts        = document.getElementById('timbreSelect');
  var ls        = document.getElementById('layerSelect');
  var newTimbre = timbres[Math.floor(Math.random() * timbres.length)];
  var newLayer  = layers[Math.floor(Math.random() * layers.length)];
  ts.value = newTimbre; currentTimbre = newTimbre; savePref('timbre', newTimbre);
  ls.value = newLayer;  toneLayer     = newLayer;  savePref('toneLayer', newLayer);
}

/** Toggles the collapsible config panel open/closed. */
function toggleConfigPanel() {
  var p = document.getElementById('configPanel');
  var c = document.getElementById('configChevron');
  if (p) p.classList.toggle('open');
  if (c) c.classList.toggle('open');
}

/** Updates the one-line summary shown in the collapsed config header. */
function updateConfigSummary() {
  var r   = document.getElementById('rootSelect');
  var s   = document.getElementById('scaleSelect');
  var o   = document.getElementById('octaveSelect');
  var rng = document.getElementById('rangeSelect');
  var el  = document.getElementById('configSummaryText');
  if (!el || !r || !s || !o || !rng) return;
  el.textContent = r.value + ' ' + s.value + ' · Oct ' + o.value + ' · ' + rng.options[rng.selectedIndex].textContent;
}

// ══════════════════════════════════════════════════════════════════
// QUIZ STATE
// Mutable state for the active quiz question. Reset between rounds.
// ══════════════════════════════════════════════════════════════════

let quizActive = false;

// Score counters
let qCorrect = 0, qTotal = 0, qWrong = 0, qTimeouts = 0, qVisWrong = 0;

// Current question state
let qAns = null, qAnsOct = null, qFreq = null, qRefFreq = null, qAnswered = false;

// History used to avoid immediate repeats and weight missed notes higher
let qRecentNotes = [], qLastIntervalAns = null, qLastChordRoot = null, qMissWeights = {};

// Interval quiz extra state
let qIntervalSemis = null, qRefNote = null, qRefOct = null;

// Chord quiz extra state
let qChordObj = null;

/**
 * Weighted-random note picker.
 * Excludes the most recently answered notes (up to maxExclude) to prevent
 * immediate repeats. Notes that have been missed more often receive a higher
 * sampling weight so they surface more frequently.
 */
function pickNote(pool) {
  const uniqueKeys    = [...new Set(pool.map(n => n.note + n.octave))];
  const maxExclude    = uniqueKeys.length <= 3 ? 1 : 2;
  const recentExclude = new Set(qRecentNotes.slice(-maxExclude));
  const eligible      = uniqueKeys.length > maxExclude
    ? pool.filter(n => !recentExclude.has(n.note + n.octave))
    : pool;
  const weights = eligible.map(n => 1 + (qMissWeights[n.note + n.octave] || 0));
  const total   = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < eligible.length; i++) {
    r -= weights[i];
    if (r <= 0) return eligible[i];
  }
  return eligible[eligible.length - 1];
}

// ══════════════════════════════════════════════════════════════════
// PER-QUESTION TIMER
// Optional countdown shown as an SVG ring. When it reaches zero,
// handleTimeout() marks the question wrong and advances.
// ══════════════════════════════════════════════════════════════════

const TIMER_CIRC = 100.53; // SVG ring circumference (2πr, r ≈ 16)

let currentTimerDuration = 0;
let timerHandle          = null;
let timerSecs            = 0;

document.querySelectorAll('.timer-dur-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const dur = parseInt(btn.dataset.dur);
    currentTimerDuration = dur;
    document.querySelectorAll('.timer-dur-btn').forEach(b => b.classList.toggle('active', b === btn));
    document.getElementById('timerWrap').classList.toggle('active', dur > 0);
    if (!dur) stopTimer(); else updateTimerRing(dur);
    savePref('timerDuration', dur);
  });
});

document.getElementById('rootFirstToggle').addEventListener('change', e => savePref('rootFirst', e.target.checked));

function startTimer() {
  stopTimer();
  if (!currentTimerDuration) return;
  timerSecs = currentTimerDuration;
  updateTimerRing(timerSecs);
  timerHandle = setInterval(() => {
    timerSecs--;
    updateTimerRing(timerSecs);
    if (timerSecs <= 0) { stopTimer(); handleTimeout(); }
  }, 1000);
}

function stopTimer() {
  clearInterval(timerHandle);
  timerHandle = null;
}

/** Updates the SVG ring fill and countdown number. Adds 'urgent' class for the last 3 seconds. */
function updateTimerRing(s) {
  const arc = document.getElementById('timerArc');
  const num = document.getElementById('timerNum');
  if (!arc) return;
  const total = currentTimerDuration || 1;
  arc.style.strokeDashoffset = TIMER_CIRC * (1 - Math.max(0, s / total));
  num.textContent = s;
  const urgent = s <= 3 && s > 0;
  arc.classList.toggle('urgent', urgent);
  num.classList.toggle('urgent', urgent);
}

/** Called when the countdown reaches zero. Marks timed-out and advances to next question. */
function handleTimeout() {
  if (qAnswered) return;
  qAnswered = true;
  qTimeouts++;
  document.querySelectorAll('.quiz-opt').forEach(b => b.disabled = true);
  const fb = document.getElementById('quizFeedback');
  let label = '?';
  if      (currentQuizMode === 'notes')     label = nn(qAns);
  else if (currentQuizMode === 'intervals') label = INTERVAL_NAMES[qIntervalSemis] || '?';
  else if (qChordObj)                       label = nn(qChordObj.rootNote) + ' ' + qChordObj.type;
  fb.textContent = '⏱ Time\'s up! It was ' + label;
  fb.className   = 'quiz-feedback wrong';
  if (currentQuizMode === 'chords' && qChordObj) {
    playChordFreqs(qChordObj.notes.map(n => noteFreq(n.note, n.octave)));
    highlightChord(qChordObj.notes, 'wrong');
  } else {
    if (qFreq) playTone(qFreq, getCtx().currentTime, 1.2);
    qMissWeights[qAns + qAnsOct] = (qMissWeights[qAns + qAnsOct] || 0) + 1.2;
    highlightNotes([{ note: qAns, octave: qAnsOct }], 'wrong', [{ note: qAns, octave: qAnsOct }]);
  }
  updateScoreDisplay();
  setTimeout(() => { qAnswered = false; startQuiz(); }, 2000);
}

// ══════════════════════════════════════════════════════════════════
// SCORE DISPLAY
// Updates the live score row and the quiz progress bar.
// After 10 questions the Reset button becomes "Finish!" with a
// wobble animation to prompt the end-of-round overlay.
// ══════════════════════════════════════════════════════════════════

function updateScoreDisplay() {
  const row = document.getElementById('scoreRow');
  const tot = qTotal + qTimeouts;
  row.classList.toggle('visible', tot > 0 || qVisWrong > 0);
  document.getElementById('scCorrect').textContent = qCorrect;
  document.getElementById('scWrong').textContent   = qWrong + qVisWrong;
  document.getElementById('scTimeout').textContent = qTimeouts;
  document.getElementById('scAcc').textContent     = tot > 0 ? Math.round(qCorrect / tot * 100) + '%' : '—';

  // Progress bar — round length is 10 questions
  (function() {
    var fill     = document.getElementById('quizProgressFill');
    var val      = document.getElementById('quizProgressVal');
    var resetBtn = document.getElementById('btnReset');
    if (!fill || !val) return;
    var roundLength = 10;
    var done        = qTotal + qTimeouts;
    var pct         = roundLength > 0 ? Math.min(100, Math.round((done / roundLength) * 100)) : 0;
    fill.style.width = pct + '%';
    val.textContent  = pct + '%';
    if (resetBtn) {
      if (pct >= 100) {
        if (resetBtn.textContent !== 'Finish!') {
          resetBtn.textContent = 'Finish!';
          resetBtn.className   = 'btn-primary wobble';
          resetBtn.addEventListener('animationend', function h() {
            resetBtn.classList.remove('wobble');
            resetBtn.removeEventListener('animationend', h);
          }, { once: true });
        }
      } else {
        resetBtn.textContent = '✕ Reset';
        resetBtn.className   = 'btn-danger';
      }
    }
  })();
}

// ══════════════════════════════════════════════════════════════════
// SCORE OVERLAY
// End-of-round modal with accuracy-based emoji/title feedback.
// Session data is persisted to a separate localStorage key.
// ══════════════════════════════════════════════════════════════════

const OV_TIERS = [
  { min: 90, emoji: '🏆', title: 'Outstanding!',   sub: 'Your ears are finely tuned'       },
  { min: 75, emoji: '🎯', title: 'Sharp ears!',    sub: 'Excellent work'                   },
  { min: 55, emoji: '💪', title: 'Solid session!', sub: "You're getting there"              },
  { min: 35, emoji: '🎵', title: 'Keep going!',    sub: 'Practice sharpens the ear'        },
  { min:  0, emoji: '🌱', title: 'Good start!',    sub: 'Every master was once a beginner' },
];

function showOverlay() {
  const tot = qTotal + qTimeouts;
  if (!tot) { doReset(); return; }
  const acc  = Math.round(qCorrect / tot * 100);
  const tier = OV_TIERS.find(t => acc >= t.min) || OV_TIERS[OV_TIERS.length - 1];
  document.getElementById('ovEmoji').textContent   = tier.emoji;
  document.getElementById('ovTitle').textContent   = tier.title;
  document.getElementById('ovSub').textContent     = tier.sub;
  document.getElementById('ovCorrect').textContent = qCorrect;
  document.getElementById('ovWrong').textContent   = qWrong + qVisWrong;
  document.getElementById('ovTimeout').textContent = qTimeouts;
  document.getElementById('ovAcc').textContent     = tot ? acc + '%' : '—';
  openModal('scoreOverlay');
}

function dismissOverlay() { closeModal('scoreOverlay'); doReset(); }

/** Saves the completed session to history then fully resets all quiz state. */
function doReset() {
  stopTimer();
  cancelScalePlayback();

  // Persist session to history (ring buffer capped at 30 entries)
  if (qTotal + qTimeouts > 0) {
    const LS_S = 'earTrainer_sessions';
    try {
      const ss = JSON.parse(localStorage.getItem(LS_S) || '[]');
      ss.push({
        ts:       Date.now(),
        mode:     currentQuizMode,
        total:    qTotal,
        correct:  qCorrect,
        wrong:    qWrong + qVisWrong,
        timeouts: qTimeouts,
        acc:      Math.round(qCorrect / (qTotal + qTimeouts) * 100),
      });
      if (ss.length > 30) ss.shift();
      localStorage.setItem(LS_S, JSON.stringify(ss));
    } catch (e) {}
  }

  // Reset score counters and question state
  qCorrect = 0; qTotal = 0; qWrong = 0; qTimeouts = 0; qVisWrong = 0;
  qMissWeights = {}; qRecentNotes = []; qLastIntervalAns = null; qLastChordRoot = null;
  qAns = null; qAnsOct = null; qFreq = null; qRefFreq = null; qAnswered = false;
  qIntervalSemis = null; qRefNote = null; qRefOct = null; qChordObj = null;

  // Reset UI
  document.getElementById('quizFeedback').textContent = '';
  document.getElementById('quizFeedback').className   = 'quiz-feedback';
  document.getElementById('quizPrompt').textContent   = 'Select a mode and start the quiz';
  document.getElementById('quizOptions').innerHTML    = '';
  document.getElementById('scoreRow').classList.remove('visible');

  var pFill = document.getElementById('quizProgressFill');
  var pVal  = document.getElementById('quizProgressVal');
  if (pFill) pFill.style.width = '0%';
  if (pVal)  pVal.textContent  = '0%';

  var rb = document.getElementById('btnReset');
  if (rb) { rb.textContent = '✕ Reset'; rb.className = 'btn-danger'; }

  quizActive = false;
  updateQuizButtons();
  updateTimerRing(currentTimerDuration);
  render();
}

/** Alias: triggers the end-of-round overlay (called by the Reset button). */
function resetScore() { showOverlay(); }

// ══════════════════════════════════════════════════════════════════
// PIANO KEYBOARD RENDERER
// Builds the interactive piano inside #piano. White keys are
// rendered first; black keys are overlaid using offsetLeft.
// ══════════════════════════════════════════════════════════════════

const WN = ['C', 'D', 'E', 'F', 'G', 'A', 'B']; // white note names in order

function buildPiano(hsMap) {
  hsMap = hsMap || new Map();
  const piano   = document.getElementById('piano');
  piano.innerHTML = '';
  const oct     = parseInt(document.getElementById('octaveSelect').value);
  const range   = getRange();
  const inScale = new Set(getScaleNotes().map(n => n.note + n.octave));

  // Render one octave of white keys per range octave
  Array.from({ length: range + 1 }, (_, i) => oct + i).forEach(o => {
    WN.forEach(note => {
      const k = document.createElement('div');
      k.className = 'white-key';
      if (inScale.has(note + o)) k.classList.add('in-scale');
      const hs = hsMap.get(note + o) || hsMap.get(note);
      if (hs) k.classList.add(hs === 'correct' ? 'quiz-correct' : 'quiz-wrong');

      const l = document.createElement('span');
      l.className = 'key-label'; l.textContent = note + o;
      k.appendChild(l);
      k.dataset.note   = note;
      k.dataset.octave = o;
      k.addEventListener('click', () => {
        playTone(noteFreq(note, o), getCtx().currentTime);
        k.classList.add('playing');
        setTimeout(() => k.classList.remove('playing'), 500);
        // Count incorrect piano clicks during a quiz as visual wrong answers
        if (qAns && !qAnswered && currentQuizMode !== 'chords' && note !== qAns) {
          qVisWrong++;
          updateScoreDisplay();
        }
      });
      piano.appendChild(k);
    });
  });

  // Overlay black keys using a timeout (white keys must be in the DOM for offsetLeft)
  setTimeout(() => {
    const ba = { C: 'C#', D: 'D#', F: 'F#', G: 'G#', A: 'A#' }; // white → adjacent black
    piano.querySelectorAll('.white-key').forEach(wk => {
      const n = wk.dataset.note;
      const o = parseInt(wk.dataset.octave);
      if (!ba[n]) return;
      const bn = ba[n];
      const bk = document.createElement('div');
      bk.className = 'black-key';
      if (inScale.has(bn + o)) bk.classList.add('in-scale');
      const hs = hsMap.get(bn + o) || hsMap.get(bn);
      if (hs) bk.classList.add(hs === 'correct' ? 'quiz-correct' : 'quiz-wrong');

      const l = document.createElement('span');
      l.className = 'key-label'; l.textContent = bn;
      bk.appendChild(l);
      bk.dataset.note   = bn;
      bk.dataset.octave = o;
      bk.addEventListener('click', e => {
        e.stopPropagation();
        playTone(noteFreq(bn, o), getCtx().currentTime);
        bk.classList.add('playing');
        setTimeout(() => bk.classList.remove('playing'), 500);
        if (qAns && !qAnswered && currentQuizMode !== 'chords' && bn !== qAns) {
          qVisWrong++;
          updateScoreDisplay();
        }
      });
      bk.style.left = (wk.offsetLeft + 29) + 'px';
      piano.appendChild(bk);
    });
  }, 0);
}

// ══════════════════════════════════════════════════════════════════
// FRETBOARD RENDERER (generic — guitar, bass, ukulele)
// Builds an SVG fretboard with scale-degree dots, open-string
// markers, fret numbers, and quiz highlighting via hsMap.
// ══════════════════════════════════════════════════════════════════

function buildFretSvg(svgEl, strings, numFrets, W, H, hsMap) {
  hsMap = hsMap || new Map();
  const scPC = getScalePCs();
  const cs   = getComputedStyle(document.body);

  // Resolve CSS custom properties for fretboard colours
  const fb  = cs.getPropertyValue('--fret-bg').trim();
  const fl  = cs.getPropertyValue('--fret-line').trim();
  const fn  = cs.getPropertyValue('--fret-nut').trim();
  const fd  = cs.getPropertyValue('--fret-dot').trim();
  const fsv = cs.getPropertyValue('--fret-string').trim();
  const a2  = cs.getPropertyValue('--accent2').trim();
  const mu  = cs.getPropertyValue('--muted').trim();
  const cc  = cs.getPropertyValue('--correct').trim();
  const wc  = cs.getPropertyValue('--wrong').trim();

  const rootPc = NOTES.indexOf(document.getElementById('rootSelect').value);

  // Layout constants
  const TOP   = 28, BOTTOM = H - 22, nutX = 58, endX = W - 16;
  const fretW = (endX - nutX) / numFrets;
  const strSp = (BOTTOM - TOP) / (strings.length - 1);

  // Build SVG as a string for performance (large number of elements)
  let c = '<rect width="' + W + '" height="' + H + '" fill="' + fb + '" rx="4"/>';

  // Position markers (dots) at standard fret positions
  [3, 5, 7, 9].forEach(f => {
    if (f <= numFrets) {
      c += '<circle cx="' + (nutX + f * fretW - fretW / 2) + '" cy="' + ((TOP + BOTTOM) / 2) + '" r="4.5" fill="' + fl + '" opacity="0.35"/>';
    }
  });

  // Double dot at fret 12
  if (numFrets >= 12) {
    const x12 = nutX + 12 * fretW - fretW / 2;
    [TOP + strSp, BOTTOM - strSp].forEach(y => {
      c += '<circle cx="' + x12 + '" cy="' + y + '" r="4.5" fill="' + fl + '" opacity="0.35"/>';
    });
  }

  // Nut
  c += '<rect x="' + (nutX - 5) + '" y="' + (TOP - 4) + '" width="5" height="' + (BOTTOM - TOP + 8) + '" fill="' + fn + '" rx="2"/>';

  // Fret lines
  for (let f = 1; f <= numFrets; f++) {
    c += '<line x1="' + (nutX + f * fretW) + '" y1="' + TOP + '" x2="' + (nutX + f * fretW) + '" y2="' + BOTTOM + '" stroke="' + fl + '" stroke-width="1.4"/>';
  }

  // Strings and open-string labels
  strings.forEach(({ note, oct, label }, si) => {
    const y     = TOP + si * strSp;
    const thick = 0.7 + (strings.length - 1 - si) * 0.28; // thicker gauge for lower strings
    c += '<line x1="' + nutX + '" y1="' + y + '" x2="' + endX + '" y2="' + y + '" stroke="' + fsv + '" stroke-width="' + thick + '" opacity="0.7"/>';
    c += '<text x="' + (nutX - 8) + '" y="' + (y + 3.5) + '" font-size="8.5" fill="' + mu + '" font-family="monospace" text-anchor="end">' + label + '</text>';
  });

  // Fret numbers along the bottom
  for (let f = 1; f <= numFrets; f++) {
    c += '<text x="' + (nutX + f * fretW - fretW / 2) + '" y="' + (H - 5) + '" font-size="8" fill="' + mu + '" font-family="monospace" text-anchor="middle">' + f + '</text>';
  }

  // Note dots on the fretboard
  const hitData = []; // collect click targets for interactive overlay
  strings.forEach(({ note, oct }, si) => {
    const y        = TOP + si * strSp;
    const openMidi = noteToMidi(note, oct);
    const openPc   = NOTES.indexOf(note);

    // Open-string dot (shown only if the open string note is in the scale)
    if (scPC.has(openPc)) {
      const hs  = hsMap.get(openPc);
      let   col = openPc === rootPc ? fd : a2;
      if (hs) col = hs === 'correct' ? cc : wc;
      c += '<circle cx="' + (nutX - 14) + '" cy="' + y + '" r="9" fill="' + col + '" opacity="0.92"/>';
      c += '<text x="' + (nutX - 14) + '" y="' + (y + 3.5) + '" font-size="7.5" fill="#000" font-family="monospace" text-anchor="middle" font-weight="bold">' + NOTES[openPc] + '</text>';
    }

    // Fretted note dots
    for (let f = 1; f <= numFrets; f++) {
      const midi = openMidi + f;
      const pc   = midi % 12;
      if (!scPC.has(pc)) continue;
      const x  = nutX + f * fretW - fretW / 2;
      const hs = hsMap.get(pc);
      let   col = pc === rootPc ? fd : a2;
      let   ring = '';
      if (hs) {
        col  = hs === 'correct' ? cc : wc;
        ring = '<circle cx="' + x + '" cy="' + y + '" r="13" fill="none" stroke="' + col + '" stroke-width="2" opacity="0.7"/>';
      }
      c += ring + '<circle cx="' + x + '" cy="' + y + '" r="9.5" fill="' + col + '" opacity="0.92"/>';
      c += '<text x="' + x + '" y="' + (y + 3.5) + '" font-size="7.5" fill="#000" font-family="monospace" text-anchor="middle" font-weight="bold">' + NOTES[pc] + '</text>';
      hitData.push({ x, y, freq: midiFreq(midi), pc });
    }
  });

  svgEl.innerHTML = c;

  // Add transparent click-target circles on top of each dot
  hitData.forEach(({ x, y, freq, pc }) => {
    const hit = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    hit.setAttribute('cx', x); hit.setAttribute('cy', y); hit.setAttribute('r', 10);
    hit.setAttribute('fill', 'transparent'); hit.style.cursor = 'pointer';
    hit.addEventListener('click', () => {
      playTone(freq, getCtx().currentTime);
      if (qAns && !qAnswered && currentQuizMode !== 'chords' && NOTES[pc] !== qAns) {
        qVisWrong++;
        updateScoreDisplay();
      }
    });
    svgEl.appendChild(hit);
  });
}

// Instrument-specific wrappers with preset canvas dimensions
function buildFretboard(hs) { buildFretSvg(document.getElementById('fretSvg'), currentGuitarStrings, 13, 740, 200, hs); }
function buildBass(hs)      { buildFretSvg(document.getElementById('bassSvg'), currentBassStrings,   15, 700, 170, hs); }
function buildUkulele(hs)   { buildFretSvg(document.getElementById('ukeSvg'),  currentUkeStrings,    12, 560, 155, hs); }

// ══════════════════════════════════════════════════════════════════
// FLASH NOTE
// Briefly highlights a note on the active visualiser during scale
// playback or quiz feedback.
// ══════════════════════════════════════════════════════════════════

function flashNote(note, octave, durationMs) {
  durationMs = durationMs || 500;
  if (currentVis === 'piano') {
    // Flash matching piano key(s) using data attributes
    var keys = document.querySelectorAll('#piano [data-note="' + note + '"][data-octave="' + octave + '"]');
    keys.forEach(function(k) {
      k.classList.add('playing');
      setTimeout(function() { k.classList.remove('playing'); }, durationMs);
    });
  } else {
    // Flash fretboard dots by pitch class — inject a temporary glow ring circle
    var pc    = NOTES.indexOf(note); if (pc < 0) return;
    var svgId = currentVis === 'guitar' ? 'fretSvg' : currentVis === 'bass' ? 'bassSvg' : 'ukeSvg';
    var svg   = document.getElementById(svgId); if (!svg) return;
    var dots  = svg.querySelectorAll('circle[fill]:not([fill="transparent"]):not([fill="none"])');
    var acc   = getComputedStyle(document.body).getPropertyValue('--accent').trim();
    dots.forEach(function(dot) {
      // The note-name text element immediately follows each dot circle in the SVG
      var txt = dot.nextElementSibling;
      if (txt && txt.tagName === 'text' && txt.textContent === NOTES[pc]) {
        var glow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        glow.setAttribute('cx', dot.getAttribute('cx'));
        glow.setAttribute('cy', dot.getAttribute('cy'));
        glow.setAttribute('r', '14');
        glow.setAttribute('fill', 'none');
        glow.setAttribute('stroke', acc);
        glow.setAttribute('stroke-width', '3');
        glow.setAttribute('opacity', '0.9');
        svg.appendChild(glow);
        setTimeout(function() { if (glow.parentNode) glow.parentNode.removeChild(glow); }, durationMs);
      }
    });
  }
}

// ══════════════════════════════════════════════════════════════════
// HIGHLIGHT HELPERS
// Called after answering a quiz question to colour notes
// correct / wrong on the active visualiser.
// ══════════════════════════════════════════════════════════════════

/**
 * Highlights guessed notes in 'result' colour. If wrong, also marks
 * the correct notes in green so the player can see what they missed.
 */
function highlightNotes(guessedNotes, result, correctNotes) {
  const hsPiano = new Map();
  const hsFret  = new Map();
  guessedNotes.forEach(({ note, octave }) => {
    hsPiano.set(note + octave, result);
    hsFret.set(NOTES.indexOf(note), result);
  });
  if (result === 'wrong') {
    correctNotes.forEach(({ note, octave }) => {
      if (!hsPiano.has(note + octave)) hsPiano.set(note + octave, 'correct');
      const pc = NOTES.indexOf(note);
      if (!hsFret.has(pc)) hsFret.set(pc, 'correct');
    });
  }
  if      (currentVis === 'piano')  buildPiano(hsPiano);
  else if (currentVis === 'guitar') buildFretboard(hsFret);
  else if (currentVis === 'bass')   buildBass(hsFret);
  else                              buildUkulele(hsFret);
}

/** Highlights all notes of a chord in the given result colour. */
function highlightChord(chordNotes, result) {
  const hsPiano = new Map();
  const hsFret  = new Map();
  chordNotes.forEach(({ note, octave }) => {
    hsPiano.set(note + octave, result);
    hsFret.set(NOTES.indexOf(note), result);
  });
  if      (currentVis === 'piano')  buildPiano(hsPiano);
  else if (currentVis === 'guitar') buildFretboard(hsFret);
  else if (currentVis === 'bass')   buildBass(hsFret);
  else                              buildUkulele(hsFret);
}

// ══════════════════════════════════════════════════════════════════
// SCALE PLAYBACK
// Plays scale notes in sequence with tempo control and a stop button.
// Uses a cancellation token to abort in-flight timeouts cleanly.
// ══════════════════════════════════════════════════════════════════

let scalePlayToken = 0;      // Incremented on cancel to invalidate stale timeouts
let scaleIsPlaying = false;
let scaleDirection = null;   // 'asc' or 'desc'
let scaleSeqGain   = null;   // GainNode for sequence audio (disconnected on stop)
let scaleFast      = false;  // 1× or 2× playback speed

function cancelScalePlayback() {
  scalePlayToken++;
  if (scaleSeqGain) {
    try { scaleSeqGain.disconnect(); } catch (e) {}
    scaleSeqGain = null;
  }
  scaleIsPlaying = false;
  scaleDirection = null;
  resetScaleButtons();
}

function resetScaleButtons() {
  const asc  = document.getElementById('btnScaleAsc');
  const desc = document.getElementById('btnScaleDesc');
  if (!asc || !desc) return;
  asc.textContent  = '▶ Ascending';  asc.className  = 'btn-ghost'; asc.disabled  = false;
  desc.textContent = '▼ Descending'; desc.className = 'btn-ghost'; desc.disabled = false;
}

function setPlayingButton(dir) {
  const asc  = document.getElementById('btnScaleAsc');
  const desc = document.getElementById('btnScaleDesc');
  if (!asc || !desc) return;
  if (dir === 'asc') {
    asc.textContent = '■ Stop'; asc.className = 'btn-danger'; desc.disabled = true;
  } else {
    desc.textContent = '■ Stop'; desc.className = 'btn-danger'; asc.disabled = true;
  }
}

/**
 * Plays an array of notes sequentially at the given BPM.
 * Clicking the same direction button while playing cancels playback.
 */
function playSeq(notes, dir, bpm = 100) {
  if (scaleIsPlaying && scaleDirection === dir) { cancelScalePlayback(); return; }
  cancelScalePlayback();
  const token = ++scalePlayToken;
  scaleIsPlaying = true;
  scaleDirection = dir;
  const ctx = getCtx();
  const gap = 60 / bpm;
  const bar = document.getElementById('statusBar');
  bar.style.width = '0%';

  // Route scale audio through a dedicated gain node so it can be cut instantly
  scaleSeqGain = ctx.createGain();
  scaleSeqGain.connect(ctx.destination);
  setPlayingButton(dir);

  notes.forEach((n, i) => {
    playToneToNode(noteFreq(n.note, n.octave), ctx.currentTime + i * gap, gap * 0.85, scaleSeqGain);
    setTimeout(() => {
      if (scalePlayToken !== token) return;
      bar.style.width = (((i + 1) / notes.length) * 100) + '%';
      flashNote(n.note, n.octave, Math.min(gap * 800, 500));
    }, i * gap * 1000);
  });

  // Clean up after the last note finishes
  setTimeout(() => {
    if (scalePlayToken !== token) return;
    bar.style.width = '0%';
    cancelScalePlayback();
  }, notes.length * gap * 1000 + 300);
}

function toggleSpeed()   { scaleFast = !scaleFast; document.getElementById('btnSpeed').textContent = scaleFast ? '2×' : '1×'; savePref('scaleFast', scaleFast); }
function playScaleAsc()  { playSeq(getScaleNotes(), 'asc',  scaleFast ? 200 : 100); }
function playScaleDesc() { playSeq([...getScaleNotes()].reverse(), 'desc', scaleFast ? 200 : 100); }

// ══════════════════════════════════════════════════════════════════
// QUIZ ENTRY POINT
// ══════════════════════════════════════════════════════════════════

/** Toggles Start / Replay button visibility based on quiz active state. */
function updateQuizButtons() {
  var s = document.getElementById('btnStartQuiz');
  var r = document.getElementById('btnReplay');
  if (s) s.style.display = quizActive ? 'none' : '';
  if (r) r.style.display = quizActive ? ''     : 'none';
}

/** Starts the next quiz question for the current mode. */
function startQuiz() {
  stopTimer();
  qAnswered  = false;
  qVisWrong  = 0;
  quizActive = true;
  updateQuizButtons();
  render();
  document.getElementById('quizFeedback').textContent = '';
  document.getElementById('quizFeedback').className   = 'quiz-feedback';
  if      (currentQuizMode === 'notes')     startNoteQuiz();
  else if (currentQuizMode === 'intervals') startIntervalQuiz();
  else                                      startChordQuiz();
}

// ── Note Names Quiz ──────────────────────────────────────────────

function startNoteQuiz() {
  const allNotes = getScaleNotes();
  const pool     = allNotes.slice(0, -1); // exclude the octave-duplicate top note
  const tonic    = pool[0];
  const refFirst = document.getElementById('rootFirstToggle').checked;

  // When playing root first, exclude the tonic so the player always hears root → something else
  let pickPool = pool;
  if (refFirst && pool.length > 1) {
    const noTonic = pool.filter(n => !(n.note === tonic.note && n.octave === tonic.octave));
    if (noTonic.length > 0) pickPool = noTonic;
  }

  const correct = pickNote(pickPool);
  qRecentNotes.push(correct.note + correct.octave);
  if (qRecentNotes.length > 2) qRecentNotes.shift();

  qAns     = correct.note;
  qAnsOct  = correct.octave;
  qFreq    = noteFreq(correct.note, correct.octave);
  qRefFreq = noteFreq(tonic.note, tonic.octave);

  const unique = [...new Set(pool.map(n => n.note))];
  buildQuizOpts(unique.map(n => ({ label: nn(n), value: n })), v => checkNoteAns(v));

  const ctx     = getCtx();
  const isTonic = correct.note === tonic.note && correct.octave === tonic.octave;
  if (refFirst && !isTonic) {
    document.getElementById('quizPrompt').textContent = '🎵 Root → ? (What note follows?)';
    playTone(qRefFreq, ctx.currentTime, 0.6);
    playTone(qFreq,    ctx.currentTime + 0.85, 1.2);
    setTimeout(function() { flashNote(correct.note, correct.octave, 600); }, 850);
  } else {
    document.getElementById('quizPrompt').textContent = '🎵 What note is this?';
    playTone(qFreq, ctx.currentTime, 1.2);
    flashNote(correct.note, correct.octave, 600);
  }
  startTimer();
}

function checkNoteAns(note) {
  if (qAnswered) return;
  qAnswered = true; stopTimer(); qTotal++;
  document.querySelectorAll('.quiz-opt').forEach(b => b.disabled = true);
  const ok  = note === qAns;
  const fb  = document.getElementById('quizFeedback');
  const btn = [...document.querySelectorAll('.quiz-opt')].find(b => b.dataset.val === note);
  if (ok) {
    qCorrect++;
    if (btn) btn.classList.add('correct');
    fb.textContent = '✓ Correct!'; fb.className = 'quiz-feedback correct';
    // Gradually reduce the miss weight for correctly answered notes
    if ((qMissWeights[note + qAnsOct] || 0) > 0) qMissWeights[note + qAnsOct] = Math.max(0, qMissWeights[note + qAnsOct] - 0.4);
  } else {
    qWrong++;
    if (btn) btn.classList.add('wrong');
    fb.textContent = '✗ That was ' + nn(qAns); fb.className = 'quiz-feedback wrong';
    qMissWeights[qAns + qAnsOct] = (qMissWeights[qAns + qAnsOct] || 0) + 0.8;
    // Also highlight the correct answer button so the player sees what was right
    document.querySelectorAll('.quiz-opt').forEach(b => { if (b.dataset.val === qAns) b.classList.add('correct'); });
  }
  updateScoreDisplay();
  highlightNotes([{ note, octave: qAnsOct }], ok ? 'correct' : 'wrong', [{ note: qAns, octave: qAnsOct }]);
  setTimeout(() => { qAnswered = false; startQuiz(); }, 1800);
}

// ── Interval Quiz ────────────────────────────────────────────────

function startIntervalQuiz() {
  const allNotes = getScaleNotes();
  const pool     = allNotes.slice(0, -1);
  if (pool.length < 2) {
    document.getElementById('quizPrompt').textContent = 'Scale needs at least 2 unique notes for interval quiz';
    return;
  }

  // Exclude the previous answer to avoid immediate repeats
  const pickPool = qLastIntervalAns && pool.length > 1
    ? pool.filter(n => n.note + n.octave !== qLastIntervalAns)
    : pool;
  const correct = pickNote(pickPool.length ? pickPool : pool);
  qLastIntervalAns = correct.note + correct.octave;

  qAns    = correct.note;
  qAnsOct = correct.octave;
  qFreq   = noteFreq(correct.note, correct.octave);

  // Pick a reference note different from the answer, respecting the direction filter
  let others       = pool.filter(n => n.note !== correct.note);
  const correctMidi = noteToMidi(correct.note, correct.octave);
  if (intervalDirection === 'asc') {
    const below = others.filter(n => noteToMidi(n.note, n.octave) < correctMidi);
    if (below.length) others = below;
  } else if (intervalDirection === 'desc') {
    const above = others.filter(n => noteToMidi(n.note, n.octave) > correctMidi);
    if (above.length) others = above;
  }
  const ref   = others[Math.floor(Math.random() * others.length)];
  qRefNote    = ref.note; qRefOct = ref.octave;
  qRefFreq    = noteFreq(ref.note, ref.octave);
  const refMidi = noteToMidi(ref.note, ref.octave);

  // Semitone distance, normalised to 1–12
  let diff = Math.abs(correctMidi - refMidi);
  while (diff > 12) diff -= 12;
  if (diff === 0) diff = 12;
  qIntervalSemis = diff;

  // Build option set from all intervals present in the current scale
  const scaleSemisArr = SCALES[document.getElementById('scaleSelect').value].filter(s => s > 0 && s <= 12);
  const optSet = new Set([diff, ...scaleSemisArr]);
  const opts   = [...optSet].sort((a, b) => a - b);
  buildQuizOpts(opts.map(s => ({ label: INTERVAL_NAMES[s] || s + 'st', value: String(s) })), v => checkIntervalAns(parseInt(v)));

  const dir = correctMidi >= refMidi ? 'above' : 'below';
  document.getElementById('quizPrompt').textContent = '🎵 What interval is the 2nd note ' + dir + ' the 1st?';

  const ctx = getCtx();
  if (document.getElementById('rootFirstToggle').checked) {
    // "Root first" mode: play reference note, then answer note
    playTone(qRefFreq, ctx.currentTime, 0.8);
    playTone(qFreq,    ctx.currentTime + 1.0, 1.2);
  } else {
    // Default: play answer note first, then reference for comparison
    playTone(qFreq,    ctx.currentTime, 0.8);
    playTone(qRefFreq, ctx.currentTime + 1.0, 1.2);
  }
  startTimer();
}

function checkIntervalAns(semis) {
  if (qAnswered) return;
  qAnswered = true; stopTimer(); qTotal++;
  document.querySelectorAll('.quiz-opt').forEach(b => b.disabled = true);
  const ok           = semis === qIntervalSemis;
  const fb           = document.getElementById('quizFeedback');
  const correctLabel = INTERVAL_NAMES[qIntervalSemis] || qIntervalSemis + 'st';
  const btn          = [...document.querySelectorAll('.quiz-opt')].find(b => parseInt(b.dataset.val) === semis);
  if (ok) {
    qCorrect++;
    if (btn) btn.classList.add('correct');
    fb.textContent = '✓ Correct! ' + correctLabel; fb.className = 'quiz-feedback correct';
    if ((qMissWeights[qAns + qAnsOct] || 0) > 0) qMissWeights[qAns + qAnsOct] = Math.max(0, qMissWeights[qAns + qAnsOct] - 0.4);
  } else {
    qWrong++;
    if (btn) btn.classList.add('wrong');
    fb.textContent = '✗ That was ' + correctLabel; fb.className = 'quiz-feedback wrong';
    qMissWeights[qAns + qAnsOct] = (qMissWeights[qAns + qAnsOct] || 0) + 0.8;
    document.querySelectorAll('.quiz-opt').forEach(b => { if (parseInt(b.dataset.val) === qIntervalSemis) b.classList.add('correct'); });
  }
  updateScoreDisplay();
  // Highlight both the reference note and the answer note
  highlightNotes(
    [{ note: qRefNote, octave: qRefOct }, { note: qAns, octave: qAnsOct }],
    ok ? 'correct' : 'wrong',
    [{ note: qRefNote, octave: qRefOct }, { note: qAns, octave: qAnsOct }],
  );
  setTimeout(() => { qAnswered = false; startQuiz(); }, 1800);
}

// ── Chord Quiz ───────────────────────────────────────────────────

function startChordQuiz() {
  const chords = getScaleChords();
  if (chords.length < 2) {
    document.getElementById('quizPrompt').textContent = 'Not enough diatonic chords — try Major or Natural Minor';
    return;
  }

  // Exclude the previous chord root to avoid immediate repeats
  const pickChords = qLastChordRoot !== null && chords.length > 1
    ? chords.filter(c => c.rootPc !== qLastChordRoot)
    : chords;
  const correct = (pickChords.length ? pickChords : chords)[Math.floor(Math.random() * (pickChords.length || chords.length))];
  qLastChordRoot = correct.rootPc;
  qChordObj      = correct;
  qAns           = correct.type;

  // Build options: correct type + up to 5 distractors from other diatonic chord types
  const allTypes    = [...new Set(chords.map(c => c.type))];
  const distractors = shuffle(allTypes.filter(t => t !== correct.type)).slice(0, Math.min(5, allTypes.length - 1));
  const opts        = shuffle([correct.type, ...distractors]);

  buildQuizOpts(opts.map(t => ({ label: t, value: t })), v => checkChordAns(v));
  document.getElementById('quizPrompt').textContent = '🎵 What chord type is this? (root: ' + nn(correct.rootNote) + ')';
  playChordFreqs(correct.notes.map(n => noteFreq(n.note, n.octave)));
  startTimer();
}

function checkChordAns(type) {
  if (qAnswered) return;
  qAnswered = true; stopTimer(); qTotal++;
  document.querySelectorAll('.quiz-opt').forEach(b => b.disabled = true);
  const ok  = type === qAns;
  const fb  = document.getElementById('quizFeedback');
  const btn = [...document.querySelectorAll('.quiz-opt')].find(b => b.dataset.val === type);
  if (ok) {
    qCorrect++;
    if (btn) btn.classList.add('correct');
    fb.textContent = '✓ ' + nn(qChordObj.rootNote) + ' ' + qAns + '!'; fb.className = 'quiz-feedback correct';
  } else {
    qWrong++;
    if (btn) btn.classList.add('wrong');
    fb.textContent = '✗ That was ' + nn(qChordObj.rootNote) + ' ' + qAns; fb.className = 'quiz-feedback wrong';
    document.querySelectorAll('.quiz-opt').forEach(b => { if (b.dataset.val === qAns) b.classList.add('correct'); });
  }
  updateScoreDisplay();
  highlightChord(qChordObj.notes, ok ? 'correct' : 'wrong');
  setTimeout(() => { qAnswered = false; startQuiz(); }, 2000);
}

// ── Shared Quiz Utilities ────────────────────────────────────────

/** Renders the answer option buttons for the current question. */
function buildQuizOpts(items, onSelect) {
  const opts = document.getElementById('quizOptions');
  opts.innerHTML = '';
  items.forEach(({ label, value }) => {
    const b = document.createElement('button');
    b.className = 'quiz-opt'; b.textContent = label; b.dataset.val = value;
    b.addEventListener('click', () => onSelect(value));
    opts.appendChild(b);
  });
}

/** Replays the current question's audio (called by the Replay button). */
function replayQuizNote() {
  if (currentQuizMode === 'chords') {
    if (qChordObj) playChordFreqs(qChordObj.notes.map(n => noteFreq(n.note, n.octave)));
    return;
  }
  if (!qFreq) return;
  const ctx      = getCtx();
  const refFirst = document.getElementById('rootFirstToggle').checked;
  if (currentQuizMode === 'intervals' && refFirst && qRefFreq) {
    playTone(qRefFreq, ctx.currentTime, 0.8);
    playTone(qFreq,    ctx.currentTime + 1.0, 1.2);
  } else if (currentQuizMode === 'notes' && refFirst && qRefFreq && qRefFreq !== qFreq) {
    playTone(qRefFreq, ctx.currentTime, 0.6);
    playTone(qFreq,    ctx.currentTime + 0.85, 1.2);
  } else {
    playTone(qFreq, ctx.currentTime, 1.2);
  }
}

/** Fisher-Yates shuffle — mutates the array in place and returns it. */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Re-renders the active visualiser panel without any quiz highlight state. */
function render() {
  if      (currentVis === 'piano')  buildPiano();
  else if (currentVis === 'guitar') buildFretboard();
  else if (currentVis === 'bass')   buildBass();
  else                              buildUkulele();
}

// ══════════════════════════════════════════════════════════════════
// TIMBRE PRESETS
// Pre-configured knob values for common instrument characters.
// Applied automatically when the user selects a timbre from the dropdown.
// ══════════════════════════════════════════════════════════════════

var TIMBRE_PRESETS = {
  piano: { toneVolume: 80, toneBrightness: 60, toneAttack: 5,  toneRelease: 40, toneNoise: 0, toneReverb: 15, toneFilterEnv: 50, toneNoiseTone: 50, toneLayer: 'none' },
  synth: { toneVolume: 80, toneBrightness: 40, toneAttack: 10, toneRelease: 50, toneNoise: 0, toneReverb: 10, toneFilterEnv: 50, toneNoiseTone: 50, toneLayer: 'none' },
  soft:  { toneVolume: 80, toneBrightness: 30, toneAttack: 20, toneRelease: 70, toneNoise: 0, toneReverb: 25, toneFilterEnv: 50, toneNoiseTone: 50, toneLayer: 'none' },
};

function applyTimbrePreset(key) {
  var preset = TIMBRE_PRESETS[key];
  if (!preset) return;
  Object.keys(preset).forEach(function(k) {
    if (k === 'toneLayer') {
      toneLayer = preset[k];
      document.getElementById('layerSelect').value = preset[k];
      savePref(k, preset[k]);
    } else {
      updateSoundParam(k, preset[k]);
      if (soundKnobRefs[k]) soundKnobRefs[k].setValue(preset[k]);
    }
  });
}

document.getElementById('timbreSelect').addEventListener('change', e => {
  currentTimbre = e.target.value;
  savePref('timbre', currentTimbre);
  applyTimbrePreset(currentTimbre);
});

// ══════════════════════════════════════════════════════════════════
// SESSION HISTORY
// Reads saved session records and renders an SVG bar chart of
// accuracy over time. Stored separately from main prefs.
// ══════════════════════════════════════════════════════════════════

const LS_SESSIONS_KEY = 'earTrainer_sessions';

function openSessionsOverlay() { buildSessionsChart(); openModal('sessionsOverlay'); }

function buildSessionsChart() {
  let sessions = [];
  try { sessions = JSON.parse(localStorage.getItem(LS_SESSIONS_KEY) || '[]'); } catch (e) {}
  const el = document.getElementById('sessionsContent');
  if (!sessions.length) {
    el.innerHTML = '<div class="session-empty">No sessions recorded yet. Complete a quiz and press Reset to save.</div>';
    return;
  }

  const cs   = getComputedStyle(document.body);
  const clrC = cs.getPropertyValue('--correct').trim();
  const clrA = cs.getPropertyValue('--accent').trim();
  const clrW = cs.getPropertyValue('--wrong').trim();
  const clrM = cs.getPropertyValue('--muted').trim();
  const clrB = cs.getPropertyValue('--border').trim();

  const n = sessions.length, bw = 12, gap = 4, pL = 22, pT = 4, chartH = 70, pB = 16;

  // Sanitize accuracy values: coerce to number, guard against NaN/Infinity, clamp to [0, 100]
  const accValues = sessions.map(s => {
    const raw        = (s && typeof s.acc !== 'undefined') ? Number(s.acc) : 0;
    const safeFinite = Number.isFinite(raw) ? raw : 0;
    return Math.min(100, Math.max(0, safeFinite));
  });

  const chartW = Math.max(n * (bw + gap) - gap, 1);
  const svgW   = pL + chartW + 8;
  const svgH   = pT + chartH + pB;

  let svg = `<svg viewBox="0 0 ${svgW} ${svgH}" style="width:${svgW}px;max-width:100%;display:block;margin:0 auto">`;

  // Horizontal grid lines + y-axis labels at 0 / 25 / 50 / 75 / 100
  [0, 25, 50, 75, 100].forEach(v => {
    const y = pT + chartH - Math.round(v / 100 * chartH);
    svg += `<line x1="${pL}" y1="${y}" x2="${pL + chartW}" y2="${y}" stroke="${clrB}" stroke-width="0.5"/>`;
    svg += `<text x="${pL - 3}" y="${y + 3}" font-size="7" fill="${clrM}" font-family="monospace" text-anchor="end">${v}</text>`;
  });

  // Session bars coloured by accuracy tier (green / accent / red)
  accValues.forEach((acc, i) => {
    const x   = pL + i * (bw + gap);
    const h   = Math.max(2, Math.round(acc / 100 * chartH));
    const y   = pT + chartH - h;
    const col = acc >= 70 ? clrC : acc >= 50 ? clrA : clrW;
    svg += `<rect x="${x}" y="${y}" width="${bw}" height="${h}" fill="${col}" rx="2" opacity="0.85"/>`;
  });

  svg += '</svg>';
  const best = Math.max(...accValues);
  const avg  = Math.round(accValues.reduce((a, v) => a + v, 0) / accValues.length);
  el.innerHTML = `<div style="overflow-x:auto;padding:4px 0">${svg}</div><div class="session-stats-text">${n} session${n === 1 ? '' : 's'} &bull; Best: ${best}% &bull; Avg: ${avg}%</div>`;
}

// ══════════════════════════════════════════════════════════════════
// INIT
// ══════════════════════════════════════════════════════════════════

buildSelects();
restoreSettings();
render();
