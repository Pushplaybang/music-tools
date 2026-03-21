/**
 * practice-timer.js — Practice Timer tool
 *
 * Lets musicians build a session plan from timed "blocks" (e.g. Warmup, Scales,
 * Repertoire), runs a countdown through each block in order, plays a Web Audio
 * chime on each block transition, and persists a practice log to localStorage
 * so users can track weekly totals and streaks.
 *
 * localStorage key (settings + block list): musicTool_practiceTimer_v1
 * localStorage key (practice log):          musicTool_practiceLog
 */

/* ═══ CONSTANTS ═══ */

/** localStorage key for user preferences and the block list. */
const LS_KEY = 'musicTool_practiceTimer_v1';

/** Separate key for the cumulative practice log (kept independent so it is not
 *  accidentally cleared when the user resets their preferences). */
const LS_LOG = 'musicTool_practiceLog';

/** CSS custom-property names used for block colour swatches.
 *  Each entry maps to a `var(--<name>)` token defined in music-tools.css. */
const SWATCH_VARS = ['accent', 'accent2', 'correct', 'wrong', 'muted', 'text'];

/** Available duration options (minutes) shown in the block duration dropdown. */
const DURATIONS = [1, 2, 3, 5, 10, 15, 20, 25, 30, 45, 60];

/* ═══ PRESET TEMPLATES ═══ */

/**
 * Built-in session templates the user can load with a single click.
 * Each entry is an array of block descriptors: { label, duration, colorIdx }.
 */
const TEMPLATES = {
  quick30: [
    { label: 'Warmup',      duration: 5,  colorIdx: 0 },
    { label: 'Repertoire',  duration: 15, colorIdx: 1 },
    { label: 'Technique',   duration: 10, colorIdx: 2 }
  ],
  fullHour: [
    { label: 'Warmup',        duration: 10, colorIdx: 0 },
    { label: 'Scales',        duration: 10, colorIdx: 1 },
    { label: 'Repertoire',    duration: 20, colorIdx: 2 },
    { label: 'Sight Reading', duration: 10, colorIdx: 4 },
    { label: 'Ear Training',  duration: 10, colorIdx: 5 }
  ],
  focused20: [
    { label: 'Warmup',        duration: 5,  colorIdx: 0 },
    { label: 'Deep Practice', duration: 15, colorIdx: 1 }
  ]
};

/* ═══ TIMER STATE ═══ */

/**
 * The current list of practice blocks.  Each block is an object:
 *   { label: string, duration: number (minutes), colorIdx: number }
 * Persisted to localStorage on every mutation.
 * @type {Array<{label: string, duration: number, colorIdx: number}>}
 */
let blocks = [];

/**
 * Current timer state machine value.
 * @type {'stopped'|'running'|'paused'}
 */
let timerState = 'stopped';

/** Zero-based index of the block currently being counted down. */
let currentBlockIdx = 0;

/** Seconds remaining in the currently active block. Uses floating-point for
 *  sub-second accuracy; the display rounds up via Math.ceil(). */
let blockRemaining = 0;

/** Total session duration in seconds (sum of all block durations). Set at
 *  session start and used to calculate the session-wide progress percentage. */
let totalSessionSecs = 0;

/** Cumulative seconds elapsed across all blocks since the session started.
 *  Used to drive the session-level progress bar. */
let elapsedSessionSecs = 0;

/** Reference to the active setInterval handle; null when the timer is stopped
 *  or paused so we never stack duplicate intervals. */
let timerInterval = null;

/** Timestamp (ms) of the most recent tick, used to compute an accurate delta
 *  rather than trusting a fixed interval duration. */
let lastTickTime = 0;

/* ═══ LOCAL STORAGE ═══ */

/**
 * Persist a single preference key/value pair into the tool's LS object.
 * Reads → merges → writes to avoid clobbering other stored prefs.
 * @param {string} k - Preference key.
 * @param {*} v      - Value (must be JSON-serialisable).
 */
function savePref(k, v) {
  try {
    const d = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
    d[k] = v;
    localStorage.setItem(LS_KEY, JSON.stringify(d));
  } catch (e) {}
}

/**
 * Load all stored preferences for this tool.
 * @returns {Object} Parsed preference object, or {} on error.
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
 * Apply a colour mode to the page and optionally persist the choice.
 * Sets `data-mode` on `<body>` and updates the badge text in the theme bar.
 * @param {string}  m      - 'light' or 'dark'.
 * @param {boolean} noSave - Pass true during init to restore without re-saving.
 */
function applyMode(m, noSave) {
  document.body.dataset.mode = m;
  const badge = document.getElementById('modeBadge');
  if (badge) badge.textContent = m === 'dark' ? 'DARK' : 'LIGHT';
  if (!noSave) saveTheme('mode', m);
  applyAccent(document.body.dataset.accent || loadTheme().accent || 'orange', true);
}

/* Toggle between light and dark on every click of the mode toggle widget. */
document.getElementById('modeToggle').addEventListener('click', () => {
  applyMode(document.body.dataset.mode === 'dark' ? 'light' : 'dark');
});

/* ═══ MODAL HELPERS ═══ */

/**
 * Show a modal overlay by adding the `.show` class and locking body scroll.
 * @param {string} id - The `id` attribute of the `.modal-overlay` element.
 */
function openModal(id) {
  document.getElementById(id).classList.add('show');
  document.body.style.overflow = 'hidden';
}

/**
 * Hide a modal overlay and restore body scrolling.
 * @param {string} id - The `id` attribute of the `.modal-overlay` element.
 */
function closeModal(id) {
  document.getElementById(id).classList.remove('show');
  document.body.style.overflow = '';
}

/* Close any modal when the user clicks the dark backdrop behind it. */
document.querySelectorAll('.modal-overlay').forEach(ov => {
  ov.addEventListener('click', e => {
    if (e.target === ov) closeModal(ov.id);
  });
});

/* ═══ WEB AUDIO API ═══ */

/** Lazily-created AudioContext — shared by all audio operations in this tool. */
let audioCtx = null;

/**
 * Return (and lazily create) the shared AudioContext.
 * Resumes a suspended context automatically — browsers require a user gesture
 * before audio can play, so this must be called inside an event handler.
 * @returns {AudioContext}
 */
function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

/**
 * Play a two-note ascending chime (C5 → E5) using the Web Audio API.
 * The chime signals the end of one block and the start of the next.
 *
 * Signal chain for each note:
 *   OscillatorNode (sine) → GainNode (exponential decay) → destination
 *
 * Note 1: 523.25 Hz (C5), starts immediately, decays over 0.5 s
 * Note 2: 659.25 Hz (E5), starts at +0.2 s, decays over 0.6 s from that point
 */
function playChime() {
  const ctx = getCtx();
  const now = ctx.currentTime;

  /* — First note: C5 — */
  const g1 = ctx.createGain();
  g1.gain.setValueAtTime(0.18, now);
  g1.gain.exponentialRampToValueAtTime(0.001, now + 0.5); // fade out
  g1.connect(ctx.destination);

  const o1 = ctx.createOscillator();
  o1.type = 'sine';
  o1.frequency.setValueAtTime(523.25, now); // C5
  o1.connect(g1);
  o1.start(now);
  o1.stop(now + 0.2);

  /* — Second note: E5, offset by 0.2 s — */
  const g2 = ctx.createGain();
  g2.gain.setValueAtTime(0.18, now + 0.2);
  g2.gain.exponentialRampToValueAtTime(0.001, now + 0.6); // fade out
  g2.connect(ctx.destination);

  const o2 = ctx.createOscillator();
  o2.type = 'sine';
  o2.frequency.setValueAtTime(659.25, now + 0.2); // E5
  o2.connect(g2);
  o2.start(now + 0.2);
  o2.stop(now + 0.4);
}

/* ═══ BLOCK MANAGEMENT ═══ */

/**
 * Append a new block to the end of the list and refresh the UI.
 * Default duration is 5 minutes; colour cycles through SWATCH_VARS.
 * @param {string} [label='']   - Display name for the block.
 * @param {number} [duration=5] - Duration in minutes.
 * @param {number} [colorIdx]   - Index into SWATCH_VARS (cycles if omitted).
 */
function addBlock(label, duration, colorIdx) {
  blocks.push({
    label:    label || '',
    duration: duration || 5,
    colorIdx: colorIdx != null ? colorIdx : (blocks.length % SWATCH_VARS.length)
  });
  saveBlocks();
  renderBlocks();
}

/**
 * Remove the block at the given index and refresh the UI.
 * @param {number} idx - Zero-based index of the block to remove.
 */
function removeBlock(idx) {
  blocks.splice(idx, 1);
  saveBlocks();
  renderBlocks();
}

/**
 * Move a block up or down in the list by one position.
 * @param {number} idx - Index of the block to move.
 * @param {number} dir - Direction: -1 (up) or +1 (down).
 */
function moveBlock(idx, dir) {
  const newIdx = idx + dir;
  if (newIdx < 0 || newIdx >= blocks.length) return;
  // Swap the two elements
  const tmp = blocks[idx];
  blocks[idx] = blocks[newIdx];
  blocks[newIdx] = tmp;
  saveBlocks();
  renderBlocks();
}

/**
 * Persist the current block list to localStorage and update derived UI
 * elements (session total label and block indicator pills).
 */
function saveBlocks() {
  savePref('blocks', blocks);
  updateSessionTotal();
  renderIndicators();
}

/**
 * Replace the current block list with a preset template.
 * Asks for confirmation if the current list is non-empty, then resets the timer.
 * @param {'quick30'|'fullHour'|'focused20'} key - Key into TEMPLATES.
 */
function loadTemplate(key) {
  const tpl = TEMPLATES[key];
  if (!tpl) return;
  if (blocks.length > 0 && !confirm('Replace current session plan?')) return;
  // Shallow-clone each block object so the TEMPLATES constant is not mutated
  blocks = tpl.map(b => ({ ...b }));
  saveBlocks();
  renderBlocks();
  if (timerState !== 'stopped') resetTimer();
}

/**
 * Delete all blocks after user confirmation.
 * Also resets the timer if it is currently running or paused.
 */
function clearBlocks() {
  if (blocks.length === 0) return;
  if (!confirm('Clear all blocks?')) return;
  blocks = [];
  saveBlocks();
  renderBlocks();
  if (timerState !== 'stopped') resetTimer();
}

/**
 * Escape HTML special characters to prevent XSS when injecting block labels
 * into innerHTML strings.
 * @param {string} s - Raw string.
 * @returns {string} HTML-safe string.
 */
function escHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Re-render the block list DOM from the current `blocks` array.
 * Shows an empty-state message when there are no blocks.
 */
function renderBlocks() {
  const list    = document.getElementById('blockList');
  const btnClear = document.getElementById('btnClear');

  if (blocks.length === 0) {
    list.innerHTML = '<div class="block-empty">No blocks yet — add one or pick a template</div>';
    btnClear.style.display = 'none';
    return;
  }

  btnClear.style.display = '';

  let html = '';
  blocks.forEach((b, i) => {
    // Build the duration <option> list with the current value pre-selected
    const durOpts = DURATIONS
      .map(d => `<option value="${d}"${d === b.duration ? ' selected' : ''}>${d} min</option>`)
      .join('');

    // Build the colour swatch row; the active swatch gets the .active class
    const swatches = SWATCH_VARS
      .map((v, si) =>
        `<span class="swatch${si === b.colorIdx ? ' active' : ''}" ` +
        `style="background:var(--${v})" data-block="${i}" data-color="${si}" ` +
        `onclick="setBlockColor(${i},${si})"></span>`
      )
      .join('');

    html += `<div class="block-row">
      <div class="block-color-indicator" style="background:var(--${SWATCH_VARS[b.colorIdx]})"></div>
      <input type="text" class="block-label-input" value="${escHtml(b.label)}" placeholder="e.g. Scales" maxlength="30" data-idx="${i}" onchange="updateBlockLabel(${i},this.value)">
      <select class="block-dur" data-idx="${i}" onchange="updateBlockDur(${i},+this.value)">${durOpts}</select>
      <div class="block-swatches">${swatches}</div>
      <div class="block-actions">
        <button class="block-btn" onclick="moveBlock(${i},-1)" title="Move up"${i === 0 ? ' disabled' : ''}>▲</button>
        <button class="block-btn" onclick="moveBlock(${i},1)" title="Move down"${i === blocks.length - 1 ? ' disabled' : ''}>▼</button>
        <button class="block-btn del" onclick="removeBlock(${i})" title="Delete">✕</button>
      </div>
    </div>`;
  });

  list.innerHTML = html;
  updateSessionTotal();
}

/**
 * Update the block label for a single block.
 * @param {number} idx - Block index.
 * @param {string} val - New label text (clamped to 30 characters).
 */
function updateBlockLabel(idx, val) {
  blocks[idx].label = val.slice(0, 30);
  saveBlocks();
}

/**
 * Update the duration (in minutes) for a single block.
 * @param {number} idx - Block index.
 * @param {number} val - New duration in minutes.
 */
function updateBlockDur(idx, val) {
  blocks[idx].duration = val;
  saveBlocks();
}

/**
 * Change the colour swatch assignment for a single block and re-render.
 * @param {number} idx      - Block index.
 * @param {number} colorIdx - Index into SWATCH_VARS.
 */
function setBlockColor(idx, colorIdx) {
  blocks[idx].colorIdx = colorIdx;
  saveBlocks();
  renderBlocks(); // full re-render needed to refresh active swatch state
}

/**
 * Recalculate the total session duration and update the caption below the
 * block list (e.g. "Total: 30 min · 3 blocks").
 */
function updateSessionTotal() {
  const total = blocks.reduce((s, b) => s + b.duration, 0);
  const el = document.getElementById('sessionTotal');
  if (blocks.length === 0) {
    el.textContent = '';
    return;
  }
  el.innerHTML = `Total: <span>${total} min</span> · ${blocks.length} block${blocks.length > 1 ? 's' : ''}`;
}

/* ═══ COUNTDOWN TIMER ═══ */

/**
 * Toggle between play → pause → resume based on the current timerState.
 * Does nothing if there are no blocks to play.
 */
function togglePlay() {
  if (blocks.length === 0) return;
  if (timerState === 'stopped') {
    startSession();
  } else if (timerState === 'running') {
    pauseTimer();
  } else if (timerState === 'paused') {
    resumeTimer();
  }
}

/**
 * Initialise and start a new session from the first block.
 * Calculates total session seconds, resets elapsed counters, and starts the
 * high-frequency tick interval (100 ms) for smooth progress updates.
 */
function startSession() {
  totalSessionSecs  = blocks.reduce((s, b) => s + b.duration * 60, 0);
  elapsedSessionSecs = 0;
  currentBlockIdx   = 0;
  blockRemaining    = blocks[0].duration * 60; // convert minutes → seconds
  timerState        = 'running';
  lastTickTime      = Date.now();
  timerInterval     = setInterval(tick, 100); // 100 ms for smooth progress bars
  updateTimerUI();
  renderIndicators();
}

/**
 * Pause the timer — stops the interval and stores the current state.
 * The elapsed counters are NOT reset so the session can be resumed exactly.
 */
function pauseTimer() {
  timerState = 'paused';
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  updatePlayBtn();
}

/**
 * Resume a paused timer.
 * Resets lastTickTime to now so the first tick does not count the pause duration.
 */
function resumeTimer() {
  timerState    = 'running';
  lastTickTime  = Date.now(); // avoid counting paused time as elapsed
  timerInterval = setInterval(tick, 100);
  updatePlayBtn();
}

/**
 * Fully stop the timer and reset all state to the initial "ready" condition.
 * Used when the session completes and when blocks are cleared mid-session.
 */
function resetTimer() {
  timerState = 'stopped';
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  currentBlockIdx    = 0;
  blockRemaining     = 0;
  elapsedSessionSecs = 0;

  // Reset all display elements to their idle state
  document.getElementById('timerDisplay').textContent = '00:00';
  document.getElementById('timerLabel').textContent   = 'Ready';
  document.getElementById('blockProgress').style.width   = '0%';
  document.getElementById('sessionProgress').style.width = '0%';
  updatePlayBtn();
  renderIndicators();
}

/**
 * Restart the currently active block from its full duration.
 * Rewinds elapsedSessionSecs to the point where this block started so the
 * session progress bar remains consistent.
 */
function restartBlock() {
  if (timerState === 'stopped' || blocks.length === 0) return;
  // Sum durations of all blocks that came before the current one
  const completedBefore = blocks.slice(0, currentBlockIdx).reduce((s, b) => s + b.duration * 60, 0);
  blockRemaining     = blocks[currentBlockIdx].duration * 60;
  elapsedSessionSecs = completedBefore;
  lastTickTime       = Date.now();
  updateTimerUI();
}

/**
 * Skip the remainder of the current block and jump to the next one.
 * The skipped time is added to elapsedSessionSecs so the session progress bar
 * does not jump backwards.
 */
function skipBlock() {
  if (timerState === 'stopped' || blocks.length === 0) return;
  elapsedSessionSecs += blockRemaining; // count skipped time as elapsed
  advanceBlock();
}

/**
 * Move to the next block in the session, or end the session if there are none left.
 * Plays the chime, triggers a brief visual flash on the countdown display, and
 * updates all UI elements to reflect the new block.
 */
function advanceBlock() {
  currentBlockIdx++;
  if (currentBlockIdx >= blocks.length) {
    // All blocks exhausted — finalise the session
    completeSession();
    return;
  }
  // Load the new block's remaining time
  blockRemaining = blocks[currentBlockIdx].duration * 60;
  playChime();

  // Brief opacity flash to signal the transition visually
  const el = document.getElementById('timerDisplay');
  el.classList.add('flash');
  setTimeout(() => el.classList.remove('flash'), 300);

  updateTimerUI();
  renderIndicators();
}

/**
 * High-frequency tick callback (every ~100 ms).
 * Uses wall-clock deltas (Date.now()) rather than counting interval fires so
 * the countdown stays accurate even when the tab is backgrounded or throttled.
 */
function tick() {
  const now   = Date.now();
  const delta = (now - lastTickTime) / 1000; // seconds elapsed since last tick
  lastTickTime = now;

  blockRemaining     -= delta;
  elapsedSessionSecs += delta;

  if (blockRemaining <= 0) {
    // Block time exhausted — correct the overshoot before advancing
    elapsedSessionSecs += blockRemaining; // blockRemaining is negative here
    blockRemaining = 0;
    advanceBlock();
    return;
  }

  updateTimerUI();
}

/**
 * Update all timer-related DOM elements to reflect the current state:
 * block label, MM:SS countdown, both progress bars (block and session),
 * and the labelled progress-wrap widgets.
 */
function updateTimerUI() {
  const b = blocks[currentBlockIdx];
  if (!b) return;

  /* Block label */
  document.getElementById('timerLabel').textContent = b.label || `Block ${currentBlockIdx + 1}`;

  /* Countdown display — round up so the display shows "1:00" not "0:60" */
  const secs = Math.ceil(blockRemaining);
  const mm   = String(Math.floor(secs / 60)).padStart(2, '0');
  const ss   = String(secs % 60).padStart(2, '0');
  document.getElementById('timerDisplay').textContent = `${mm}:${ss}`;

  /* Thin legacy progress bars (plain divs, no label row) */
  const blockTotal   = b.duration * 60;
  const blockElapsed = blockTotal - blockRemaining;

  document.getElementById('blockProgress').style.width =
    `${Math.min(100, (blockElapsed / blockTotal) * 100)}%`;

  if (totalSessionSecs > 0) {
    document.getElementById('sessionProgress').style.width =
      `${Math.min(100, (elapsedSessionSecs / totalSessionSecs) * 100)}%`;
  }

  /* Named progress-wrap rows (with percentage labels) */
  const blockProgressFill   = document.getElementById('blockProgressFill');
  const blockProgressVal    = document.getElementById('blockProgressVal');
  const sessionProgressFill = document.getElementById('sessionProgressFill');
  const sessionProgressVal  = document.getElementById('sessionProgressVal');

  if (blockProgressFill) {
    const blockPct   = blockTotal > 0
      ? Math.min(100, Math.round((blockElapsed / blockTotal) * 100))
      : 0;
    const sessionPct = totalSessionSecs > 0
      ? Math.min(100, Math.round((elapsedSessionSecs / totalSessionSecs) * 100))
      : 0;

    blockProgressFill.style.width = blockPct + '%';
    if (blockProgressVal)   blockProgressVal.textContent   = blockPct + '%';
    sessionProgressFill.style.width = sessionPct + '%';
    if (sessionProgressVal) sessionProgressVal.textContent = sessionPct + '%';
  }

  updatePlayBtn();
}

/**
 * Sync the play/pause button icon and the disabled state of restart/skip
 * buttons with the current timerState.
 */
function updatePlayBtn() {
  const btn = document.getElementById('btnPlay');
  btn.textContent = timerState === 'running' ? '⏸' : '▶';

  // Restart and skip are only meaningful when the timer is active
  document.getElementById('btnRestart').disabled = timerState === 'stopped';
  document.getElementById('btnSkip').disabled    = timerState === 'stopped';
}

/**
 * Re-render the row of proportional-width indicator pills below the transport.
 * Pill widths are proportional to each block's share of the total session time.
 * Colour and opacity reflect whether the block is pending, active, or done.
 */
function renderIndicators() {
  const wrap = document.getElementById('blockIndicators');
  if (blocks.length === 0) {
    wrap.innerHTML = '';
    return;
  }

  const totalDur = blocks.reduce((s, b) => s + b.duration, 0);

  wrap.innerHTML = blocks.map((b, i) => {
    // Scale each pill width proportionally; enforce a minimum of 20 px
    const w = Math.max(20, Math.round((b.duration / totalDur) * 300));

    let cls = 'block-ind';
    if (timerState !== 'stopped') {
      if      (i < currentBlockIdx) cls += ' done';
      else if (i === currentBlockIdx) cls += ' active';
    }

    // Active block uses the block's own swatch colour; others fall back to CSS
    const bgStyle = (i === currentBlockIdx && timerState !== 'stopped')
      ? `var(--${SWATCH_VARS[b.colorIdx]})`
      : '';

    return `<div class="${cls}" style="width:${w}px;background:${bgStyle}" title="${escHtml(b.label || 'Block ' + (i + 1))}: ${b.duration}min"></div>`;
  }).join('');
}

/* ═══ SESSION COMPLETE ═══ */

/**
 * Called when the final block countdown reaches zero.
 * Stops the timer, plays the completion chime, resets progress bars to 100%,
 * logs the session to localStorage, and opens the completion modal.
 */
function completeSession() {
  timerState = 'stopped';
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  playChime(); // celebratory end-of-session chime

  // Update display to show a clean "Complete!" state
  document.getElementById('timerDisplay').textContent   = '00:00';
  document.getElementById('timerLabel').textContent     = 'Complete!';
  document.getElementById('blockProgress').style.width   = '100%';
  document.getElementById('sessionProgress').style.width = '100%';
  updatePlayBtn();
  renderIndicators();

  /* Log the session */
  const totalMin   = blocks.reduce((s, b) => s + b.duration, 0);
  const blockSummary = blocks.map(b => ({
    label:   b.label || 'Untitled',
    minutes: b.duration
  }));
  logSession(totalMin, blockSummary);

  /* Populate the completion modal */
  document.getElementById('completeSub').textContent = `Total: ${totalMin} min`;

  document.getElementById('completeStats').innerHTML = `
    <div class="ov-stat">
      <div class="ov-val" style="color:var(--accent)">${totalMin}</div>
      <div class="ov-lbl">Minutes</div>
    </div>
    <div class="ov-stat">
      <div class="ov-val" style="color:var(--accent2)">${blocks.length}</div>
      <div class="ov-lbl">Blocks</div>
    </div>`;

  document.getElementById('completeBlocks').innerHTML = blocks.map(b => `
    <div class="complete-block-row">
      <div class="complete-block-dot" style="background:var(--${SWATCH_VARS[b.colorIdx]})"></div>
      <div class="complete-block-label">${escHtml(b.label || 'Untitled')}</div>
      <div class="complete-block-dur">${b.duration} min</div>
    </div>`).join('');

  openModal('completeOverlay');
  updateWeekSummary();
}

/* ═══ PRACTICE LOG ═══ */

/**
 * Load the full practice log array from localStorage.
 * Each entry: { date: 'YYYY-MM-DD', minutes: number, blocks: Array }
 * @returns {Array} Log entries, most-distant first.
 */
function loadLog() {
  try {
    return JSON.parse(localStorage.getItem(LS_LOG) || '[]');
  } catch (e) {
    return [];
  }
}

/**
 * Persist the practice log array to localStorage.
 * @param {Array} log - The full log array.
 */
function saveLog(log) {
  try {
    localStorage.setItem(LS_LOG, JSON.stringify(log));
  } catch (e) {}
}

/**
 * Append (or accumulate) a completed session into the practice log.
 * Multiple sessions on the same day are merged into a single entry.
 * The log is capped at 90 days; oldest entries are dropped first.
 *
 * @param {number} totalMin     - Total minutes practiced in this session.
 * @param {Array}  blockDetails - Array of { label, minutes } summaries.
 */
function logSession(totalMin, blockDetails) {
  const log   = loadLog();
  const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'

  const existing = log.find(e => e.date === today);
  if (existing) {
    // Accumulate on an existing entry for today
    existing.minutes += totalMin;
    existing.blocks   = existing.blocks.concat(blockDetails);
  } else {
    log.push({ date: today, minutes: totalMin, blocks: blockDetails });
  }

  // Keep the log bounded to 90 days; shift from the front (oldest)
  while (log.length > 90) log.shift();

  saveLog(log);
}

/**
 * Recalculate and render the "This Week" summary card stats:
 * total minutes, number of sessions, and current consecutive-day streak.
 *
 * "This Week" is defined as the last 7 calendar days ending today.
 * The streak counts backwards from today until a day with no logged session.
 */
function updateWeekSummary() {
  const log = loadLog();
  const now = new Date();

  /* Collect the last 7 calendar date strings */
  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    weekDates.push(d.toISOString().slice(0, 10));
  }

  let totalMin = 0;
  let sessions = 0;
  weekDates.forEach(date => {
    const entry = log.find(e => e.date === date);
    if (entry) {
      totalMin += entry.minutes;
      sessions++;
    }
  });

  /* Streak: walk backwards from today; break on the first day with no entry */
  let streak = 0;
  for (let i = 0; i < 90; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    if (log.find(e => e.date === dateStr)) {
      streak++;
    } else {
      break; // streak is broken
    }
  }

  document.getElementById('weekMins').textContent     = totalMin;
  document.getElementById('weekSessions').textContent = sessions;
  document.getElementById('weekStreak').textContent   = streak;
}

/* ═══ HISTORY CHART ═══ */

/**
 * Open the history modal and render the 14-day bar chart.
 */
function openHistory() {
  renderChart();
  openModal('historyOverlay');
}

/**
 * Build and inject an inline SVG bar chart showing daily practice minutes for
 * the last 14 calendar days.
 *
 * Chart dimensions (viewBox): 560 × 200 px.
 * Each bar is 28 px wide with 12 px gaps; bars are vertically scaled so the
 * tallest bar reaches the full chart height.  If there is no data, the scale
 * defaults to 60 minutes so the empty chart looks intentional rather than broken.
 */
function renderChart() {
  const log = loadLog();
  const now = new Date();

  /* Collect the last 14 days (index 13 = 13 days ago, index 0 = today) */
  const days = [];
  let maxMin = 0;

  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const entry   = log.find(e => e.date === dateStr);
    const mins    = entry ? entry.minutes : 0;
    if (mins > maxMin) maxMin = mins;
    days.push({
      date:    dateStr,
      day:     d.getDate(),
      weekday: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][d.getDay()],
      mins
    });
  }

  if (maxMin === 0) maxMin = 60; // default scale when there is no data

  /* SVG layout constants */
  const W      = 560; // viewBox width
  const H      = 200; // viewBox height
  const pad    = 30;  // top and bottom padding
  const barW   = 28;  // bar width in px
  const gap    = 12;  // gap between bars
  const chartH = H - pad * 2; // usable height for bars

  /* Centre the bar group horizontally within the viewBox */
  const totalBarW = days.length * barW + (days.length - 1) * gap;
  const startX    = (W - totalBarW) / 2;

  let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">`;

  days.forEach((d, i) => {
    const x    = startX + i * (barW + gap);
    const barH = d.mins > 0 ? Math.max(3, (d.mins / maxMin) * chartH) : 0;
    const y    = pad + chartH - barH; // top of the value bar

    /* Background column (always visible so empty days are obvious) */
    svg += `<rect x="${x}" y="${pad}" width="${barW}" height="${chartH}" rx="3" fill="var(--surface2)"/>`;

    /* Accent-coloured value bar, rendered only when mins > 0 */
    if (barH > 0) {
      svg += `<rect x="${x}" y="${y}" width="${barW}" height="${barH}" rx="3" fill="var(--accent)"/>`;
    }

    /* Minute count above the bar */
    if (d.mins > 0) {
      svg += `<text x="${x + barW / 2}" y="${y - 5}" text-anchor="middle" font-family="var(--font-b)" font-size="9" fill="var(--muted)">${d.mins}m</text>`;
    }

    /* Weekday + day-of-month label below the chart area */
    svg += `<text x="${x + barW / 2}" y="${H - 5}" text-anchor="middle" font-family="var(--font-b)" font-size="9" fill="var(--muted)">${d.weekday} ${d.day}</text>`;
  });

  svg += `</svg>`;
  document.getElementById('chartWrap').innerHTML = svg;
}

/* ═══ INITIALISATION ═══ */

/**
 * Bootstrap the application on page load:
 * 1. Restore theme preference from localStorage.
 * 2. Restore the block list, validating each entry against allowed values.
 * 3. Render all UI components to their initial state.
 */
function init() {
  const prefs = loadPrefs();

  /* 1. Restore colour mode from global theme key */
  applyMode(loadTheme().mode || 'dark', true); // noSave=true avoids a redundant write

  /* 2. Restore saved blocks; validate each field to guard against stale data */
  if (Array.isArray(prefs.blocks) && prefs.blocks.length > 0) {
    blocks = prefs.blocks.map(b => ({
      label:    typeof b.label === 'string' ? b.label : '',
      duration: DURATIONS.includes(b.duration) ? b.duration : 5,
      colorIdx: (typeof b.colorIdx === 'number' && b.colorIdx >= 0 && b.colorIdx < SWATCH_VARS.length)
        ? b.colorIdx
        : 0
    }));
  }

  /* 3. Render all stateful components */
  renderBlocks();
  renderIndicators();
  updatePlayBtn();
  updateWeekSummary();
}

/* Kick off the app */
init();
