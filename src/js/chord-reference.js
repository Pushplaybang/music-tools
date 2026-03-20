/**
 * chord-reference.js
 *
 * Tool:        Chord & Scale Reference
 * Description: Interactive reference tool for chord voicings, scale degrees,
 *              guitar diagrams, and diatonic harmony. Renders an interactive
 *              piano keyboard and guitar fretboard / chord diagrams using the
 *              Web Audio API for playback.
 * LS Key:      musicTool_chordRef_v1
 *
 * Dependencies: music-tools.css, chord-reference.css (styles)
 *               No runtime JS dependencies — vanilla ES5/ES6.
 */

/* ═══ PERSISTENCE ═══ */

/** Unique localStorage key for this tool. Bump suffix on breaking schema changes. */
const LS_KEY = 'musicTool_chordRef_v1';

/**
 * Persist a single preference value under the tool's LS namespace.
 * Merges with existing preferences so unrelated keys are not overwritten.
 *
 * @param {string} key - Preference key (e.g. 'chordRoot').
 * @param {*}      val - Serialisable value to store.
 */
function savePref(key, val) {
  try {
    const d = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
    d[key] = val;
    localStorage.setItem(LS_KEY, JSON.stringify(d));
  } catch (e) {
    // Silently ignore — quota exceeded or private-browsing restrictions.
  }
}

/**
 * Load all saved preferences for this tool.
 *
 * @returns {Object} Plain object of saved key/value pairs, or {} on error.
 */
function loadPrefs() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '{}');
  } catch (e) {
    return {};
  }
}

/* ═══ THEME / MODE ═══ */

/**
 * Apply a light/dark mode to the page and optionally persist the choice.
 * Sets `data-mode` on <body> and updates the badge text.
 *
 * @param {string}  m      - 'light' or 'dark'.
 * @param {boolean} noSave - When true the choice is not written to localStorage
 *                           (used during initial restore to avoid redundant writes).
 */
function applyMode(m, noSave) {
  document.body.dataset.mode = m;
  const badge = document.getElementById('modeBadge');
  if (badge) badge.textContent = m === 'dark' ? 'DARK' : 'LIGHT';
  if (!noSave) savePref('mode', m);
}

// Toggle between light and dark when the mode button is clicked.
document.getElementById('modeToggle').addEventListener('click', () => {
  applyMode(document.body.dataset.mode === 'dark' ? 'light' : 'dark');
});

/* ═══ MODALS ═══ */

/**
 * Show a modal overlay by adding the 'show' class and preventing body scroll.
 *
 * @param {string} id - ID of the .modal-overlay element to open.
 */
function openModal(id) {
  document.getElementById(id).classList.add('show');
  document.body.style.overflow = 'hidden';
}

/**
 * Close a modal overlay and restore body scroll.
 *
 * @param {string} id - ID of the .modal-overlay element to close.
 */
function closeModal(id) {
  document.getElementById(id).classList.remove('show');
  document.body.style.overflow = '';
}

// Close any modal when the user clicks the dimmed overlay background.
document.querySelectorAll('.modal-overlay').forEach(ov => {
  ov.addEventListener('click', e => {
    if (e.target === ov) closeModal(ov.id);
  });
});

/* ═══ MUSIC DATA CONSTANTS ═══ */

/**
 * Chromatic scale in sharps order.
 * Index 0 = C, index 11 = B.  Used as pitch-class (PC) lookup throughout.
 */
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/**
 * Enharmonic equivalents map: sharp name → flat name.
 * Used when displaying note names to show both spellings (e.g. "C#/Db").
 */
const ENH = { 'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb' };

/**
 * Format a note name to show enharmonic equivalent if one exists.
 *
 * @param   {string} n - Note name from NOTES array.
 * @returns {string}   e.g. "C#/Db" or "D".
 */
const nn = n => ENH[n] ? n + '/' + ENH[n] : n;

/**
 * Convert a MIDI note number to its frequency in Hz using equal temperament.
 * A4 = MIDI 69 = 440 Hz.
 *
 * @param   {number} midi - MIDI note number.
 * @returns {number}      Frequency in Hz.
 */
const midiFreq = midi => 440 * Math.pow(2, (midi - 69) / 12);

/**
 * Get the frequency of a named note in a given octave.
 * MIDI calculation: (oct + 1) * 12 + pitch-class index.
 *
 * @param   {string} note - Note name (e.g. 'C#').
 * @param   {number} oct  - Octave number (e.g. 4 for middle octave).
 * @returns {number}      Frequency in Hz.
 */
const noteFreq = (note, oct) => midiFreq((oct + 1) * 12 + NOTES.indexOf(note));

/**
 * Convert a named note + octave to its MIDI number.
 *
 * @param   {string} note - Note name.
 * @param   {number} oct  - Octave number.
 * @returns {number}      MIDI note number.
 */
const noteToMidi = (note, oct) => (oct + 1) * 12 + NOTES.indexOf(note);

/** White keys in order within one octave (no accidentals). */
const WN = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

/**
 * Maps each white key to the black key that follows it (to the right).
 * Keys without a following black key (E, B) are absent from this map.
 */
const BLACK_AFTER = { C: 'C#', D: 'D#', F: 'F#', G: 'G#', A: 'A#' };

/**
 * Scale definitions: each scale is an array of semitone offsets from the root.
 * The final value (12) represents the octave and is included for ascending
 * playback; it is stripped when computing unique pitch classes.
 */
const SCALES = {
  'Major':           [0, 2, 4, 5, 7, 9, 11, 12],
  'Natural Minor':   [0, 2, 3, 5, 7, 8, 10, 12],
  'Harmonic Minor':  [0, 2, 3, 5, 7, 8, 11, 12],
  'Melodic Minor':   [0, 2, 3, 5, 7, 9, 11, 12],
  'Dorian':          [0, 2, 3, 5, 7, 9, 10, 12],
  'Phrygian':        [0, 1, 3, 5, 7, 8, 10, 12],
  'Lydian':          [0, 2, 4, 6, 7, 9, 11, 12],
  'Mixolydian':      [0, 2, 4, 5, 7, 9, 10, 12],
  'Locrian':         [0, 1, 3, 5, 6, 8, 10, 12],
  'Pentatonic Major':[0, 2, 4, 7, 9, 12],
  'Pentatonic Minor':[0, 3, 5, 7, 10, 12],
  'Blues':           [0, 3, 5, 6, 7, 10, 12],
  'Chromatic':       [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  'Whole Tone':      [0, 2, 4, 6, 8, 10, 12],
  'Diminished':      [0, 2, 3, 5, 6, 8, 9, 11, 12],
};

/**
 * Scale groups used to build <optgroup> elements in the scale type dropdown.
 * Order and grouping reflect common music theory pedagogy.
 */
const SCALE_GROUPS = [
  { label: 'Major Modes',      scales: ['Major', 'Dorian', 'Phrygian', 'Lydian', 'Mixolydian', 'Locrian'] },
  { label: 'Minor Scales',     scales: ['Natural Minor', 'Harmonic Minor', 'Melodic Minor'] },
  { label: 'Pentatonic & Blues', scales: ['Pentatonic Major', 'Pentatonic Minor', 'Blues'] },
  { label: 'Symmetric & Other', scales: ['Chromatic', 'Whole Tone', 'Diminished'] },
];

/* ═══ AUDIO ENGINE ═══ */

/** Lazily created AudioContext; reused for the lifetime of the page. */
let audioCtx = null;

/**
 * Return (and if necessary create or resume) the shared AudioContext.
 * Must be called from a user-gesture handler to satisfy browser autoplay policy.
 *
 * @returns {AudioContext}
 */
function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

/**
 * Schedule a single piano-like tone using a triangle oscillator with a
 * layered sine octave for warmth, routed through a low-pass filter to
 * soften the attack and roll off harsh upper partials.
 *
 * @param {number} f   - Frequency in Hz.
 * @param {number} t0  - AudioContext time at which to start the note.
 * @param {number} dur - Duration in seconds (default 0.75).
 */
function playTone(f, t0, dur) {
  dur = dur !== undefined ? dur : 0.75;
  const ctx = getCtx();

  // Primary triangle oscillator through a low-pass filter
  const osc  = ctx.createOscillator();
  const g    = ctx.createGain();
  const filt = ctx.createBiquadFilter();
  filt.type            = 'lowpass';
  filt.frequency.value = 2800; // cut harsh high-frequency content

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(f, t0);

  // Attack-decay-release envelope
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(0.38, t0 + 0.015);          // fast attack
  g.gain.exponentialRampToValueAtTime(0.18, t0 + dur * 0.4); // decay to sustain
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);       // release tail

  // Layered sine at one octave up for overtone richness
  const o2 = ctx.createOscillator();
  const g2 = ctx.createGain();
  o2.type = 'sine';
  o2.frequency.setValueAtTime(f * 2, t0); // one octave above fundamental

  g2.gain.setValueAtTime(0, t0);
  g2.gain.linearRampToValueAtTime(0.1, t0 + 0.01);
  g2.gain.exponentialRampToValueAtTime(0.001, t0 + dur * 0.6);

  // Wire up and schedule both oscillators
  o2.connect(g2);
  g2.connect(ctx.destination);
  o2.start(t0);
  o2.stop(t0 + dur);

  osc.connect(filt);
  filt.connect(g);
  g.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur);
}

/* ═══ CHORD & SCALE DATA ═══ */

/**
 * Chord type definitions: each value is an array of semitone offsets from root.
 * Intervals > 12 represent compound intervals (e.g. 14 = major 9th).
 * These are used for both note computation and INTERVAL_LABELS lookup.
 */
const CHORD_TYPES = {
  // Triads
  'Major':     [0, 4, 7],
  'Minor':     [0, 3, 7],
  'Dim':       [0, 3, 6],
  'Aug':       [0, 4, 8],
  'Sus2':      [0, 2, 7],
  'Sus4':      [0, 5, 7],
  // Seventh chords
  'Maj7':      [0, 4, 7, 11],
  'Dom7':      [0, 4, 7, 10],
  'Min7':      [0, 3, 7, 10],
  'Half-Dim7': [0, 3, 6, 10],
  'Dim7':      [0, 3, 6, 9],
  'MinMaj7':   [0, 3, 7, 11],
  // Extended chords
  'Add9':      [0, 4, 7, 14],
  'Maj9':      [0, 4, 7, 11, 14],
  'Min9':      [0, 3, 7, 10, 14],
  '6':         [0, 4, 7, 9],
  'Min6':      [0, 3, 7, 9],
};

/** Display order for the chord type dropdown — groups triads, 7ths, and extensions. */
const CHORD_ORDER = [
  'Major', 'Minor', 'Dim', 'Aug', 'Sus2', 'Sus4',
  'Maj7', 'Dom7', 'Min7', 'Half-Dim7', 'Dim7', 'MinMaj7',
  'Add9', 'Maj9', 'Min9', '6', 'Min6',
];

/**
 * Human-readable interval labels keyed by semitone offset from root.
 * Used to label piano keys and chord diagram dots.
 */
const INTERVAL_LABELS = {
  0: 'R',   1: '♭2',  2: '2',  3: '♭3', 4: '3',
  5: '4',   6: '♭5',  7: '5',  8: '♯5', 9: '6',
  10: '♭7', 11: '7', 12: '8', 13: '♭9', 14: '9',
};

/**
 * Scale degree labels keyed by semitone offset — same idea as INTERVAL_LABELS
 * but expressed as scale degree numbers rather than chord interval names.
 */
const SCALE_DEGREE_LABELS = {
  0: '1',  1: '♭2', 2: '2',  3: '♭3', 4: '3',
  5: '4',  6: '♭5', 7: '5',  8: '♯5', 9: '6',
  10: '♭7', 11: '7',
};

/**
 * Standard guitar tuning as MIDI note numbers, low E string (index 0) to
 * high e string (index 5): E2, A2, D3, G3, B3, E4.
 */
const STD_TUNING = [40, 45, 50, 55, 59, 64];

/** String labels matching STD_TUNING order (used for fretboard display). */
const STD_LABELS = ['E', 'A', 'D', 'G', 'B', 'e'];

/** Current tool view: 'chords' or 'scales'. */
let currentMode = 'chords';

/* ═══ DROPDOWN POPULATION ═══ */

/**
 * Populate a root-note <select> with all 12 chromatic notes.
 * Enharmonic pairs are displayed as "C#/Db" etc.
 *
 * @param {HTMLSelectElement} sel - The select element to populate.
 */
function populateRootSelect(sel) {
  NOTES.forEach(n => {
    const opt = document.createElement('option');
    opt.value       = n;
    opt.textContent = nn(n);
    sel.appendChild(opt);
  });
}

/**
 * Populate the chord type <select> using CHORD_ORDER for consistent grouping.
 */
function populateChordTypeSelect() {
  const sel = document.getElementById('chordType');
  CHORD_ORDER.forEach(t => {
    const opt = document.createElement('option');
    opt.value       = t;
    opt.textContent = t;
    sel.appendChild(opt);
  });
}

/**
 * Populate the scale type <select> using SCALE_GROUPS to create labelled
 * <optgroup> sections (e.g. "Major Modes", "Minor Scales", etc.).
 */
function populateScaleSelect() {
  const sel = document.getElementById('scaleType');
  SCALE_GROUPS.forEach(g => {
    const og = document.createElement('optgroup');
    og.label = g.label;
    g.scales.forEach(s => {
      const opt = document.createElement('option');
      opt.value       = s;
      opt.textContent = s;
      og.appendChild(opt);
    });
    sel.appendChild(og);
  });
}

/* ═══ CHORD NOTE COMPUTATION ═══ */

/**
 * Compute the notes belonging to a chord with their interval labels.
 * Returns one entry per semitone offset including compound intervals (9ths).
 *
 * @param   {string} rootName      - Root note (e.g. 'C#').
 * @param   {string} chordTypeName - Key into CHORD_TYPES.
 * @returns {Array<{note:string, semitone:number, interval:string}>}
 */
function getChordNotes(rootName, chordTypeName) {
  const rootIdx  = NOTES.indexOf(rootName);
  const semitones = CHORD_TYPES[chordTypeName];
  return semitones.map(s => {
    // Wrap semitone mod 12 to get the pitch class, then look up the note name
    const noteIdx = (rootIdx + (s % 12)) % 12;
    return {
      note:     NOTES[noteIdx],
      semitone: s,
      interval: INTERVAL_LABELS[s] || s.toString(),
    };
  });
}

/**
 * Return a Set of pitch classes (0–11) for the given chord.
 * Used to highlight piano keys without caring about octave position.
 *
 * @param   {string} rootName
 * @param   {string} chordTypeName
 * @returns {Set<number>}
 */
function getChordPitchClasses(rootName, chordTypeName) {
  const rootIdx   = NOTES.indexOf(rootName);
  const semitones = CHORD_TYPES[chordTypeName];
  return new Set(semitones.map(s => (rootIdx + (s % 12)) % 12));
}

/**
 * Return a Map from pitch class → interval label for the given chord.
 * Only the first occurrence of each pitch class is stored (e.g. the 9th
 * is stored as '9', not re-stored as '2' if they share a PC).
 *
 * @param   {string} rootName
 * @param   {string} chordTypeName
 * @returns {Map<number, string>} PC → interval label.
 */
function getChordSemitoneMap(rootName, chordTypeName) {
  const rootIdx   = NOTES.indexOf(rootName);
  const semitones = CHORD_TYPES[chordTypeName];
  const map       = new Map();
  semitones.forEach(s => {
    const pc = (rootIdx + (s % 12)) % 12;
    if (!map.has(pc)) map.set(pc, INTERVAL_LABELS[s] || s.toString());
  });
  return map;
}

/* ═══ SCALE NOTE COMPUTATION ═══ */

/**
 * Compute the unique notes in a scale with their scale degree labels.
 * The octave (semitone 12) is excluded because it duplicates the root.
 *
 * @param   {string} rootName  - Root note (e.g. 'D').
 * @param   {string} scaleName - Key into SCALES.
 * @returns {Array<{note:string, semitone:number, degree:string}>}
 */
function getScaleNotes(rootName, scaleName) {
  const rootIdx  = NOTES.indexOf(rootName);
  const intervals = SCALES[scaleName];
  // Deduplicate: collapse octave repeats to unique pitch classes
  const unique = [...new Set(intervals.map(s => s % 12))];
  return unique.map(s => {
    const noteIdx = (rootIdx + s) % 12;
    return {
      note:    NOTES[noteIdx],
      semitone: s,
      degree:  SCALE_DEGREE_LABELS[s] || s.toString(),
    };
  });
}

/**
 * Return a Set of pitch classes for the given scale (including octave wrap).
 *
 * @param   {string} rootName
 * @param   {string} scaleName
 * @returns {Set<number>}
 */
function getScalePitchClasses(rootName, scaleName) {
  const rootIdx   = NOTES.indexOf(rootName);
  const intervals = SCALES[scaleName];
  return new Set(intervals.map(s => (rootIdx + (s % 12)) % 12));
}

/**
 * Return a Map from pitch class → scale degree label for the given scale.
 *
 * @param   {string} rootName
 * @param   {string} scaleName
 * @returns {Map<number, string>} PC → degree label.
 */
function getScaleDegreeMap(rootName, scaleName) {
  const rootIdx   = NOTES.indexOf(rootName);
  const intervals = SCALES[scaleName];
  const map       = new Map();
  [...new Set(intervals.map(s => s % 12))].forEach(s => {
    const pc = (rootIdx + s) % 12;
    if (!map.has(pc)) map.set(pc, SCALE_DEGREE_LABELS[s] || s.toString());
  });
  return map;
}

/* ═══ PIANO RENDERING ═══ */

/**
 * Build an interactive two-octave piano (C3–B4) inside pianoEl.
 * Keys in highlightPCs receive the .in-scale class and display their
 * label from labelMap.  Click handlers play the corresponding tone.
 *
 * Black keys are positioned absolutely using left offsets measured in a
 * requestAnimationFrame callback after white keys have been laid out by
 * the browser.
 *
 * @param {HTMLElement}    pianoEl      - Container element (class="piano").
 * @param {Set<number>}    highlightPCs - Pitch classes to highlight.
 * @param {Map<number,string>} labelMap - PC → label text.
 * @param {number}         rootPc       - Root pitch class (unused directly,
 *                                        available for future per-key styling).
 */
function buildPianoHighlighted(pianoEl, highlightPCs, labelMap, rootPc) {
  pianoEl.innerHTML = '';

  // Render two octaves (C3 and C4)
  [3, 4].forEach(oct => {
    WN.forEach(note => {
      const k  = document.createElement('div');
      k.className = 'white-key';
      const pc = NOTES.indexOf(note);

      if (highlightPCs.has(pc)) k.classList.add('in-scale');

      // Show the interval/degree label only for highlighted keys
      const lbl       = document.createElement('span');
      lbl.className   = 'key-label';
      lbl.textContent = highlightPCs.has(pc) ? (labelMap.get(pc) || note) : '';
      k.appendChild(lbl);

      k.dataset.note   = note;
      k.dataset.octave = oct;

      // Play tone on click; brief 'playing' class provides visual feedback
      k.addEventListener('click', () => {
        playTone(noteFreq(note, oct), getCtx().currentTime);
        k.classList.add('playing');
        setTimeout(() => k.classList.remove('playing'), 500);
      });

      pianoEl.appendChild(k);
    });
  });

  // After white keys are rendered, position black keys absolutely
  requestAnimationFrame(() => {
    pianoEl.querySelectorAll('.white-key').forEach(wk => {
      const n = wk.dataset.note;
      const o = parseInt(wk.dataset.octave);

      // Skip white keys that have no following black key (E and B)
      if (!BLACK_AFTER[n]) return;

      const bn = BLACK_AFTER[n]; // e.g. 'C#' for 'C'
      const bk = document.createElement('div');
      bk.className = 'black-key';

      const pc = NOTES.indexOf(bn);
      if (highlightPCs.has(pc)) bk.classList.add('in-scale');

      const lbl       = document.createElement('span');
      lbl.className   = 'key-label';
      lbl.textContent = highlightPCs.has(pc) ? (labelMap.get(pc) || bn) : '';
      bk.appendChild(lbl);

      bk.dataset.note   = bn;
      bk.dataset.octave = o;

      bk.addEventListener('click', e => {
        e.stopPropagation(); // prevent click from bubbling to the white key below
        playTone(noteFreq(bn, o), getCtx().currentTime);
        bk.classList.add('playing');
        setTimeout(() => bk.classList.remove('playing'), 500);
      });

      // Position 29px from the left edge of the parent white key
      bk.style.left = (wk.offsetLeft + 29) + 'px';
      pianoEl.appendChild(bk);
    });
  });
}

/* ═══ GUITAR VOICING ALGORITHM ═══ */

/**
 * Algorithmically find guitar chord voicings in standard tuning (EADGBE).
 *
 * The algorithm:
 *   1. Iterates starting fret positions (0 = open through fret 12).
 *   2. For each position builds a list of valid frets per string
 *      (only frets that produce a chord tone, plus -1 for muted).
 *   3. Enumerates combinations (capped at COMBO_LIMIT for performance).
 *   4. Filters by: minimum 3 sounding strings, all chord tones present,
 *      no muted strings between the outermost sounding strings.
 *   5. Scores by: root in bass (+10), string count (+2 each),
 *      lower neck position (+ up to 5), open strings (+1 each).
 *   6. Deduplicates by fret pattern string and returns the top maxVoicings.
 *
 * @param   {string} rootName      - Root note name.
 * @param   {string} chordTypeName - Chord type key.
 * @param   {number} [maxVoicings=3] - Maximum results to return.
 * @returns {Array<{frets:number[], score:number, position:number}>}
 *          frets[i] is the fret number for string i (0=open, -1=muted).
 */
function findGuitarVoicings(rootName, chordTypeName, maxVoicings) {
  maxVoicings = maxVoicings || 3;
  const rootPc    = NOTES.indexOf(rootName);
  const semitones = CHORD_TYPES[chordTypeName];
  const chordPCs  = new Set(semitones.map(s => (rootPc + (s % 12)) % 12));
  const voicings  = [];

  for (let startFret = 0; startFret <= 12; startFret++) {
    // Open-position voicings span frets 0–3; others span a 4-fret window
    const endFret = startFret === 0 ? 3 : startFret + 3;

    // Build per-string option lists: each entry is a valid fret or -1 (mute)
    const stringOptions = STD_TUNING.map(openMidi => {
      const opts = [-1]; // muted is always an option
      for (let f = startFret; f <= endFret; f++) {
        const midi = openMidi + f;
        const pc   = midi % 12;
        if (chordPCs.has(pc)) opts.push(f);
      }
      return opts;
    });

    // Generator-based combination enumeration with hard cap to avoid browser freeze
    let comboCount = 0;
    const COMBO_LIMIT = 8000; // max combinations evaluated per starting position

    /**
     * Generator that yields all 6-string combinations.
     * Yields early once COMBO_LIMIT is reached to avoid blocking the UI thread.
     *
     * @param {number}   idx     - Current string index (0–5).
     * @param {number[]} current - Working fret array, modified in place.
     */
    function* combos(idx, current) {
      if (comboCount >= COMBO_LIMIT) return;
      if (idx === 6) {
        comboCount++;
        yield current.slice();
        return;
      }
      for (const f of stringOptions[idx]) {
        if (comboCount >= COMBO_LIMIT) return;
        current[idx] = f;
        yield* combos(idx + 1, current);
      }
    }

    for (const voicing of combos(0, new Array(6))) {
      const sounding = voicing.filter(f => f >= 0);
      if (sounding.length < 3) continue; // need at least 3 notes

      // Verify every chord pitch class is represented
      const playedPCs = new Set();
      voicing.forEach((f, i) => {
        if (f >= 0) playedPCs.add((STD_TUNING[i] + f) % 12);
      });
      let allPresent = true;
      for (const pc of chordPCs) {
        if (!playedPCs.has(pc)) { allPresent = false; break; }
      }
      if (!allPresent) continue;

      // Reject voicings with muted strings between the outermost sounding strings
      // (non-adjacent mutes are physically awkward and rarely used)
      let firstSounding = -1;
      let lastSounding  = -1;
      for (let i = 0; i < 6; i++) {
        if (voicing[i] >= 0) {
          if (firstSounding < 0) firstSounding = i;
          lastSounding = i;
        }
      }
      let gapMute = false;
      for (let i = firstSounding + 1; i < lastSounding; i++) {
        if (voicing[i] < 0) { gapMute = true; break; }
      }
      if (gapMute) continue;

      // Score the voicing for ranking
      let score = 0;
      const bassMidi = STD_TUNING[firstSounding] + voicing[firstSounding];
      if (bassMidi % 12 === rootPc) score += 10;  // root in bass is strongly preferred
      score += sounding.length * 2;               // more strings = richer voicing
      const maxFret = Math.max(...sounding);
      if (maxFret < 5) score += (5 - maxFret);    // prefer open / lower neck positions
      sounding.forEach(f => { if (f === 0) score += 1; }); // reward open strings

      voicings.push({ frets: voicing.slice(), score, position: startFret });
    }
  }

  // Sort highest score first, then deduplicate by fret pattern
  voicings.sort((a, b) => b.score - a.score);

  const seen   = new Set();
  const unique = [];
  for (const v of voicings) {
    const key = v.frets.join(',');
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(v);
      if (unique.length >= maxVoicings) break;
    }
  }
  return unique;
}

/* ═══ CHORD DIAGRAM SVG ═══ */

/**
 * Render a single guitar chord diagram as an SVG string.
 *
 * The diagram shows:
 *  - A nut (thick horizontal bar) or a position number if above fret 4.
 *  - Horizontal fret lines and vertical string lines.
 *  - Dots on fretted notes: root = accent colour, others = accent2.
 *    Each dot is labelled with the interval name (e.g. 'R', '3', '5').
 *  - 'X' above muted strings, 'O' above open strings.
 *
 * CSS custom properties are read from the computed style so the diagram
 * automatically adapts to light/dark mode.
 *
 * @param   {{frets:number[]}} voicing     - Voicing object from findGuitarVoicings.
 * @param   {string}           rootName    - Root note name.
 * @param   {string}           chordTypeName - Chord type key.
 * @returns {string}           SVG markup as a string (not a DOM element).
 */
function renderChordDiagram(voicing, rootName, chordTypeName) {
  const frets    = voicing.frets;
  const sounding = frets.filter(f => f >= 0);
  const minFret  = Math.min(...sounding);
  const maxFret  = Math.max(...sounding);

  // Decide whether to show open-position (nut visible) or a higher position
  let baseFret = 0;
  const numFrets = 4;
  const hasOpen  = sounding.includes(0);
  if (maxFret > 4 && !hasOpen) {
    baseFret = minFret;
    if (baseFret < 1) baseFret = 1;
  }

  // Diagram dimensions and layout constants
  const W          = 100;
  const H          = 140;
  const LEFT       = 28;
  const RIGHT      = W - 8;
  const TOP        = 24;
  const BOTTOM     = H - 16;
  const strSpacing = (RIGHT - LEFT) / 5;  // horizontal gap between 6 strings
  const fretSpacing = (BOTTOM - TOP) / numFrets; // vertical gap between fret lines

  const rootPc     = NOTES.indexOf(rootName);
  const intervalMap = getChordSemitoneMap(rootName, chordTypeName);

  // Read theme colours from CSS custom properties
  const cs      = getComputedStyle(document.body);
  const bg      = cs.getPropertyValue('--surface2').trim();
  const border  = cs.getPropertyValue('--border').trim();
  const accent  = cs.getPropertyValue('--accent').trim();
  const accent2 = cs.getPropertyValue('--accent2').trim();
  const text    = cs.getPropertyValue('--text').trim();
  const muted   = cs.getPropertyValue('--muted').trim();

  let svg = '<svg width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" xmlns="http://www.w3.org/2000/svg">';

  // Nut (thick bar at top) for open-position voicings,
  // or a small position number for higher positions (barre chord indicator)
  if (baseFret === 0) {
    svg += '<rect x="' + (LEFT - 2) + '" y="' + (TOP - 3) + '" width="' + (RIGHT - LEFT + 4) + '" height="4" fill="' + text + '" rx="1"/>';
  } else {
    // Show the starting fret number to the left of the diagram
    svg += '<text x="' + (LEFT - 10) + '" y="' + (TOP + fretSpacing / 2 + 4) + '" font-size="9" fill="' + muted + '" font-family="monospace" text-anchor="middle">' + baseFret + '</text>';
  }

  // Horizontal fret lines
  for (let f = 0; f <= numFrets; f++) {
    const y = TOP + f * fretSpacing;
    svg += '<line x1="' + LEFT + '" y1="' + y + '" x2="' + RIGHT + '" y2="' + y + '" stroke="' + border + '" stroke-width="1"/>';
  }

  // Vertical string lines
  for (let s = 0; s < 6; s++) {
    const x = LEFT + s * strSpacing;
    svg += '<line x1="' + x + '" y1="' + TOP + '" x2="' + x + '" y2="' + BOTTOM + '" stroke="' + border + '" stroke-width="1"/>';
  }

  // Dots, mute markers (X), and open-string indicators (O)
  // String 0 = low E (leftmost), string 5 = high e (rightmost)
  for (let s = 0; s < 6; s++) {
    const x = LEFT + s * strSpacing;
    const f = frets[s];

    if (f < 0) {
      // Muted string — draw an X above the nut
      svg += '<text x="' + x + '" y="' + (TOP - 7) + '" font-size="10" fill="' + muted + '" text-anchor="middle" font-family="monospace">✕</text>';
    } else if (f === 0) {
      // Open string — draw an O above the nut
      svg += '<text x="' + x + '" y="' + (TOP - 7) + '" font-size="10" fill="' + accent + '" text-anchor="middle" font-family="monospace">○</text>';
    } else {
      // Fretted note — draw a filled circle in the fret cell
      const displayFret = f - baseFret; // adjust for non-open positions
      const y           = TOP + (displayFret - 0.5) * fretSpacing; // centre of the fret slot
      const midi        = STD_TUNING[s] + f;
      const pc          = midi % 12;
      const isRoot      = (pc === rootPc);

      // Root note uses the primary accent colour; other tones use accent2
      const col   = isRoot ? accent : accent2;
      const label = intervalMap.get(pc) || NOTES[pc];

      svg += '<circle cx="' + x + '" cy="' + y + '" r="8" fill="' + col + '"/>';
      svg += '<text x="' + x + '" y="' + (y + 3.5) + '" font-size="7" fill="' + cs.getPropertyValue('--pill-text').trim() + '" font-family="monospace" text-anchor="middle" font-weight="bold">' + label + '</text>';
    }
  }

  svg += '</svg>';
  return svg;
}

/* ═══ SCALE FRETBOARD SVG ═══ */

/**
 * Build and inject a full scale fretboard diagram (13 frets, 6 strings)
 * into the #scaleFretSvg element.
 *
 * Features:
 *  - Open-string dots to the left of the nut.
 *  - Fret position markers at frets 3, 5, 7, 9 (single dot) and 12 (double dot).
 *  - Scale degree dots on every fret where the string produces a scale tone;
 *    the root degree uses the primary fret-dot colour, others use accent2.
 *  - Invisible transparent hit circles overlaid on each dot so click handlers
 *    can play the note without interfering with the visual dot colours.
 *
 * @param {string} rootName  - Root note name.
 * @param {string} scaleName - Key into SCALES.
 */
function buildScaleFretboard(rootName, scaleName) {
  const svgEl    = document.getElementById('scaleFretSvg');
  const pcs      = getScalePitchClasses(rootName, scaleName);
  const degreeMap = getScaleDegreeMap(rootName, scaleName);
  const rootPc   = NOTES.indexOf(rootName);

  // Read theme colours from CSS custom properties
  const cs  = getComputedStyle(document.body);
  const fb  = cs.getPropertyValue('--fret-bg').trim();       // fretboard background
  const fl  = cs.getPropertyValue('--fret-line').trim();     // fret lines and position markers
  const fn  = cs.getPropertyValue('--fret-nut').trim();      // nut colour
  const fd  = cs.getPropertyValue('--fret-dot').trim();      // root note dot colour
  const fsv = cs.getPropertyValue('--fret-string').trim();   // string line colour
  const a2  = cs.getPropertyValue('--accent2').trim();       // non-root scale degree colour
  const mu  = cs.getPropertyValue('--muted').trim();         // labels and fret numbers
  const pt  = cs.getPropertyValue('--pill-text').trim();     // text inside dots

  // String definitions: high e at top (index 0), low E at bottom (index 5)
  const strings = [
    { note: 'E', oct: 4, label: 'e' },
    { note: 'B', oct: 3, label: 'B' },
    { note: 'G', oct: 3, label: 'G' },
    { note: 'D', oct: 3, label: 'D' },
    { note: 'A', oct: 2, label: 'A' },
    { note: 'E', oct: 2, label: 'E' },
  ];

  // SVG canvas dimensions
  const W        = 740;
  const H        = 200;
  const numFrets = 13;
  const TOP      = 28;
  const BOTTOM   = H - 22;
  const nutX     = 58;
  const endX     = W - 16;
  const fretW    = (endX - nutX) / numFrets; // width of one fret cell
  const strSp    = (BOTTOM - TOP) / (strings.length - 1); // vertical gap between strings

  let c = '<rect width="' + W + '" height="' + H + '" fill="' + fb + '" rx="4"/>';

  // Single-dot position markers (frets 3, 5, 7, 9)
  [3, 5, 7, 9].forEach(f => {
    if (f <= numFrets) {
      c += '<circle cx="' + (nutX + f * fretW - fretW / 2) + '" cy="' + ((TOP + BOTTOM) / 2) + '" r="4.5" fill="' + fl + '" opacity="0.35"/>';
    }
  });

  // Double-dot position marker at fret 12 (one octave)
  if (numFrets >= 12) {
    const x12 = nutX + 12 * fretW - fretW / 2;
    [TOP + strSp, BOTTOM - strSp].forEach(y => {
      c += '<circle cx="' + x12 + '" cy="' + y + '" r="4.5" fill="' + fl + '" opacity="0.35"/>';
    });
  }

  // Nut — thick vertical bar before fret 1
  c += '<rect x="' + (nutX - 5) + '" y="' + (TOP - 4) + '" width="5" height="' + (BOTTOM - TOP + 8) + '" fill="' + fn + '" rx="2"/>';

  // Vertical fret lines
  for (let f = 1; f <= numFrets; f++) {
    c += '<line x1="' + (nutX + f * fretW) + '" y1="' + TOP + '" x2="' + (nutX + f * fretW) + '" y2="' + BOTTOM + '" stroke="' + fl + '" stroke-width="1.4"/>';
  }

  // Horizontal string lines with varying thickness (thicker for lower strings)
  // and string name labels to the left of the nut
  strings.forEach(({ label }, si) => {
    const y     = TOP + si * strSp;
    const thick = 0.7 + (strings.length - 1 - si) * 0.28; // low E is thickest
    c += '<line x1="' + nutX + '" y1="' + y + '" x2="' + endX + '" y2="' + y + '" stroke="' + fsv + '" stroke-width="' + thick + '" opacity="0.7"/>';
    c += '<text x="' + (nutX - 8) + '" y="' + (y + 3.5) + '" font-size="8.5" fill="' + mu + '" font-family="monospace" text-anchor="end">' + label + '</text>';
  });

  // Fret number labels along the bottom edge
  for (let f = 1; f <= numFrets; f++) {
    c += '<text x="' + (nutX + f * fretW - fretW / 2) + '" y="' + (H - 5) + '" font-size="8" fill="' + mu + '" font-family="monospace" text-anchor="middle">' + f + '</text>';
  }

  // Scale tone dots: open strings (left of nut) then fretted positions
  const hitData = []; // collect dot positions for click-handler overlay

  strings.forEach(({ note, oct }, si) => {
    const y        = TOP + si * strSp;
    const openMidi = noteToMidi(note, oct);
    const openPc   = NOTES.indexOf(note);

    // Open string dot (to the left of the nut)
    if (pcs.has(openPc)) {
      const col   = openPc === rootPc ? fd : a2;
      const label = degreeMap.get(openPc) || NOTES[openPc];
      c += '<circle cx="' + (nutX - 14) + '" cy="' + y + '" r="9" fill="' + col + '" opacity="0.92"/>';
      c += '<text x="' + (nutX - 14) + '" y="' + (y + 3.5) + '" font-size="7.5" fill="' + pt + '" font-family="monospace" text-anchor="middle" font-weight="bold">' + label + '</text>';
      hitData.push({ x: nutX - 14, y, freq: midiFreq(openMidi) });
    }

    // Fretted position dots
    for (let f = 1; f <= numFrets; f++) {
      const midi = openMidi + f;
      const pc   = midi % 12;
      if (!pcs.has(pc)) continue;
      const x     = nutX + f * fretW - fretW / 2; // centre of fret slot
      const col   = pc === rootPc ? fd : a2;
      const label = degreeMap.get(pc) || NOTES[pc];
      c += '<circle cx="' + x + '" cy="' + y + '" r="9.5" fill="' + col + '" opacity="0.92"/>';
      c += '<text x="' + x + '" y="' + (y + 3.5) + '" font-size="7.5" fill="' + pt + '" font-family="monospace" text-anchor="middle" font-weight="bold">' + label + '</text>';
      hitData.push({ x, y, freq: midiFreq(midi) });
    }
  });

  svgEl.innerHTML = c;

  // Overlay transparent hit-target circles so every dot is clickable to play its pitch
  hitData.forEach(({ x, y, freq }) => {
    const hit = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    hit.setAttribute('cx', x);
    hit.setAttribute('cy', y);
    hit.setAttribute('r', 10);
    hit.setAttribute('fill', 'transparent');
    hit.style.cursor = 'pointer';
    hit.addEventListener('click', () => playTone(freq, getCtx().currentTime));
    svgEl.appendChild(hit);
  });
}

/* ═══ DIATONIC CHORDS ═══ */

/**
 * Diatonic triad qualities for the Major scale, ordered by scale degree.
 * Each entry provides the Roman numeral label and the chord type key.
 */
const MAJOR_DIATONIC_TRIADS = [
  { degree: 'I',    type: 'Major' },
  { degree: 'ii',   type: 'Minor' },
  { degree: 'iii',  type: 'Minor' },
  { degree: 'IV',   type: 'Major' },
  { degree: 'V',    type: 'Major' },
  { degree: 'vi',   type: 'Minor' },
  { degree: 'vii°', type: 'Dim'   },
];

/** Diatonic seventh chord qualities for the Major scale. */
const MAJOR_DIATONIC_7THS = [
  { degree: 'Imaj7',   type: 'Maj7'      },
  { degree: 'ii7',     type: 'Min7'      },
  { degree: 'iii7',    type: 'Min7'      },
  { degree: 'IVmaj7',  type: 'Maj7'      },
  { degree: 'V7',      type: 'Dom7'      },
  { degree: 'vi7',     type: 'Min7'      },
  { degree: 'viiø7',   type: 'Half-Dim7' },
];

/** Diatonic triad qualities for the Natural Minor scale. */
const MINOR_DIATONIC_TRIADS = [
  { degree: 'i',    type: 'Minor' },
  { degree: 'ii°',  type: 'Dim'   },
  { degree: 'III',  type: 'Major' },
  { degree: 'iv',   type: 'Minor' },
  { degree: 'v',    type: 'Minor' },
  { degree: 'VI',   type: 'Major' },
  { degree: 'VII',  type: 'Major' },
];

/** Diatonic seventh chord qualities for the Natural Minor scale. */
const MINOR_DIATONIC_7THS = [
  { degree: 'i7',      type: 'Min7'      },
  { degree: 'iiø7',    type: 'Half-Dim7' },
  { degree: 'IIImaj7', type: 'Maj7'      },
  { degree: 'iv7',     type: 'Min7'      },
  { degree: 'v7',      type: 'Min7'      },
  { degree: 'VImaj7',  type: 'Maj7'      },
  { degree: 'VII7',    type: 'Dom7'      },
];

/**
 * Render the diatonic chords section for the current scale selection.
 * For scales other than Major and Natural Minor, displays an informational
 * message instead of chord pills.
 *
 * Each pill is a clickable button that navigates to the Chords view with
 * the diatonic chord's root and type pre-selected.
 *
 * @param {string} rootName  - Scale root note.
 * @param {string} scaleName - Scale type key.
 */
function buildDiatonicChords(rootName, scaleName) {
  const container = document.getElementById('diatonicContent');

  if (scaleName !== 'Major' && scaleName !== 'Natural Minor') {
    container.innerHTML = '<p class="diatonic-msg">Diatonic chords are shown for Major and Natural Minor scales.</p>';
    return;
  }

  const intervals  = SCALES[scaleName];
  // Unique semitone offsets (no octave repeat) define the seven scale degrees
  const scaleDegs  = [...new Set(intervals.filter(s => s < 12))];
  const rootIdx    = NOTES.indexOf(rootName);

  const triads   = scaleName === 'Major' ? MAJOR_DIATONIC_TRIADS   : MINOR_DIATONIC_TRIADS;
  const sevenths = scaleName === 'Major' ? MAJOR_DIATONIC_7THS     : MINOR_DIATONIC_7THS;

  let html = '<p style="font-size:.72rem;color:var(--muted);margin-bottom:8px;">Triads</p>';
  html += '<div class="diatonic-grid">';
  triads.forEach((ch, i) => {
    const chordRoot   = NOTES[(rootIdx + scaleDegs[i]) % 12];
    const displayRoot = ENH[chordRoot] ? chordRoot + '/' + ENH[chordRoot] : chordRoot;
    html += '<button class="diatonic-pill" onclick="gotoDiatonicChord(\'' + chordRoot + '\',\'' + ch.type + '\')">' +
      displayRoot + ' ' + ch.type +
      '<span class="roman">' + ch.degree + '</span></button>';
  });
  html += '</div>';

  html += '<p style="font-size:.72rem;color:var(--muted);margin:14px 0 8px;">Seventh Chords</p>';
  html += '<div class="diatonic-grid">';
  sevenths.forEach((ch, i) => {
    const chordRoot   = NOTES[(rootIdx + scaleDegs[i]) % 12];
    const displayRoot = ENH[chordRoot] ? chordRoot + '/' + ENH[chordRoot] : chordRoot;
    html += '<button class="diatonic-pill" onclick="gotoDiatonicChord(\'' + chordRoot + '\',\'' + ch.type + '\')">' +
      displayRoot + ' ' + ch.type +
      '<span class="roman">' + ch.degree + '</span></button>';
  });
  html += '</div>';

  container.innerHTML = html;
}

/**
 * Navigate to the Chords view with a specific root and chord type pre-selected.
 * Called when the user clicks a diatonic chord pill.
 *
 * @param {string} root - Root note name (e.g. 'G').
 * @param {string} type - Chord type key (e.g. 'Min7').
 */
function gotoDiatonicChord(root, type) {
  document.getElementById('chordRoot').value = root;
  document.getElementById('chordType').value = type;
  setMode('chords');
  onChordChange();
}

/* ═══ DISPLAY HELPERS ═══ */

/**
 * Render the note name / interval readout above the visualisers.
 * Shows note names separated by ' · ' and interval/degree labels below.
 *
 * @param {string} containerId - ID of the .note-list element.
 * @param {Array}  notes       - Array returned by getChordNotes or getScaleNotes.
 * @param {string} labelKey    - Property name to use for the label row ('interval' or 'degree').
 */
function displayNoteList(containerId, notes, labelKey) {
  const el = document.getElementById(containerId);
  const noteStr     = notes.map(n => {
    return ENH[n.note] ? n.note + '/' + ENH[n.note] : n.note;
  }).join(' · ');
  const intervalStr = notes.map(n => n[labelKey]).join(' · ');
  el.innerHTML = '<div class="notes">' + noteStr + '</div><div class="intervals">' + intervalStr + '</div>';
}

/* ═══ VIEW RENDER FUNCTIONS ═══ */

/**
 * Render the full Chords view: note list, piano highlights, and guitar diagrams.
 * Reads the current root and chord type from their respective dropdowns,
 * then persists the selection.
 */
function renderChordView() {
  const root  = document.getElementById('chordRoot').value;
  const type  = document.getElementById('chordType').value;
  const notes = getChordNotes(root, type);
  const pcs   = getChordPitchClasses(root, type);
  const labelMap = getChordSemitoneMap(root, type);

  displayNoteList('chordNoteList', notes, 'interval');
  buildPianoHighlighted(document.getElementById('chordPiano'), pcs, labelMap, NOTES.indexOf(root));

  // Generate and render guitar chord diagrams (up to 3 voicings)
  const voicings     = findGuitarVoicings(root, type);
  const diagContainer = document.getElementById('chordDiagrams');
  if (voicings.length === 0) {
    diagContainer.innerHTML = '<p style="color:var(--muted);font-size:.78rem;">No standard voicings found</p>';
  } else {
    diagContainer.innerHTML = voicings.map(v =>
      '<div class="chord-diagram">' + renderChordDiagram(v, root, type) + '</div>'
    ).join('');
  }

  savePref('chordRoot', root);
  savePref('chordType', type);
}

/**
 * Render the full Scales view: note list, piano highlights, fretboard, and
 * diatonic chords section.  Persists the selection to localStorage.
 */
function renderScaleView() {
  const root  = document.getElementById('scaleRoot').value;
  const scale = document.getElementById('scaleType').value;
  const notes = getScaleNotes(root, scale);
  const pcs   = getScalePitchClasses(root, scale);
  const labelMap = getScaleDegreeMap(root, scale);

  displayNoteList('scaleNoteList', notes, 'degree');
  buildPianoHighlighted(document.getElementById('scalePiano'), pcs, labelMap, NOTES.indexOf(root));
  buildScaleFretboard(root, scale);
  buildDiatonicChords(root, scale);

  savePref('scaleRoot', root);
  savePref('scaleType', scale);
}

/** Called by the chord root/type dropdowns' onchange handlers. */
function onChordChange() { renderChordView(); }

/** Called by the scale root/type dropdowns' onchange handlers. */
function onScaleChange() { renderScaleView(); }

/* ═══ MODE SWITCHING ═══ */

/**
 * Switch between 'chords' and 'scales' mode.
 * Updates tab active states, shows/hides the relevant panel,
 * persists the choice, and triggers a full re-render.
 *
 * @param {string} mode - 'chords' or 'scales'.
 */
function setMode(mode) {
  currentMode = mode;
  document.querySelectorAll('.mode-tab').forEach(t =>
    t.classList.toggle('active', t.dataset.mode === mode)
  );
  document.getElementById('chordPanel').classList.toggle('active', mode === 'chords');
  document.getElementById('scalePanel').classList.toggle('active', mode === 'scales');
  savePref('mode', mode);
  if (mode === 'chords') renderChordView();
  else renderScaleView();
}

/* ═══ AUDIO PLAYBACK ═══ */

/**
 * Map a semitone offset to an octave number for playback.
 * Offsets >= 12 (compound intervals like 9ths) are placed in octave 4;
 * everything else in octave 3, giving a mid-register piano sound.
 *
 * @param   {number} s - Semitone offset from root.
 * @returns {number}   Octave number (3 or 4).
 */
function semitoneOct(s) {
  return s >= 12 ? 4 : 3;
}

/**
 * Play all chord tones simultaneously (block chord / strum style).
 * Reads the current chord root and type from the dropdowns.
 */
function playChord() {
  const root  = document.getElementById('chordRoot').value;
  const type  = document.getElementById('chordType').value;
  const notes = getChordNotes(root, type);
  const ctx   = getCtx();
  const t0    = ctx.currentTime + 0.05; // small offset to avoid click artefacts
  notes.forEach(n => {
    playTone(noteFreq(n.note, semitoneOct(n.semitone)), t0, 1.2);
  });
}

/**
 * Play chord tones as an ascending arpeggio with 150 ms between notes.
 * Reads the current chord root and type from the dropdowns.
 */
function playArpeggiate() {
  const root  = document.getElementById('chordRoot').value;
  const type  = document.getElementById('chordType').value;
  const notes = getChordNotes(root, type);
  const ctx   = getCtx();
  const gap   = 0.15; // seconds between notes
  notes.forEach((n, i) => {
    playTone(noteFreq(n.note, semitoneOct(n.semitone)), ctx.currentTime + 0.05 + i * gap, 0.8);
  });
}

/**
 * Play the current scale ascending (root to octave).
 * Each note is 180 ms apart for a comfortable tempo.
 */
function playScaleAsc() {
  const root      = document.getElementById('scaleRoot').value;
  const scale     = document.getElementById('scaleType').value;
  const rootIdx   = NOTES.indexOf(root);
  const intervals = SCALES[scale]; // includes the octave (12) as the final element
  const ctx       = getCtx();
  const gap       = 0.18;
  intervals.forEach((s, i) => {
    const noteIdx = (rootIdx + (s % 12)) % 12;
    playTone(noteFreq(NOTES[noteIdx], semitoneOct(s)), ctx.currentTime + 0.05 + i * gap, 0.6);
  });
}

/**
 * Play the current scale descending (octave to root).
 * Reverses the interval array before scheduling.
 */
function playScaleDesc() {
  const root      = document.getElementById('scaleRoot').value;
  const scale     = document.getElementById('scaleType').value;
  const rootIdx   = NOTES.indexOf(root);
  const intervals = SCALES[scale].slice().reverse(); // descending order
  const ctx       = getCtx();
  const gap       = 0.18;
  intervals.forEach((s, i) => {
    const noteIdx = (rootIdx + (s % 12)) % 12;
    playTone(noteFreq(NOTES[noteIdx], semitoneOct(s)), ctx.currentTime + 0.05 + i * gap, 0.6);
  });
}

/* ═══ THEME-CHANGE RE-RENDER ═══ */

/**
 * Re-render the current view after a theme change so SVG diagrams and piano
 * highlights pick up the new CSS custom property colours.
 * Called implicitly via setMode; exposed here for future use.
 */
function render() {
  if (currentMode === 'chords') renderChordView();
  else renderScaleView();
}

/* ═══ INITIALISATION ═══ */

/**
 * Restore all user preferences from localStorage and apply them to the UI.
 * Called once on page load before the initial render.
 */
function restoreSettings() {
  const p = loadPrefs();

  // Restore chord dropdown values (validate against available options first)
  if (p.chordRoot && [...document.getElementById('chordRoot').options].some(o => o.value === p.chordRoot))
    document.getElementById('chordRoot').value = p.chordRoot;
  if (p.chordType && [...document.getElementById('chordType').options].some(o => o.value === p.chordType))
    document.getElementById('chordType').value = p.chordType;

  // Restore scale dropdown values
  if (p.scaleRoot && [...document.getElementById('scaleRoot').options].some(o => o.value === p.scaleRoot))
    document.getElementById('scaleRoot').value = p.scaleRoot;
  if (p.scaleType && [...document.getElementById('scaleType').options].some(o => o.value === p.scaleType))
    document.getElementById('scaleType').value = p.scaleType;

  // Restore mode (chords/scales) and light/dark theme
  if (p.mode && (p.mode === 'chords' || p.mode === 'scales')) currentMode = p.mode;
  applyMode(p.mode || 'light', true); // noSave=true to avoid redundant write on load
}

// ── Bootstrap sequence ──
// 1. Populate all four dropdowns
populateRootSelect(document.getElementById('chordRoot'));
populateRootSelect(document.getElementById('scaleRoot'));
populateChordTypeSelect();
populateScaleSelect();

// 2. Restore saved preferences (sets dropdown values and currentMode)
restoreSettings();

// 3. Render the restored (or default) view
setMode(currentMode);
