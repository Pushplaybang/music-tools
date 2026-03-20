/**
 * pulse.js — Visual Metronome
 *
 * Tool:        Pulse
 * Description: A browser-based visual metronome with beat-grid visualiser,
 *              canvas pendulum, tap tempo, swing, subdivisions, count-in,
 *              mute-bar training, speed trainer, and 5-slot preset recall.
 * LS key:      musicTool_pulse_v1  (settings)
 *              musicTool_pulse_presets  (preset slots array)
 *
 * Depends on:  Web Audio API, requestAnimationFrame, localStorage
 * No external libraries or frameworks.
 */

/* ═══════════════════════════════════════════════════════════════
   LOCALSTORAGE HELPERS
   ═══════════════════════════════════════════════════════════════ */

/** Primary localStorage key for all user settings. */
const LS_KEY = 'musicTool_pulse_v1';

/** Separate key for the 5-slot preset array (kept independent so
 *  resetting settings doesn't wipe saved presets). */
const LS_PRESETS = 'musicTool_pulse_presets';

/**
 * Persist a single key/value pair to localStorage under LS_KEY.
 * Reads existing JSON, merges, then writes back.
 * @param {string} k - Preference key.
 * @param {*} v - Serialisable value.
 */
function savePref(k, v) {
  try {
    const d = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
    d[k] = v;
    localStorage.setItem(LS_KEY, JSON.stringify(d));
  } catch (e) {}
}

/**
 * Read the entire settings object from localStorage.
 * @returns {Object} Stored preferences, or {} if nothing is saved.
 */
function loadPrefs() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '{}');
  } catch (e) {
    return {};
  }
}

/* ═══════════════════════════════════════════════════════════════
   PRESET SLOTS
   ═══════════════════════════════════════════════════════════════ */

/** Array of 5 preset config objects (or null for empty slots). */
let presetSlots = [null, null, null, null, null];

/** Whether the UI is currently in "save mode" (all slots pulsing,
 *  waiting for the user to click one to save). */
let presetSaveMode = false;

/**
 * Load the saved preset slots array from localStorage.
 * Validates that it is an array of exactly 5 elements.
 */
function loadPresetSlots() {
  try {
    const d = JSON.parse(localStorage.getItem(LS_PRESETS));
    if (Array.isArray(d) && d.length === 5) presetSlots = d;
  } catch (e) {}
}

/**
 * Persist the current presetSlots array to localStorage.
 */
function savePresetSlots() {
  try {
    localStorage.setItem(LS_PRESETS, JSON.stringify(presetSlots));
  } catch (e) {}
}

/**
 * Re-render the preset slot buttons to reflect current slot data.
 * Shows slot index+1 for empty slots; shows the preset name for filled ones.
 */
function renderPresetSlots() {
  document.querySelectorAll('.preset-slot').forEach(btn => {
    const i = +btn.dataset.slot;
    const s = presetSlots[i];
    btn.classList.toggle('filled', !!s);
    // Display custom name if set and non-default, otherwise "Slot N"
    btn.textContent = s
      ? ((s.name && s.name !== 'Slot ' + (i + 1)) ? s.name : 'Slot ' + (i + 1))
      : (i + 1);
    btn.title = s ? 'Load preset: ' + (s.name || 'Slot ' + (i + 1)) : 'Empty slot';
  });
}

/**
 * Snapshot the current metronome state into a plain config object
 * suitable for storing in a preset slot.
 * @returns {Object} Config snapshot.
 */
function gatherCurrentConfig() {
  return {
    name: null,
    bpm: bpm,
    beatsPerBar: beatsPerBar,
    noteValue: noteValue,
    subdivision: subdivision,
    accentLevels: accentLevels.slice(),
    subAccentLevels: subAccentLevels.map(r => r.slice()),
    swing: +document.getElementById('swingSlider').value,
    vol: +document.getElementById('volSlider').value,
    bright: +document.getElementById('brightSlider').value,
    env: +document.getElementById('envSlider').value,
    accentBoost: +document.getElementById('accentBoostSlider').value,
    clickRate: clickRate
  };
}

/**
 * Apply a saved preset slot to the metronome, stopping playback first.
 * Restores all state variables and syncs the UI.
 * @param {number} slot - Zero-based slot index (0–4).
 */
function applyPreset(slot) {
  const s = presetSlots[slot];
  if (!s) return;
  if (isPlaying) stopMetronome();

  // Restore core state
  bpm = s.bpm || 120;
  beatsPerBar = s.beatsPerBar || 4;
  noteValue = s.noteValue || 4;
  subdivision = s.subdivision || 1;
  clickRate = s.clickRate || 1;

  // Restore per-beat accent levels — fall back to defaults if dimensions mismatch
  if (Array.isArray(s.accentLevels) && s.accentLevels.length === beatsPerBar) {
    accentLevels = s.accentLevels.slice();
  } else {
    accentLevels = Array.from({ length: beatsPerBar }, (_, i) => i === 0 ? 3 : 1);
  }

  // Restore per-subdivision accent levels — validate both dimensions
  const subLen = Math.max(0, subdivision - 1);
  if (
    Array.isArray(s.subAccentLevels) &&
    s.subAccentLevels.length === beatsPerBar &&
    s.subAccentLevels.every(a => Array.isArray(a) && a.length === subLen)
  ) {
    subAccentLevels = s.subAccentLevels.map(r => r.slice());
  } else {
    subAccentLevels = Array.from({ length: beatsPerBar }, () => new Array(subLen).fill(1));
  }

  // Sync UI controls to restored values
  setBpm(bpm);
  document.getElementById('beatsPerBar').value = beatsPerBar;
  document.getElementById('noteValue').value = noteValue;
  document.querySelectorAll('.sub-btn').forEach(b =>
    b.classList.toggle('active', +b.dataset.sub === subdivision)
  );
  if (s.vol != null)         document.getElementById('volSlider').value = s.vol;
  if (s.bright != null)      document.getElementById('brightSlider').value = s.bright;
  if (s.env != null)         document.getElementById('envSlider').value = s.env;
  if (s.accentBoost != null) document.getElementById('accentBoostSlider').value = s.accentBoost;
  if (s.swing != null)       document.getElementById('swingSlider').value = s.swing;

  setClickRate(clickRate);
  updateSoundLabel();
  updateSwingLabel();
  updatePresetHighlight();
  buildBeatGrid();
  saveAllPrefs();
  showPresetToast('Loaded: ' + (s.name || 'Slot ' + (slot + 1)));
}

/**
 * Enter "save mode" — all preset slot buttons pulse and the save button
 * becomes a cancel button.  The next slot click will write the current config.
 */
function enterSaveMode() {
  presetSaveMode = true;
  document.getElementById('presetSlotsCard').classList.add('save-mode');
  document.getElementById('presetSaveBtn').classList.add('active');
  document.getElementById('presetSaveBtn').textContent = '✕ Cancel';
}

/**
 * Exit save mode without saving anything.
 */
function exitSaveMode() {
  presetSaveMode = false;
  document.getElementById('presetSlotsCard').classList.remove('save-mode');
  document.getElementById('presetSaveBtn').classList.remove('active');
  document.getElementById('presetSaveBtn').textContent = '💾 Save';
}

/**
 * Write the current config to the given preset slot and exit save mode.
 * Preserves any existing custom name for the slot.
 * @param {number} slot - Zero-based slot index.
 */
function saveToSlot(slot) {
  const cfg = gatherCurrentConfig();
  const existing = presetSlots[slot];
  cfg.name = existing ? existing.name : 'Slot ' + (slot + 1);
  presetSlots[slot] = cfg;
  savePresetSlots();
  renderPresetSlots();
  exitSaveMode();
  showPresetToast('Saved to: ' + cfg.name);
}

/**
 * Show a brief toast notification at the bottom of the viewport.
 * Auto-hides after 1.5 s.
 * @param {string} msg - Message text.
 */
function showPresetToast(msg) {
  const t = document.getElementById('presetToast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 1500);
}

/**
 * Prompt the user to rename a filled preset slot (max 12 characters).
 * @param {number} slot - Zero-based slot index.
 */
function renameSlot(slot) {
  const s = presetSlots[slot];
  if (!s) return;
  const name = prompt('Rename preset (max 12 chars):', s.name || 'Slot ' + (slot + 1));
  if (name === null) return;
  s.name = name.slice(0, 12) || 'Slot ' + (slot + 1);
  savePresetSlots();
  renderPresetSlots();
}

// Wire up slot buttons: click = load/save, right-click = rename,
// long-press on mobile (600 ms) = rename.
document.querySelectorAll('.preset-slot').forEach(btn => {
  const slot = +btn.dataset.slot;

  btn.addEventListener('click', () => {
    if (presetSaveMode) {
      saveToSlot(slot);
      return;
    }
    if (presetSlots[slot]) applyPreset(slot);
  });

  // Right-click opens rename prompt
  btn.addEventListener('contextmenu', e => {
    e.preventDefault();
    renameSlot(slot);
  });

  // Long-press on touch devices triggers rename instead of load
  let lpTimer = null, lpFired = false;
  btn.addEventListener('touchstart', () => {
    lpFired = false;
    lpTimer = setTimeout(() => { lpFired = true; renameSlot(slot); }, 600);
  }, { passive: true });
  btn.addEventListener('touchend', e => {
    if (lpFired) { e.preventDefault(); lpFired = false; clearTimeout(lpTimer); lpTimer = null; return; }
    clearTimeout(lpTimer); lpTimer = null;
  });
  btn.addEventListener('touchmove', () => {
    clearTimeout(lpTimer); lpTimer = null;
  }, { passive: true });
});

// Toggle between save mode and normal mode on save-button click
document.getElementById('presetSaveBtn').addEventListener('click', () => {
  if (presetSaveMode) exitSaveMode(); else enterSaveMode();
});

// Load persisted preset data on startup
loadPresetSlots();
renderPresetSlots();

/* ═══════════════════════════════════════════════════════════════
   LIGHT / DARK MODE
   ═══════════════════════════════════════════════════════════════ */

/**
 * Apply a colour mode to the document body and persist the choice.
 * After switching, refresh the pendulum's cached CSS colour values so the
 * canvas redraws with the new theme tokens.
 * @param {string} m      - 'light' or 'dark'.
 * @param {boolean} noSave - If true, skip persisting (used during init).
 */
function applyMode(m, noSave) {
  document.body.dataset.mode = m;
  const badge = document.getElementById('modeBadge');
  if (badge) badge.textContent = m === 'dark' ? 'DARK' : 'LIGHT';
  // Defer colour cache refresh one frame so CSS variables have resolved
  requestAnimationFrame(() => {
    refreshThemeCache();
    if (showArm && !isPlaying) drawPendulumIdle();
  });
  if (!noSave) savePref('mode', m);
}

// Toggle mode on mode-toggle click
document.getElementById('modeToggle').addEventListener('click', () => {
  applyMode(document.body.dataset.mode === 'dark' ? 'light' : 'dark');
});

/* ═══════════════════════════════════════════════════════════════
   MODAL HELPERS
   ═══════════════════════════════════════════════════════════════ */

/**
 * Show a modal overlay by id.
 * @param {string} id - Element id of the .modal-overlay element.
 */
function openModal(id) {
  document.getElementById(id).classList.add('show');
  document.body.style.overflow = 'hidden';
}

/**
 * Hide a modal overlay by id.
 * @param {string} id - Element id of the .modal-overlay element.
 */
function closeModal(id) {
  document.getElementById(id).classList.remove('show');
  document.body.style.overflow = '';
}

// Close any modal when clicking outside its card (on the overlay itself)
document.querySelectorAll('.modal-overlay').forEach(ov =>
  ov.addEventListener('click', e => { if (e.target === ov) closeModal(ov.id); })
);

/* ═══════════════════════════════════════════════════════════════
   STATE VARIABLES
   ═══════════════════════════════════════════════════════════════ */

/** Current tempo in beats per minute. */
let bpm = 120;

/** Number of beats in one bar (numerator of time signature). */
let beatsPerBar = 4;

/** Note value for the beat unit (denominator): 2 = half, 4 = quarter, 8 = eighth. */
let noteValue = 4;

/** Subdivision multiplier: 1 = no subs, 2 = 8ths, 3 = triplets, 4 = 16ths. */
let subdivision = 1;

/**
 * Accent level for each main beat (index 0 = beat 1).
 * Values: 1 = normal, 2 = medium accent, 3 = strong accent.
 */
let accentLevels = [3, 1, 1, 1];

/**
 * 2-D array [beat][subIndex] of accent levels for subdivision dots.
 * subAccentLevels[b][s] where b ∈ [0, beatsPerBar) and s ∈ [0, subdivision-2].
 */
let subAccentLevels = [];

/** Whether the metronome is currently running. */
let isPlaying = false;

/** Whether the canvas pendulum arm is visible. */
let showArm = false;

/**
 * Click rate multiplier.
 * 0.5 = half speed (clicks on every other beat),
 * 1   = normal,
 * 2   = double speed (clicks on every subdivision as if doubled).
 */
let clickRate = 1;

// ── Count-in state ──────────────────────────────────────────────
/** Whether a one-bar count-in fires before the loop starts. */
let countInEnabled = false;
/** Remaining count-in beats (counts down from beatsPerBar to 0). */
let countInRemaining = 0;

// ── Mute-bar state ──────────────────────────────────────────────
/** Whether mute-bar alternation is active. */
let muteBarEnabled = false;
/** Number of bars per phase (same for play and mute phases). */
let muteBarCount = 2;
/** Current phase: 'play' (audible) or 'mute' (silent). */
let muteBarPhase = 'play';
/** Counts bars elapsed within the current phase. */
let muteBarCounter = 0;

// ── Speed trainer state ─────────────────────────────────────────
/** Whether the speed trainer feature is enabled (panel visible). */
let stEnabled = false;
/** Speed trainer timing mode: 'bars' or 'minutes'. */
let stMode = 'bars';
/** Whether a speed run is currently in progress. */
let stRunning = false;
/** Start BPM for the current/next ramp. */
let stStartBpm = 100;
/** End BPM for the current/next ramp. */
let stEndBpm = 120;
/** Duration of the ramp in bars or minutes (depends on stMode). */
let stDuration = 16;
/** AudioContext time at which the current speed run started. */
let stStartTime = 0;
/** Total ramp duration in seconds (computed when run starts). */
let stTotalDuration = 0;

/* ═══════════════════════════════════════════════════════════════
   WEB AUDIO ENGINE
   ═══════════════════════════════════════════════════════════════ */

/** Lazily-created AudioContext — shared across the entire tool lifetime. */
let audioCtx = null;

/**
 * Return the shared AudioContext, creating it on first call.
 * Also resumes a suspended context (browsers suspend after user inactivity).
 * @returns {AudioContext}
 */
function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

/* ═══════════════════════════════════════════════════════════════
   SCHEDULER — lookahead / setInterval pattern
   ═══════════════════════════════════════════════════════════════ */
/*
 * The scheduler uses the well-known "double buffer" lookahead pattern:
 *   - A short setInterval fires every LOOK_MS milliseconds.
 *   - Each call schedules any notes whose time falls within
 *     [ctx.currentTime, ctx.currentTime + SCHED_AHEAD].
 *   - Audio is scheduled precisely on the AudioContext timeline (sample-accurate).
 *   - Visual callbacks are posted via setTimeout with the matching delay so
 *     they fire as close as possible to the audio event.
 *
 * This approach avoids the jitter of relying solely on setTimeout/setInterval
 * for audio timing, while still driving the DOM from the main thread.
 */

/** How far ahead (seconds) to schedule notes in advance. */
const SCHED_AHEAD = 0.1;

/** How frequently (milliseconds) the scheduler loop runs. */
const LOOK_MS = 25;

/** AudioContext time of the next note to be scheduled. */
let nextNoteTime = 0;

/** Beat position within the current bar (0-indexed). */
let currentBeatInBar = 0;

/** Subdivision position within the current beat (0-indexed). */
let currentSubDiv = 0;

/** Handle returned by setInterval for the scheduler loop. */
let schedulerTimer = null;

/* ═══════════════════════════════════════════════════════════════
   TAP TEMPO
   ═══════════════════════════════════════════════════════════════ */

/** Timestamps (ms) of recent taps — used to compute average inter-tap interval. */
let tapTimes = [];

/* ═══════════════════════════════════════════════════════════════
   PENDULUM CANVAS STATE
   ═══════════════════════════════════════════════════════════════ */

/** Maximum swing angle in degrees from the vertical (±PEND_MAX). */
const PEND_MAX = 26;

/** Current pendulum angle in degrees (0 = vertical). */
let pAngle = 0;

/** Start angle of the current swing animation (degrees). */
let pFrom = 0;

/** Target angle of the current swing animation (degrees). */
let pTo = PEND_MAX;

/** Timestamp (from requestAnimationFrame) when the current swing started. */
let pSwingStart = null;

/** Duration of the current swing in milliseconds (equals one beat duration). */
let pSwingDur = 500;

/** requestAnimationFrame handle for the pendulum animation, or null if idle. */
let pAnimFrame = null;

/* ═══════════════════════════════════════════════════════════════
   BPM UTILITIES
   ═══════════════════════════════════════════════════════════════ */

/**
 * Italian tempo name lookup table: [minBPM, maxBPM, name].
 * Covers the full 20–300 BPM range used by the tool.
 */
const TEMPO_NAMES = [
  [20, 39, 'Larghissimo'],
  [40, 59, 'Largo'],
  [60, 65, 'Larghetto'],
  [66, 75, 'Adagio'],
  [76, 107, 'Andante'],
  [108, 119, 'Moderato'],
  [120, 155, 'Allegro'],
  [156, 175, 'Vivace'],
  [176, 200, 'Presto'],
  [201, 300, 'Prestissimo']
];

/**
 * Return the Italian tempo name for a given BPM value.
 * @param {number} b - BPM value.
 * @returns {string} Italian tempo name, or '' if outside the table range.
 */
function getTempoName(b) {
  for (const [lo, hi, n] of TEMPO_NAMES) {
    if (b >= lo && b <= hi) return n;
  }
  return '';
}

/**
 * Set the BPM, clamp to [20, 300], and sync all UI elements that show the tempo.
 * @param {number} val - Desired BPM (will be clamped).
 */
function setBpm(val) {
  bpm = Math.max(20, Math.min(300, +val));
  document.getElementById('bpmDisplay').textContent = bpm;
  document.getElementById('bpmSlider').value = bpm;
  document.getElementById('tempoName').textContent = getTempoName(bpm);
  savePref('bpm', bpm);
}

/**
 * Nudge the current BPM by a delta (positive or negative).
 * @param {number} d - Amount to add (e.g. +1, -10).
 */
function adjustBpm(d) {
  setBpm(bpm + d);
}

/**
 * Record a tap and compute a new BPM from the running average of up to 8 taps.
 * Resets the tap buffer if more than 3 seconds have passed since the last tap.
 * Briefly adds the CSS class 'tapped' to the tap button for visual feedback.
 */
function tapTempo() {
  const now = performance.now();
  // Stale tap buffer — user paused, start fresh
  if (tapTimes.length > 0 && now - tapTimes[tapTimes.length - 1] > 3000) tapTimes = [];
  tapTimes.push(now);
  // Keep the rolling window to 8 taps maximum
  if (tapTimes.length > 8) tapTimes.shift();
  if (tapTimes.length >= 2) {
    // Average the intervals between successive taps
    let sum = 0;
    for (let i = 1; i < tapTimes.length; i++) sum += tapTimes[i] - tapTimes[i - 1];
    setBpm(Math.round(60000 / (sum / (tapTimes.length - 1))));
  }
  // Flash the tap button
  const btn = document.getElementById('tapBtn');
  btn.classList.add('tapped');
  setTimeout(() => btn.classList.remove('tapped'), 150);
}

/* ═══════════════════════════════════════════════════════════════
   TIME SIGNATURE
   ═══════════════════════════════════════════════════════════════ */

/**
 * Read beatsPerBar and noteValue from their select elements, rebuild
 * the accent/sub-accent arrays, then refresh the beat grid and save.
 * Called by the config card selects and by preset buttons.
 */
function applyTimeSig() {
  beatsPerBar = +document.getElementById('beatsPerBar').value;
  noteValue = +document.getElementById('noteValue').value;
  // Grow accent array if bar got longer; trim if shorter
  while (accentLevels.length < beatsPerBar) accentLevels.push(1);
  accentLevels = accentLevels.slice(0, beatsPerBar);
  // Beat 1 is always at least a strong accent
  if (accentLevels[0] < 3) accentLevels[0] = 3;
  // Reset sub-accent array dimensions to match new bar length
  subAccentLevels = Array.from(
    { length: beatsPerBar },
    () => new Array(Math.max(0, subdivision - 1)).fill(1)
  );
  buildBeatGrid();
  updatePresetHighlight();
  saveAllPrefs();
  if (typeof updateBeatGridLabel === 'function') updateBeatGridLabel();
}

/**
 * Highlight the quick-preset button that matches the current time signature.
 * Called after any time-signature change.
 */
function updatePresetHighlight() {
  document.querySelectorAll('.preset-btn').forEach(b =>
    b.classList.toggle('active', +b.dataset.beats === beatsPerBar && +b.dataset.note === noteValue)
  );
}

// Quick-preset buttons in the config card — each sets both selects then applies
document.querySelectorAll('.preset-btn').forEach(btn =>
  btn.addEventListener('click', () => {
    document.getElementById('beatsPerBar').value = btn.dataset.beats;
    document.getElementById('noteValue').value = btn.dataset.note;
    applyTimeSig();
  })
);

/* ═══════════════════════════════════════════════════════════════
   SUBDIVISION
   ═══════════════════════════════════════════════════════════════ */

/**
 * Set the subdivision multiplier and rebuild the beat grid.
 * Also resets all sub-accent levels to 1 (no accent) for the new dimensions.
 * @param {number} val - Subdivision: 1=none, 2=8ths, 3=triplets, 4=16ths.
 */
function setSub(val) {
  subdivision = val;
  document.querySelectorAll('.sub-btn').forEach(b =>
    b.classList.toggle('active', +b.dataset.sub === val)
  );
  subAccentLevels = Array.from(
    { length: beatsPerBar },
    () => new Array(Math.max(0, subdivision - 1)).fill(1)
  );
  buildBeatGrid();
  saveAllPrefs();
}

/* ═══════════════════════════════════════════════════════════════
   PANEL CHIP TOGGLES
   ═══════════════════════════════════════════════════════════════ */

/**
 * Toggle the canvas pendulum arm visibility.
 * If showing and not playing, immediately draws the arm in the idle position.
 */
function toggleArm() {
  showArm = !showArm;
  document.getElementById('armChip').classList.toggle('active', showArm);
  document.getElementById('pendulumWrap').classList.toggle('hidden', !showArm);
  if (showArm && !isPlaying) {
    refreshThemeCache();
    requestAnimationFrame(drawPendulumIdle);
  }
  saveAllPrefs();
}

/**
 * Toggle the count-in feature (one bar of clicks before normal operation).
 */
function toggleCountIn() {
  countInEnabled = !countInEnabled;
  document.getElementById('countInChip').classList.toggle('active', countInEnabled);
  saveAllPrefs();
}

/**
 * Toggle the mute-bar training feature (alternates audible / silent bars).
 * Resets phase and counter and removes the dimming class when disabled.
 */
function toggleMuteBar() {
  muteBarEnabled = !muteBarEnabled;
  document.getElementById('muteBarChip').classList.toggle('active', muteBarEnabled);
  document.getElementById('muteStepper').style.display = muteBarEnabled ? 'flex' : 'none';
  if (!muteBarEnabled) {
    document.getElementById('beatGrid').classList.remove('muted');
    muteBarPhase = 'play';
    muteBarCounter = 0;
  }
  saveAllPrefs();
}

/**
 * Adjust the mute-bar count by a delta, clamped to [1, 8].
 * @param {number} d - Amount to add (positive or negative).
 */
function adjustMuteCount(d) {
  muteBarCount = Math.max(1, Math.min(8, muteBarCount + d));
  document.getElementById('muteCountVal').textContent = muteBarCount;
  saveAllPrefs();
}

/* ═══════════════════════════════════════════════════════════════
   SPEED TRAINER
   ═══════════════════════════════════════════════════════════════ */

/**
 * Toggle the speed-trainer panel on/off.
 * If disabled while a run is active, the run is stopped first.
 */
function toggleSpeedTrainer() {
  stEnabled = !stEnabled;
  document.getElementById('stEnableChip').classList.toggle('active', stEnabled);
  document.getElementById('stBody').classList.toggle('open', stEnabled);
  if (!stEnabled && stRunning) stopSpeedRun();
  saveAllPrefs();
}

/** Tracks the last BPM value sent to setBpm during a speed run to avoid
 *  redundant DOM updates on every scheduler tick. */
let lastSpeedTrainerBpm = null;

/**
 * Switch the speed-trainer timing mode (bars vs. minutes).
 * Updates button states, the duration unit label, and resets the duration input
 * to a sensible default for the new mode.
 * @param {string} m - 'bars' or 'minutes'.
 */
function setStMode(m) {
  stMode = m;
  document.getElementById('stModeBars').classList.toggle('active', m === 'bars');
  document.getElementById('stModeMinutes').classList.toggle('active', m === 'minutes');
  document.getElementById('stDurationUnit').textContent = m === 'bars' ? 'bars' : 'min';
  document.getElementById('stDuration').value = m === 'bars' ? 16 : 2;
  saveAllPrefs();
}

/**
 * Toggle a speed run: start if not running, stop if running.
 */
function toggleSpeedRun() {
  if (stRunning) stopSpeedRun();
  else startSpeedRun();
}

/**
 * Begin a speed run.
 * Reads UI values, computes total ramp duration in seconds, then starts the
 * metronome at the start BPM.  The ramp itself is applied on every beat tick
 * via updateSpeedTrainer().
 *
 * Duration calculation:
 *   - Bars mode:   total_seconds = barCount × beatsPerBar × (60 / avgBPM)
 *   - Minutes mode: total_seconds = minutes × 60
 */
function startSpeedRun() {
  stStartBpm = Math.max(20, Math.min(300, +document.getElementById('stStartBpm').value));
  stEndBpm   = Math.max(20, Math.min(300, +document.getElementById('stEndBpm').value));
  stDuration = Math.max(1, +document.getElementById('stDuration').value);

  if (stMode === 'minutes') {
    stTotalDuration = stDuration * 60;
  } else {
    // Estimate time using the arithmetic mean BPM to avoid over/under-shooting
    const avgBpm = (stStartBpm + stEndBpm) / 2;
    stTotalDuration = stDuration * beatsPerBar * 60 / avgBpm;
  }

  stStartTime = getCtx().currentTime;
  stRunning = true;
  setBpm(stStartBpm);
  document.getElementById('stStartBtn').textContent = '■ Stop';
  document.getElementById('stProgressWrap').style.display = 'block';
  document.getElementById('stProgressFill').style.width = '0%';
  if (!isPlaying) startMetronome();
}

/**
 * Stop the current speed run and reset the progress indicator.
 */
function stopSpeedRun() {
  stRunning = false;
  lastSpeedTrainerBpm = null;
  document.getElementById('stStartBtn').textContent = '▶ Start';
  document.getElementById('stProgressWrap').style.display = 'none';
  document.getElementById('stProgressFill').style.width = '0%';
}

/**
 * Called on every beat tick while a speed run is active.
 * Interpolates BPM linearly between stStartBpm and stEndBpm, updates the
 * progress bars, and stops the run when the ramp is complete.
 *
 * The BPM update is guarded behind a "last value" check so that setBpm
 * (which writes to the DOM) is only called when the integer value changes.
 */
function updateSpeedTrainer() {
  if (!stRunning) return;
  const elapsed  = getCtx().currentTime - stStartTime;
  const progress = Math.min(elapsed / stTotalDuration, 1);
  const newBpm   = Math.round(stStartBpm + (stEndBpm - stStartBpm) * progress);

  // Only update BPM (and thus the DOM) if the rounded value has changed
  if (newBpm !== lastSpeedTrainerBpm) {
    setBpm(newBpm);
    lastSpeedTrainerBpm = newBpm;
  }

  // Update the thin progress bar inside the Speed Trainer card body
  document.getElementById('stProgressFill').style.width = (progress * 100) + '%';

  // Update the shared progress-wrap bar shown in the card
  const spFill = document.getElementById('speedProgressFill');
  const spVal  = document.getElementById('speedProgressVal');
  if (spFill && spVal) {
    let pct = stStartBpm === stEndBpm
      ? 0
      : Math.round(((bpm - stStartBpm) / (stEndBpm - stStartBpm)) * 100);
    pct = Math.max(0, Math.min(100, pct));
    spFill.style.width = pct + '%';
    spVal.textContent  = pct + '%';
  }

  if (progress >= 1) stopSpeedRun();
}

/* ═══════════════════════════════════════════════════════════════
   CLICK RATE
   ═══════════════════════════════════════════════════════════════ */

/**
 * Set the click-rate multiplier and highlight the active rate button.
 * 0.5 = half-speed (clicks twice as slow), 1 = normal, 2 = double-speed.
 * @param {number} r - Click rate (0.5 | 1 | 2).
 */
function setClickRate(r) {
  clickRate = r;
  document.getElementById('rateHalf').classList.toggle('active', r === 0.5);
  document.getElementById('rateNormal').classList.toggle('active', r === 1);
  document.getElementById('rateDouble').classList.toggle('active', r === 2);
  saveAllPrefs();
}

/* ═══════════════════════════════════════════════════════════════
   BEAT GRID
   ═══════════════════════════════════════════════════════════════ */

/**
 * (Re)build the beat grid DOM from scratch based on current state.
 * Creates one .beat-cell per main beat, with optional subdivision dot columns
 * between each beat.  Each dot gets a data-accent attribute and a click
 * listener to cycle through accent levels.
 */
function buildBeatGrid() {
  const grid = document.getElementById('beatGrid');
  grid.innerHTML = '';

  for (let b = 0; b < beatsPerBar; b++) {
    // Vertical separator between beat groups (not before the first beat)
    if (b > 0) {
      const sep = document.createElement('div');
      sep.className = 'beat-sep';
      grid.appendChild(sep);
    }

    // Main beat cell + dot
    const cell = document.createElement('div');
    cell.className = 'beat-cell';

    const dot = document.createElement('div');
    const lvl = accentLevels[b] || 1;
    dot.className = 'beat-dot' + (lvl === 3 ? ' accent' : '');
    dot.dataset.beat = b;
    dot.dataset.accent = lvl;
    dot.id = 'beatDot_' + b;

    // Inner ring element (shown at 55% opacity for level 2 accents via CSS)
    const ring = document.createElement('div');
    ring.className = 'accent-ring';
    dot.appendChild(ring);

    dot.addEventListener('click', () => cycleAccent(b));
    cell.appendChild(dot);

    // Beat number label beneath the dot
    const num = document.createElement('div');
    num.className = 'beat-num';
    num.textContent = b + 1;
    cell.appendChild(num);
    grid.appendChild(cell);

    // Subdivision dots for this beat (1 dot per sub after the first)
    if (subdivision > 1) {
      // Ensure the sub-accent row exists for this beat
      if (!subAccentLevels[b] || subAccentLevels[b].length !== subdivision - 1) {
        subAccentLevels[b] = new Array(subdivision - 1).fill(1);
      }

      for (let s = 1; s < subdivision; s++) {
        // Shorter separator between beat and its subdivision dots
        const sep2 = document.createElement('div');
        sep2.className = 'beat-sep';
        sep2.style.height = '26px';
        grid.appendChild(sep2);

        const sc = document.createElement('div');
        sc.className = 'beat-cell';

        const sd = document.createElement('div');
        const subIdx = s - 1;
        const subLvl = subAccentLevels[b][subIdx] || 1;
        sd.className = 'beat-dot sub' + (subLvl === 3 ? ' accent' : '');
        sd.id = 'subDot_' + b + '_' + s;
        sd.dataset.accent = subLvl;

        const subRing = document.createElement('div');
        subRing.className = 'accent-ring';
        sd.appendChild(subRing);

        sd.addEventListener('click', () => cycleSubAccent(b, s - 1));
        sc.appendChild(sd);
        grid.appendChild(sc);
      }
    }
  }
}

/**
 * Cycle the accent level for a main beat dot through 1 → 2 → 3 → 1.
 * Updates the DOM element's data-accent and accent class, then saves.
 * @param {number} b - Zero-based beat index.
 */
function cycleAccent(b) {
  accentLevels[b] = (accentLevels[b] % 3) + 1;
  const dot = document.getElementById('beatDot_' + b);
  if (dot) {
    dot.dataset.accent = accentLevels[b];
    dot.classList.toggle('accent', accentLevels[b] === 3);
  }
  saveAllPrefs();
}

/**
 * Cycle the accent level for a subdivision dot through 1 → 2 → 3 → 1.
 * Updates the DOM element's data-accent and accent class, then saves.
 * @param {number} beat   - Zero-based beat index.
 * @param {number} subIdx - Zero-based subdivision index within that beat.
 */
function cycleSubAccent(beat, subIdx) {
  if (!subAccentLevels[beat]) subAccentLevels[beat] = new Array(subdivision - 1).fill(1);
  subAccentLevels[beat][subIdx] = (subAccentLevels[beat][subIdx] % 3) + 1;
  const lvl = subAccentLevels[beat][subIdx];
  const sd = document.getElementById('subDot_' + beat + '_' + (subIdx + 1));
  if (sd) {
    sd.dataset.accent = lvl;
    sd.classList.toggle('accent', lvl === 3);
  }
  saveAllPrefs();
}

/* ═══════════════════════════════════════════════════════════════
   LABEL UPDATERS
   ═══════════════════════════════════════════════════════════════ */

/**
 * Refresh all sound-related slider value labels in the UI.
 * Called on every slider input event and also on preset load.
 * Uses debouncedSave() to avoid thrashing localStorage during drag.
 */
function updateSoundLabel() {
  document.getElementById('volVal').textContent =
    document.getElementById('volSlider').value + '%';
  document.getElementById('brightVal').textContent =
    document.getElementById('brightSlider').value + '%';

  const ev = +document.getElementById('envSlider').value;
  const envDesc = ev < 25 ? 'Sharp' : ev < 50 ? 'Punchy' : ev < 75 ? 'Balanced' : 'Rounded';
  document.getElementById('envVal').textContent = ev + '% — ' + envDesc;

  document.getElementById('accentBoostVal').textContent =
    '+' + document.getElementById('accentBoostSlider').value + '%';

  debouncedSave();
}

/**
 * Refresh the swing slider value label with a descriptive name.
 * Called on slider input and on preset load.
 */
function updateSwingLabel() {
  const v = +document.getElementById('swingSlider').value;
  const desc = v === 0 ? 'Straight' : v < 20 ? 'Light' : v < 40 ? 'Shuffle' : v < 60 ? 'Swing' : 'Heavy swing';
  document.getElementById('swingVal').textContent = v + '% — ' + desc;
  debouncedSave();
}

// ── Convenience getters for current slider values ─────────────────────────────
/** @returns {number} Master volume as a 0–1 gain value. */
const getVol    = () => +document.getElementById('volSlider').value / 100;

/** @returns {number} Brightness as a 0–1 normalised value. */
const getBright = () => +document.getElementById('brightSlider').value / 100;

/** @returns {number} Envelope decay length as a 0–1 normalised value. */
const getEnv    = () => +document.getElementById('envSlider').value / 100;

/** @returns {number} Accent boost fraction (0 = no boost, 1 = +100%). */
const getBoost  = () => +document.getElementById('accentBoostSlider').value / 100;

/** @returns {number} Swing amount as a 0–0.75 fraction. */
const getSwing  = () => +document.getElementById('swingSlider').value / 100;

/** @returns {number} Current click-rate multiplier (0.5 | 1 | 2). */
const getRate   = () => clickRate;

/* ═══════════════════════════════════════════════════════════════
   CLICK SYNTHESIS — Web Audio
   ═══════════════════════════════════════════════════════════════ */

/**
 * Synthesise and schedule a metronome click at the given AudioContext time.
 *
 * Architecture:
 *   Noise source → bandpass filter → noise gain → master out
 *   Oscillator   → oscillator gain → master out
 *
 * The oscillator provides the pitched "body" and the filtered noise gives
 * the percussive attack transient.  Brightness controls the centre frequency
 * of both; envelope controls the decay time.  Accent boost raises gain for
 * beats with accent level 2 or 3.  Subdivision clicks are attenuated further
 * and pitched lower than main beats.
 *
 * @param {number}  time        - AudioContext scheduled start time (seconds).
 * @param {number}  accentLevel - 1 (normal), 2 (medium), or 3 (strong).
 * @param {boolean} isSub       - True if this is a subdivision click.
 */
function playClick(time, accentLevel, isSub) {
  const ctx    = getCtx();
  const bright = getBright();
  const env    = getEnv();
  const boost  = getBoost();

  // Apply accent boost: level 3 = full boost, level 2 = half boost, level 1 = none
  let gain = getVol();
  if (accentLevel === 3)      gain *= (1 + boost);
  else if (accentLevel === 2) gain *= (1 + boost * 0.5);

  // Subdivisions are softer than main beats; loud only when explicitly accented
  if (isSub) gain *= (accentLevel === 3 ? 1.0 : accentLevel === 2 ? 0.7 : 0.4);

  // Hard-limit to avoid clipping at the destination
  gain = Math.min(gain, 1.0);

  // Frequency mapping: 400 Hz (woody thud) → 2600 Hz (crisp tick)
  // Accent level raises the base frequency for perceptual brightness difference
  let freq;
  if (accentLevel === 3)      freq = 900  + bright * 1700;
  else if (accentLevel === 2) freq = 600  + bright * 1400;
  else                        freq = 400  + bright * 1200;
  // Subdivision clicks pitched down so they are less intrusive than main beats
  if (isSub) freq *= 0.62;

  // Envelope: env=0 → very short (0.008 s body, 0.006 s noise),
  //           env=1 → longer (0.18 s body, 0.061 s noise)
  const decay  = 0.008 + env * 0.172;  // oscillator amplitude decay time
  const nDecay = 0.006 + env * 0.055;  // noise amplitude decay time

  // Buffer for the noise burst — length scales with envelope setting
  const bsize = Math.ceil(ctx.sampleRate * (0.008 + env * 0.065));
  const buf   = ctx.createBuffer(1, bsize, ctx.sampleRate);
  const data  = buf.getChannelData(0);
  // Exponentially-decaying white noise
  const tc = bsize * (0.06 + env * 0.25);
  for (let i = 0; i < bsize; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / tc);

  // ── Noise path ──────────────────────────────────────────────────────────────
  const noise = ctx.createBufferSource();
  noise.buffer = buf;

  // Bandpass filter shapes the noise spectrum to match the click pitch
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = freq;
  // Wider Q at lower brightness for a warmer sound; narrower at high brightness for crispness
  bp.Q.value = 1.2 + (1 - bright) * 5;

  // ── Oscillator path ─────────────────────────────────────────────────────────
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  // Pitch-slide from ~freq to a lower partial to simulate a plucked membrane
  osc.frequency.setValueAtTime(freq * 0.9, time);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.22, time + decay);

  // ── Gain envelopes ──────────────────────────────────────────────────────────
  const gN     = ctx.createGain();
  const gO     = ctx.createGain();
  const master = ctx.createGain();

  gN.gain.setValueAtTime(gain * 0.75, time);
  gN.gain.exponentialRampToValueAtTime(0.0001, time + nDecay + 0.005);

  gO.gain.setValueAtTime(gain * 0.55, time);
  gO.gain.exponentialRampToValueAtTime(0.0001, time + decay);

  master.gain.value = 1;

  // ── Graph connections ────────────────────────────────────────────────────────
  noise.connect(bp);   bp.connect(gN);  gN.connect(master);
  osc.connect(gO);                      gO.connect(master);
  master.connect(ctx.destination);

  // ── Schedule playback ────────────────────────────────────────────────────────
  const end = time + Math.max(nDecay + 0.01, decay + 0.01);
  noise.start(time); noise.stop(end);
  osc.start(time);   osc.stop(end);
}

/* ═══════════════════════════════════════════════════════════════
   SCHEDULER LOOP
   ═══════════════════════════════════════════════════════════════ */

/**
 * Main scheduler loop — called every LOOK_MS milliseconds by setInterval.
 * Pushes notes onto the AudioContext timeline as long as they fall within
 * the lookahead window [now, now + SCHED_AHEAD].
 */
function scheduler() {
  const ctx = getCtx();
  while (nextNoteTime < ctx.currentTime + SCHED_AHEAD) {
    scheduleNote(currentBeatInBar, currentSubDiv, nextNoteTime);
    advance();
  }
}

/**
 * Schedule a single note (audio + deferred visual callback) for a given
 * beat/subdivision position at the specified AudioContext time.
 *
 * Handles special cases:
 *   - Count-in: plays audio but suppresses visuals; decrements countInRemaining.
 *   - Mute-bar: skips audio (but not visuals) when muteBarPhase === 'mute'.
 *   - Subdivision sound toggle: suppresses sub-beat audio when unchecked.
 *
 * @param {number} beat - Zero-based beat index within the bar.
 * @param {number} sub  - Zero-based subdivision index within the beat.
 * @param {number} time - AudioContext scheduled time (seconds).
 */
function scheduleNote(beat, sub, time) {
  const isSub = sub > 0;

  // Determine accent level for this position
  const level = isSub
    ? (subAccentLevels[beat] ? subAccentLevels[beat][sub - 1] || 1 : 1)
    : accentLevels[beat];

  // ── Count-in handling ──────────────────────────────────────────────────────
  // During the count-in bar, only main beats are clicked (no subs) and
  // visuals are suppressed.  Once the count reaches 0, normal playback begins.
  if (countInRemaining > 0) {
    if (!isSub) {
      playClick(time, level, false);
      countInRemaining--;
      if (countInRemaining > 0) {
        document.getElementById('tempoName').textContent = 'Count-in…';
      } else {
        document.getElementById('tempoName').textContent = getTempoName(bpm);
        // Fresh mute-bar state so the first "real" bar is audible
        muteBarPhase = 'play';
        muteBarCounter = 0;
        document.getElementById('beatGrid').classList.remove('muted');
        // Re-anchor the speed-trainer clock to exclude count-in time
        if (typeof stRunning !== 'undefined' && stRunning && typeof stStartTime !== 'undefined') {
          stStartTime = getCtx().currentTime;
        }
      }
    }
    return; // Skip visual for all count-in beats/subs
  }

  // ── Mute-bar handling ──────────────────────────────────────────────────────
  // Audio is suppressed during the mute phase; visuals still animate so the
  // user can verify their internal sense of pulse.
  const muted = muteBarEnabled && muteBarPhase === 'mute';
  if (!muted) {
    // Main beats always play; subdivisions only if the sub-sound toggle is on
    if (!isSub || document.getElementById('subSoundToggle').checked) {
      playClick(time, level, isSub);
    }
  }

  // Post a visual callback deferred to fire at the scheduled audio time
  const delay = (time - getCtx().currentTime) * 1000;
  setTimeout(() => visualTick(beat, sub, isSub), Math.max(0, delay));
}

/**
 * Advance the scheduler state (beat/sub counters and nextNoteTime) by one step.
 *
 * Swing redistribution:
 *   For even subdivisions (8ths, 16ths) with swing > 0, the pair of
 *   subdivision slots is time-stretched so the first is longer and the second
 *   is shorter, while their combined duration still equals exactly 2 × sps.
 *   This preserves the bar length and overall tempo while adding a shuffle feel.
 *
 *   Formula: interval = sps ± (sps × swingFraction)
 *   where even slots get +extra and odd slots get -extra.
 */
function advance() {
  const rate  = getRate();
  const swing = getSwing();

  // Update the speed trainer's BPM ramp on every main-beat advance (after count-in)
  if (stRunning && countInRemaining <= 0) updateSpeedTrainer();

  // Seconds per beat, adjusted by click rate
  const spb = (60 / bpm) / rate;
  // Seconds per subdivision slot
  const sps = spb / subdivision;

  // Swing: stretch/compress alternate subdivision pairs
  let interval = sps;
  if (subdivision >= 2 && subdivision % 2 === 0 && swing > 0) {
    const extra = sps * swing;
    if (currentSubDiv % 2 === 0) {
      // First of the pair — delay the arrival of the off-beat
      interval = sps + extra;
    } else {
      // Second of the pair — arrive earlier to compensate
      interval = sps - extra;
    }
  }

  nextNoteTime += interval;
  currentSubDiv++;

  if (currentSubDiv >= subdivision) {
    currentSubDiv = 0;
    currentBeatInBar++;

    if (currentBeatInBar >= beatsPerBar) {
      currentBeatInBar = 0;

      // ── Mute-bar: track bar boundaries and toggle phase ──────────────────
      // Each completed bar increments the counter; when it reaches muteBarCount
      // the phase flips between 'play' and 'mute'.
      if (muteBarEnabled && countInRemaining <= 0) {
        muteBarCounter++;
        if (muteBarCounter >= muteBarCount) {
          muteBarCounter = 0;
          muteBarPhase = muteBarPhase === 'play' ? 'mute' : 'play';
          document.getElementById('beatGrid').classList.toggle('muted', muteBarPhase === 'mute');
        }
      }
    }
  }
}

/* ═══════════════════════════════════════════════════════════════
   VISUAL TICK — DOM animation driven by deferred setTimeout
   ═══════════════════════════════════════════════════════════════ */

/** Reference to the beat-dot element that last received .active-beat,
 *  so it can be de-highlighted on the next tick. */
let lastDot = null;

/** Reference to the sub-dot element that last received .active-sub. */
let lastSubDot = null;

/**
 * Called by a deferred setTimeout to update the beat visualiser at the
 * moment a scheduled note fires.
 *
 * For main beats (isSub === false):
 *   - Removes .active-beat from the previous dot (with .flash-out transition).
 *   - Adds .active-beat to the current dot.
 *   - Advances the position bar fill width.
 *   - Triggers a pendulum swing.
 *   - Briefly shows the full-screen beat flash on beat 1.
 *
 * For subdivision beats (isSub === true):
 *   - Removes .active-sub from the previous sub-dot.
 *   - Adds .active-sub to the current sub-dot.
 *
 * @param {number}  beat  - Zero-based beat index.
 * @param {number}  sub   - Zero-based subdivision index (0 for main beats).
 * @param {boolean} isSub - Whether this is a subdivision (not a main beat).
 */
function visualTick(beat, sub, isSub) {
  if (!isPlaying) return;

  if (!isSub) {
    // ── Remove previous beat highlight ──────────────────────────────────────
    if (lastDot) {
      // .flash-out enables a CSS transition that eases the dot back to rest size
      lastDot.classList.add('flash-out');
      lastDot.classList.remove('active-beat');
      const prev = lastDot;
      setTimeout(() => prev.classList.remove('flash-out'), 200);
    }

    // ── Highlight current beat dot ───────────────────────────────────────────
    const dot = document.getElementById('beatDot_' + beat);
    if (dot) { dot.classList.add('active-beat'); lastDot = dot; }

    // ── Position bar ─────────────────────────────────────────────────────────
    // On beat 1 (beat === 0): snap width to 0 in the same frame, then
    // re-enable the CSS transition and set width to 1/N of the bar.
    // This prevents a jarring backwards animation at bar boundaries.
    const bar = document.getElementById('positionFill');
    if (beat === 0) {
      bar.style.transition = 'none';
      bar.style.width = '0%';
      requestAnimationFrame(() => requestAnimationFrame(() => {
        bar.style.transition = 'width .04s linear';
        bar.style.width = ((1 / beatsPerBar) * 100) + '%';
      }));
    } else {
      bar.style.width = ((beat + 1) / beatsPerBar * 100) + '%';
    }

    // ── Pendulum swing ───────────────────────────────────────────────────────
    startPendulumSwing(beat);

    // ── Beat 1 screen flash ──────────────────────────────────────────────────
    if (beat === 0 && document.getElementById('flashToggle').checked) {
      const fl = document.getElementById('beatFlash');
      fl.classList.add('flash');
      setTimeout(() => fl.classList.remove('flash'), 90);
    }
  } else {
    // ── Subdivision highlight ────────────────────────────────────────────────
    if (lastSubDot) lastSubDot.classList.remove('active-sub');
    const sd = document.getElementById('subDot_' + beat + '_' + sub);
    if (sd) { sd.classList.add('active-sub'); lastSubDot = sd; }
  }
}

/* ═══════════════════════════════════════════════════════════════
   PENDULUM (canvas-based)
   ═══════════════════════════════════════════════════════════════ */
/*
 * The pendulum is drawn on a <canvas> element.  The arm pivots at the top
 * centre and swings ±PEND_MAX degrees.  Alternate beats trigger swings to
 * opposite sides (even → right, odd → left) so the arm oscillates.
 *
 * The animation uses requestAnimationFrame with an ease-in-out function to
 * mimic natural pendulum physics (slower near the extremes, faster at centre).
 *
 * Colour tokens are read from computed CSS custom properties and cached in
 * _themeCache to avoid layout-thrashing on every animation frame.  The cache
 * is invalidated on theme switch and on initial load.
 */

/**
 * Trigger a new pendulum swing animation toward the target side for beat b.
 * Even beats swing right (+PEND_MAX), odd beats swing left (−PEND_MAX).
 * If an animation is already running it is allowed to continue — the next
 * rAF call will re-evaluate pFrom from the current angle.
 * @param {number} beat - Zero-based beat index.
 */
function startPendulumSwing(beat) {
  const goRight = (beat % 2 === 0);
  pFrom = pAngle;
  pTo   = goRight ? PEND_MAX : -PEND_MAX;
  const rate = getRate();
  // Swing duration equals one beat duration so it arrives just as the next beat fires
  pSwingDur  = (60000 / bpm) / rate;
  pSwingStart = null;
  if (!pAnimFrame) pAnimFrame = requestAnimationFrame(animPendulum);
}

/**
 * requestAnimationFrame callback for the pendulum animation.
 * Computes an eased position between pFrom and pTo, draws the pendulum,
 * and reschedules itself until t reaches 1.
 * @param {DOMHighResTimeStamp} ts - Timestamp from rAF.
 */
function animPendulum(ts) {
  pAnimFrame = null;
  if (!isPlaying) return;
  if (pSwingStart === null) pSwingStart = ts;
  const t = Math.min((ts - pSwingStart) / pSwingDur, 1);
  // Cosine ease-in-out: slow start, fast middle, slow end (natural pendulum feel)
  const ease = -(Math.cos(Math.PI * t) - 1) / 2;
  pAngle = pFrom + (pTo - pFrom) * ease;
  drawPendulum(pAngle);
  if (t < 1) pAnimFrame = requestAnimationFrame(animPendulum);
}

/**
 * Read a CSS custom property value from the document root.
 * @param {string} v - CSS variable name including '--' prefix.
 * @returns {string} Trimmed value string.
 */
function getThemeColor(v) {
  return getComputedStyle(document.documentElement).getPropertyValue(v).trim() || '#888';
}

/** Cache of resolved CSS colour tokens for the pendulum canvas draw calls. */
let _themeCache = {};

/**
 * Refresh the theme colour cache by reading computed CSS custom properties.
 * Must be called after any theme change and before the first draw.
 */
function refreshThemeCache() {
  _themeCache = {
    accent: getThemeColor('--pendulum'),
    border: getThemeColor('--border'),
    surf:   getThemeColor('--surface2'),
    muted:  getThemeColor('--muted'),
  };
}

/**
 * Draw the pendulum arm and bob at the given angle.
 * Handles HiDPI displays by scaling the canvas context by devicePixelRatio.
 * Draws:
 *   1. A dashed arc guide spanning the swing range.
 *   2. The arm from the pivot to the bob tip.
 *   3. An outer circle (bob) with a fill and accent-coloured stroke.
 *   4. A small centre pip on the bob.
 *   5. A pivot cap circle at the top.
 *
 * @param {number} angleDeg - Current pendulum angle in degrees (0 = vertical).
 */
function drawPendulum(angleDeg) {
  if (!showArm) return;
  const canvas = document.getElementById('pendulumCanvas');
  if (!canvas || !canvas.parentElement) return;

  const W   = canvas.parentElement.clientWidth || 300;
  const H   = 120;
  const DPR = window.devicePixelRatio || 1;

  // Resize canvas backing store to match DPR (only when dimensions change)
  if (canvas.width !== W * DPR || canvas.height !== H * DPR) {
    canvas.width  = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
  }

  const c = canvas.getContext('2d');
  c.setTransform(DPR, 0, 0, DPR, 0, 0);
  c.clearRect(0, 0, W, H);

  const { accent, border, surf } = _themeCache;
  const pivotX = W / 2;
  const pivotY = 12;
  const armLen = H - 30;

  // Convert angle to radians and compute bob tip coordinates
  const rad  = angleDeg * Math.PI / 180;
  const tipX = pivotX + Math.sin(rad) * armLen;
  const tipY = pivotY + Math.cos(rad) * armLen;

  // ── Dashed arc guide ──────────────────────────────────────────────────────
  // Spans slightly wider than the swing range for visual reference
  const arcR  = armLen;
  const arcA1 = (90 - PEND_MAX - 3) * Math.PI / 180;
  const arcA2 = (90 + PEND_MAX + 3) * Math.PI / 180;
  c.beginPath();
  c.arc(pivotX, pivotY, arcR, arcA1, arcA2);
  c.strokeStyle = border;
  c.lineWidth = 1.2;
  c.setLineDash([3, 6]);
  c.stroke();
  c.setLineDash([]);

  // ── Pendulum arm ──────────────────────────────────────────────────────────
  c.beginPath();
  c.moveTo(pivotX, pivotY);
  c.lineTo(tipX, tipY);
  c.strokeStyle = accent;
  c.lineWidth   = 2.5;
  c.lineCap     = 'round';
  c.stroke();

  // ── Bob (outer circle) ────────────────────────────────────────────────────
  const bobR = 11;
  c.beginPath();
  c.arc(tipX, tipY, bobR, 0, Math.PI * 2);
  c.fillStyle   = surf;
  c.strokeStyle = accent;
  c.lineWidth   = 2.2;
  c.fill();
  c.stroke();

  // ── Bob inner pip ─────────────────────────────────────────────────────────
  c.beginPath();
  c.arc(tipX, tipY, 4.5, 0, Math.PI * 2);
  c.fillStyle = accent;
  c.fill();

  // ── Pivot cap ─────────────────────────────────────────────────────────────
  c.beginPath();
  c.arc(pivotX, pivotY, 5, 0, Math.PI * 2);
  c.fillStyle = accent;
  c.fill();
}

/**
 * Draw the pendulum in its vertical (idle) resting position.
 * Used when the arm is visible but the metronome is stopped.
 */
function drawPendulumIdle() {
  if (showArm) drawPendulum(0);
}

/* ═══════════════════════════════════════════════════════════════
   DEBOUNCED SAVE HELPER
   ═══════════════════════════════════════════════════════════════ */

/** Timer handle for the debounced save. */
let _saveTimer = null;

/**
 * Debounced save — waits 300 ms after the last call before writing to
 * localStorage.  Used by slider oninput handlers to avoid hammering storage
 * on every pixel of drag movement.
 */
function debouncedSave() {
  clearTimeout(_saveTimer);
  _saveTimer = setTimeout(saveAllPrefs, 300);
}

/* ═══════════════════════════════════════════════════════════════
   PLAY / STOP
   ═══════════════════════════════════════════════════════════════ */

/**
 * Toggle playback: stop if playing, start if stopped.
 */
function togglePlay() {
  if (isPlaying) stopMetronome(); else startMetronome();
}

/**
 * Start the metronome.
 * Resumes the AudioContext (required after a user gesture on some browsers),
 * resets bar/beat counters, optionally kicks off a count-in, then starts the
 * scheduler interval.
 */
function startMetronome() {
  isPlaying = true;
  getCtx().resume();
  currentBeatInBar = 0;
  currentSubDiv    = 0;

  // Count-in: arm the counter so scheduleNote() suppresses visuals
  if (countInEnabled) {
    countInRemaining = beatsPerBar;
    document.getElementById('tempoName').textContent = 'Count-in…';
  }

  // Fresh mute-bar state on each start
  muteBarPhase   = 'play';
  muteBarCounter = 0;
  document.getElementById('beatGrid').classList.remove('muted');

  // Offset first note slightly into the future to give the scheduler a head-start
  nextNoteTime = getCtx().currentTime + 0.05;

  // Start the scheduler loop
  schedulerTimer = setInterval(scheduler, LOOK_MS);

  document.getElementById('playBtn').textContent = '■';

  // Reset pendulum to starting position (left extreme) and prime the theme cache
  pAngle = -PEND_MAX;
  pFrom  = -PEND_MAX;
  refreshThemeCache();
}

/**
 * Stop the metronome.
 * Clears the scheduler interval, cancels any pending pendulum animation,
 * removes all beat-dot highlight classes, and resets the position bar.
 */
function stopMetronome() {
  isPlaying = false;
  clearInterval(schedulerTimer);
  schedulerTimer = null;

  // Cancel any in-flight pendulum animation frame
  if (pAnimFrame) { cancelAnimationFrame(pAnimFrame); pAnimFrame = null; }

  document.getElementById('playBtn').textContent = '▶';

  // Remove all beat visualisation state
  document.querySelectorAll('.beat-dot').forEach(d =>
    d.classList.remove('active-beat', 'active-sub', 'flash-out')
  );
  const bar = document.getElementById('positionFill');
  bar.style.transition = 'none';
  bar.style.width = '0%';

  lastDot    = null;
  lastSubDot = null;
  pAngle     = 0;

  // Reset count-in and display the static tempo name
  countInRemaining = 0;
  document.getElementById('tempoName').textContent = getTempoName(bpm);

  // Reset mute-bar visual state
  muteBarPhase   = 'play';
  muteBarCounter = 0;
  document.getElementById('beatGrid').classList.remove('muted');

  // Stop speed trainer run if active
  if (stRunning) stopSpeedRun();

  // Redraw pendulum in idle position with refreshed colours
  requestAnimationFrame(() => { refreshThemeCache(); drawPendulumIdle(); });
}

/* ═══════════════════════════════════════════════════════════════
   SAVE / LOAD ALL PREFERENCES
   ═══════════════════════════════════════════════════════════════ */

/**
 * Persist the entire current metronome state to localStorage.
 * Called after any significant change that should survive a page reload.
 */
function saveAllPrefs() {
  savePref('bpm', bpm);
  savePref('beatsPerBar', beatsPerBar);
  savePref('noteValue', noteValue);
  savePref('subdivision', subdivision);
  savePref('accentLevels', accentLevels);
  savePref('subAccentLevels', subAccentLevels);
  savePref('vol',         document.getElementById('volSlider').value);
  savePref('bright',      document.getElementById('brightSlider').value);
  savePref('env',         document.getElementById('envSlider').value);
  savePref('accentBoost', document.getElementById('accentBoostSlider').value);
  savePref('swing',       document.getElementById('swingSlider').value);
  savePref('clickRate',   clickRate);
  savePref('flashOn',     document.getElementById('flashToggle').checked);
  savePref('subSoundOn',  document.getElementById('subSoundToggle').checked);
  savePref('showArm',     showArm);
  // Count-in
  savePref('countInEnabled', countInEnabled);
  // Mute-bar
  savePref('muteBarEnabled', muteBarEnabled);
  savePref('muteBarCount',   muteBarCount);
  // Speed trainer (settings only — running state is not persisted)
  savePref('stEnabled',  stEnabled);
  savePref('stMode',     stMode);
  savePref('stStartBpm', +document.getElementById('stStartBpm').value);
  savePref('stEndBpm',   +document.getElementById('stEndBpm').value);
  savePref('stDuration', +document.getElementById('stDuration').value);
}

/**
 * Reset every setting to its factory default and save.
 * Stops any active playback and speed run first.
 */
function resetAll() {
  stopMetronome();

  // Reset state variables
  bpm = 120; beatsPerBar = 4; noteValue = 4; subdivision = 1;
  accentLevels    = [3, 1, 1, 1];
  subAccentLevels = [];
  showArm    = false;
  clickRate  = 1;

  // Reset count-in
  countInEnabled   = false;
  countInRemaining = 0;
  document.getElementById('countInChip').classList.remove('active');

  // Reset mute-bar
  muteBarEnabled = false; muteBarCount = 2;
  muteBarPhase = 'play'; muteBarCounter = 0;
  document.getElementById('muteBarChip').classList.remove('active');
  document.getElementById('muteStepper').style.display = 'none';
  document.getElementById('muteCountVal').textContent = '2';
  document.getElementById('beatGrid').classList.remove('muted');

  // Reset speed trainer
  stEnabled = false; stRunning = false; stMode = 'bars';
  document.getElementById('stEnableChip').classList.remove('active');
  document.getElementById('stBody').classList.remove('open');
  document.getElementById('stStartBpm').value  = 100;
  document.getElementById('stEndBpm').value    = 120;
  document.getElementById('stDuration').value  = 16;
  document.getElementById('stStartBtn').textContent = '▶ Start';
  document.getElementById('stProgressWrap').style.display = 'none';
  setStMode('bars');

  // Reset sliders and checkboxes to default values
  setBpm(120);
  document.getElementById('beatsPerBar').value = 4;
  document.getElementById('noteValue').value   = 4;
  document.getElementById('volSlider').value   = 80;
  document.getElementById('brightSlider').value= 50;
  document.getElementById('envSlider').value   = 50;
  document.getElementById('accentBoostSlider').value = 50;
  document.getElementById('swingSlider').value = 0;
  document.getElementById('flashToggle').checked    = true;
  document.getElementById('subSoundToggle').checked = true;
  document.getElementById('armChip').classList.remove('active');
  document.getElementById('pendulumWrap').classList.add('hidden');

  setClickRate(1);
  updateSoundLabel();
  updateSwingLabel();
  setSub(1);
  applyTimeSig();
  updatePresetHighlight();
  saveAllPrefs();
}

/**
 * Restore all settings from localStorage and apply them to the UI and state.
 * Called once at page load.  Applies mode first so CSS variables are resolved
 * before any canvas draws.
 */
function restoreSettings() {
  const p = loadPrefs();

  // 1. Mode — must come first so CSS custom properties resolve correctly
  applyMode(p.mode || 'light', true);

  // 2. Scalar state
  if (p.bpm) setBpm(p.bpm);
  if (p.beatsPerBar) {
    beatsPerBar = +p.beatsPerBar;
    document.getElementById('beatsPerBar').value = beatsPerBar;
  }
  if (p.noteValue) {
    noteValue = +p.noteValue;
    document.getElementById('noteValue').value = noteValue;
  }
  if (p.subdivision) {
    subdivision = +p.subdivision;
    document.querySelectorAll('.sub-btn').forEach(b =>
      b.classList.toggle('active', +b.dataset.sub === subdivision)
    );
  }

  // 3. Accent levels — validate array length against restored beatsPerBar
  if (p.accentLevels && Array.isArray(p.accentLevels) && p.accentLevels.length === beatsPerBar) {
    accentLevels = p.accentLevels;
  } else {
    accentLevels = Array.from({ length: beatsPerBar }, (_, i) => i === 0 ? 3 : 1);
  }

  // 3b. Sub-beat accent levels — validate both dimensions and clamp values to [1,3]
  const subLen = Math.max(0, subdivision - 1);
  if (
    p.subAccentLevels &&
    Array.isArray(p.subAccentLevels) &&
    p.subAccentLevels.length === beatsPerBar &&
    p.subAccentLevels.every(a => Array.isArray(a) && a.length === subLen)
  ) {
    subAccentLevels = p.subAccentLevels.map(row =>
      row.map(v => {
        let n = parseInt(v, 10);
        if (isNaN(n)) n = 1;
        if (n < 1) n = 1;
        else if (n > 3) n = 3;
        return n;
      })
    );
  } else {
    subAccentLevels = Array.from({ length: beatsPerBar }, () => new Array(subLen).fill(1));
  }

  // 4. Sound sliders
  if (p.vol != null)         document.getElementById('volSlider').value = p.vol;
  if (p.bright != null)      document.getElementById('brightSlider').value = p.bright;
  if (p.env != null)         document.getElementById('envSlider').value = p.env;
  if (p.accentBoost != null) document.getElementById('accentBoostSlider').value = p.accentBoost;
  if (p.swing != null)       document.getElementById('swingSlider').value = p.swing;

  // 5. Panel chips
  if (p.clickRate) setClickRate(+p.clickRate);
  if (p.showArm !== undefined) {
    showArm = p.showArm;
    document.getElementById('armChip').classList.toggle('active', showArm);
    document.getElementById('pendulumWrap').classList.toggle('hidden', !showArm);
  }

  // 6. Checkboxes
  if (p.flashOn !== undefined)    document.getElementById('flashToggle').checked = p.flashOn;
  if (p.subSoundOn !== undefined) document.getElementById('subSoundToggle').checked = p.subSoundOn;

  // 6b. Count-in
  if (p.countInEnabled !== undefined) {
    countInEnabled = p.countInEnabled;
    document.getElementById('countInChip').classList.toggle('active', countInEnabled);
  }

  // 6c. Mute-bar
  if (p.muteBarEnabled !== undefined) {
    muteBarEnabled = p.muteBarEnabled;
    document.getElementById('muteBarChip').classList.toggle('active', muteBarEnabled);
    document.getElementById('muteStepper').style.display = muteBarEnabled ? 'flex' : 'none';
  }
  if (p.muteBarCount != null) {
    muteBarCount = Math.max(1, Math.min(8, +p.muteBarCount));
    document.getElementById('muteCountVal').textContent = muteBarCount;
  }

  // 6d. Speed trainer
  if (p.stEnabled !== undefined) {
    stEnabled = p.stEnabled;
    document.getElementById('stEnableChip').classList.toggle('active', stEnabled);
    document.getElementById('stBody').classList.toggle('open', stEnabled);
  }
  if (p.stMode)     setStMode(p.stMode);
  if (p.stStartBpm != null) document.getElementById('stStartBpm').value = p.stStartBpm;
  if (p.stEndBpm   != null) document.getElementById('stEndBpm').value   = p.stEndBpm;
  if (p.stDuration != null) document.getElementById('stDuration').value = p.stDuration;

  // 7. Rebuild derived UI
  updateSoundLabel();
  updateSwingLabel();
  updatePresetHighlight();
  buildBeatGrid();

  // 7b. Sync time-sig segment buttons in the main card compact row
  document.querySelectorAll('.timesig-seg-btn').forEach(b => {
    b.classList.toggle('active', +b.dataset.beats === beatsPerBar && +b.dataset.note === noteValue);
  });
  updateBeatGridLabel();

  // 8. Draw pendulum after a rAF so CSS variables are guaranteed to have resolved
  requestAnimationFrame(() => { refreshThemeCache(); drawPendulumIdle(); });
}

/* ═══════════════════════════════════════════════════════════════
   TIME SIG PRESET BUTTONS (main card compact row)
   ═══════════════════════════════════════════════════════════════ */

/**
 * Apply a time-signature from one of the compact preset buttons in the visual
 * card (3/4, 4/4, 6/8, 5/4).  Syncs the config card selects, calls applyTimeSig(),
 * and updates the beat-grid label.
 * @param {HTMLButtonElement} btn - The button that was clicked.
 */
function applyTimeSigPreset(btn) {
  document.querySelectorAll('.timesig-seg-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const beatsEl = document.getElementById('beatsPerBar');
  const noteEl  = document.getElementById('noteValue');
  if (beatsEl) beatsEl.value = btn.dataset.beats;
  if (noteEl)  noteEl.value  = btn.dataset.note;
  applyTimeSig();
  updateBeatGridLabel();
}

/**
 * Update the small text label above the beat grid to show the current time
 * signature (e.g. "4/4 · click to set accent").
 */
function updateBeatGridLabel() {
  const lbl = document.getElementById('beatGridLabel');
  if (!lbl) return;
  lbl.textContent = beatsPerBar + '/' + (noteValue || 4) + ' · click to set accent';
}

/* ═══════════════════════════════════════════════════════════════
   KEYBOARD SHORTCUTS
   ═══════════════════════════════════════════════════════════════ */

/**
 * Global keydown handler.
 * Ignored when focus is inside an input or select so typing values works normally.
 *
 * Bindings:
 *   Space      — play / stop
 *   Escape     — exit preset save mode (if active)
 *   ArrowUp    — BPM +1
 *   ArrowDown  — BPM −1
 *   ArrowRight — BPM +5
 *   ArrowLeft  — BPM −5
 *   T          — tap tempo
 */
document.addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
  if (e.code === 'Space')      { e.preventDefault(); togglePlay(); }
  if (e.code === 'Escape' && presetSaveMode) { exitSaveMode(); return; }
  if (e.code === 'ArrowUp')    adjustBpm(1);
  if (e.code === 'ArrowDown')  adjustBpm(-1);
  if (e.code === 'ArrowRight') adjustBpm(5);
  if (e.code === 'ArrowLeft')  adjustBpm(-5);
  if (e.code === 'KeyT')       tapTempo();
});

/* ═══════════════════════════════════════════════════════════════
   WINDOW RESIZE HANDLER
   ═══════════════════════════════════════════════════════════════ */

/**
 * Redraw the idle pendulum when the window is resized so the canvas
 * stays correctly scaled to its new parent width.
 */
window.addEventListener('resize', () => {
  if (!isPlaying && showArm) {
    refreshThemeCache();
    requestAnimationFrame(drawPendulumIdle);
  }
});

/* ═══════════════════════════════════════════════════════════════
   INITIALISATION
   ═══════════════════════════════════════════════════════════════ */

// Prime the theme colour cache before any canvas draw (drawPendulumIdle is
// called inside restoreSettings after the first rAF).
refreshThemeCache();

// Restore all persisted settings and build the initial beat grid.
restoreSettings();
