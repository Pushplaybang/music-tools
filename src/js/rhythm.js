/**
 * rhythm.js — Rhythm Pattern Trainer
 *
 * Visual rhythm and strumming pattern practice tool with play-along
 * and call-and-response modes. 30 patterns across 9 genres with
 * SVG rhythm grid and Web Audio scheduling.
 *
 * localStorage key: musicTool_rhythm_v1
 */


/* ══════════════════════════════════════════════════════════════════════════════
   PERSISTENCE
   ══════════════════════════════════════════════════════════════════════════════ */

var LS_KEY = 'musicTool_rhythm_v1';

function savePref(k, v) {
  try {
    var d = JSON.parse(localStorage.getItem(LS_KEY) || '{}');
    d[k] = v;
    localStorage.setItem(LS_KEY, JSON.stringify(d));
  } catch (e) {}
}

function loadPrefs() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '{}'); } catch (e) { return {}; }
}


/* ══════════════════════════════════════════════════════════════════════════════
   THEME / MODE
   ══════════════════════════════════════════════════════════════════════════════ */

function applyMode(m, noSave) {
  document.body.dataset.mode = m;
  var badge = document.getElementById('modeBadge');
  if (badge) badge.textContent = m === 'dark' ? 'DARK' : 'LIGHT';
  if (!noSave) saveTheme('mode', m);
  applyAccent(document.body.dataset.accent || loadTheme().accent || 'orange', true);
}

document.getElementById('modeToggle').addEventListener('click', function () {
  applyMode(document.body.dataset.mode === 'dark' ? 'light' : 'dark');
});


/* ══════════════════════════════════════════════════════════════════════════════
   MODALS
   ══════════════════════════════════════════════════════════════════════════════ */

function openModal(id) {
  document.getElementById(id).classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  document.getElementById(id).classList.remove('show');
  document.body.style.overflow = '';
}

document.querySelectorAll('.modal-overlay').forEach(function (ov) {
  ov.addEventListener('click', function (e) {
    if (e.target === ov) closeModal(ov.id);
  });
});


/* ══════════════════════════════════════════════════════════════════════════════
   AUDIO ENGINE
   ══════════════════════════════════════════════════════════════════════════════ */

var audioCtx = null;

function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}


/* ══════════════════════════════════════════════════════════════════════════════
   PATTERN LIBRARY
   30 patterns across 9 genres (Folk, Rock, Pop, Blues, Jazz, Latin, Reggae,
   Country, Funk) at 3 difficulty tiers.
   ══════════════════════════════════════════════════════════════════════════════ */

var PATTERNS = [
  // ── Beginner (difficulty 1) ──────────────────────────────────────────────
  { id:'all-down-4', name:'All Downstrokes 4/4', genre:'Rock', difficulty:1, timeSignature:[4,4], bpm:90, description:'The simplest pattern \u2014 one downstroke per beat. Great for punk rock and power chords.', subdivisions:4, pattern:[{type:'down',accent:true},{type:'down',accent:false},{type:'down',accent:false},{type:'down',accent:false}] },
  { id:'waltz-basic', name:'Basic Waltz 3/4', genre:'Folk', difficulty:1, timeSignature:[3,4], bpm:100, description:'Three downstrokes per bar in waltz time. Emphasize beat 1.', subdivisions:3, pattern:[{type:'down',accent:true},{type:'down',accent:false},{type:'down',accent:false}] },
  { id:'folk-basic', name:'Basic Folk Strum', genre:'Folk', difficulty:1, timeSignature:[4,4], bpm:100, description:'The foundation strum for acoustic guitar \u2014 used in thousands of songs. D DU UDU.', subdivisions:8, pattern:[{type:'down',accent:true},{type:'rest'},{type:'down',accent:false},{type:'up',accent:false},{type:'rest'},{type:'up',accent:false},{type:'down',accent:false},{type:'up',accent:false}] },
  { id:'pop-simple', name:'Simple Pop Strum', genre:'Pop', difficulty:1, timeSignature:[4,4], bpm:110, description:'A bright, clean pop pattern. D DU DU \u2014 perfect for campfire singalongs.', subdivisions:8, pattern:[{type:'down',accent:true},{type:'rest'},{type:'down',accent:false},{type:'up',accent:false},{type:'rest'},{type:'down',accent:false},{type:'up',accent:false},{type:'rest'}] },
  { id:'boom-chick', name:'Boom-Chick Country', genre:'Country', difficulty:1, timeSignature:[4,4], bpm:105, description:'Classic boom-chick alternating bass note feel. Down on beats, up on the ands.', subdivisions:8, pattern:[{type:'down',accent:true},{type:'rest'},{type:'rest'},{type:'up',accent:false},{type:'down',accent:false},{type:'rest'},{type:'rest'},{type:'up',accent:false}] },
  { id:'eighth-continuous', name:'Continuous Eighth Notes', genre:'Pop', difficulty:1, timeSignature:[4,4], bpm:95, description:'Non-stop down-up alternation \u2014 builds strumming stamina and consistency.', subdivisions:8, pattern:[{type:'down',accent:true},{type:'up',accent:false},{type:'down',accent:false},{type:'up',accent:false},{type:'down',accent:false},{type:'up',accent:false},{type:'down',accent:false},{type:'up',accent:false}] },

  // ── Intermediate (difficulty 2) ──────────────────────────────────────────
  { id:'travis-pick', name:'Travis Picking Rhythm', genre:'Folk', difficulty:2, timeSignature:[4,4], bpm:90, description:'The rhythmic skeleton of Travis picking \u2014 alternating bass with syncopated melody hits.', subdivisions:8, pattern:[{type:'down',accent:true},{type:'rest'},{type:'tap',accent:false},{type:'up',accent:false},{type:'down',accent:false},{type:'tap',accent:false},{type:'rest'},{type:'up',accent:false}] },
  { id:'reggae-skank', name:'Reggae Offbeat Skank', genre:'Reggae', difficulty:2, timeSignature:[4,4], bpm:80, description:'The signature reggae rhythm \u2014 play on the offbeats (ands) only. Rest on the downbeats.', subdivisions:8, pattern:[{type:'rest'},{type:'down',accent:false},{type:'rest'},{type:'down',accent:true},{type:'rest'},{type:'down',accent:false},{type:'rest'},{type:'down',accent:true}] },
  { id:'blues-shuffle', name:'Blues Shuffle', genre:'Blues', difficulty:2, timeSignature:[4,4], bpm:100, description:'Classic 12-bar blues feel with triplet-based shuffle. Swing those eighth notes!', subdivisions:12, pattern:[{type:'down',accent:true},{type:'rest'},{type:'up',accent:false},{type:'down',accent:false},{type:'rest'},{type:'up',accent:false},{type:'down',accent:false},{type:'rest'},{type:'up',accent:false},{type:'down',accent:false},{type:'rest'},{type:'up',accent:false}] },
  { id:'bossa-basic', name:'Bossa Nova Basic', genre:'Latin', difficulty:2, timeSignature:[4,4], bpm:130, description:'The gentle syncopated pulse of bossa nova \u2014 emphasizes the "and" of beat 2.', subdivisions:16, pattern:[{type:'down',accent:true},{type:'rest'},{type:'rest'},{type:'up',accent:false},{type:'rest'},{type:'rest'},{type:'down',accent:true},{type:'rest'},{type:'rest'},{type:'down',accent:false},{type:'rest'},{type:'up',accent:false},{type:'rest'},{type:'rest'},{type:'down',accent:false},{type:'rest'}] },
  { id:'rock-muted', name:'Rock Power Strum', genre:'Rock', difficulty:2, timeSignature:[4,4], bpm:120, description:'Driving rock pattern with muted upstrokes for a tight, chunky feel.', subdivisions:8, pattern:[{type:'down',accent:true},{type:'mute'},{type:'down',accent:false},{type:'mute'},{type:'down',accent:true},{type:'mute'},{type:'down',accent:false},{type:'mute'}] },
  { id:'swing-comp', name:'Swing Jazz Comping', genre:'Jazz', difficulty:2, timeSignature:[4,4], bpm:140, description:'Swing-feel jazz guitar comping. Triplet grid with the classic long-short phrasing.', subdivisions:12, pattern:[{type:'down',accent:true},{type:'rest'},{type:'rest'},{type:'rest'},{type:'rest'},{type:'down',accent:false},{type:'down',accent:true},{type:'rest'},{type:'rest'},{type:'rest'},{type:'rest'},{type:'down',accent:false}] },
  { id:'funk-basic-16', name:'Basic Funk 16th', genre:'Funk', difficulty:2, timeSignature:[4,4], bpm:100, description:'Entry-level funk with 16th-note strumming and ghost mutes.', subdivisions:16, pattern:[{type:'down',accent:true},{type:'mute'},{type:'up',accent:false},{type:'mute'},{type:'rest'},{type:'mute'},{type:'up',accent:false},{type:'mute'},{type:'down',accent:true},{type:'mute'},{type:'up',accent:false},{type:'mute'},{type:'rest'},{type:'mute'},{type:'up',accent:false},{type:'mute'}] },
  { id:'country-train', name:'Country Train Beat', genre:'Country', difficulty:2, timeSignature:[4,4], bpm:115, description:'The clickety-clack rhythm of a train \u2014 driving 16th-note country groove.', subdivisions:16, pattern:[{type:'down',accent:true},{type:'up',accent:false},{type:'mute'},{type:'up',accent:false},{type:'down',accent:false},{type:'up',accent:false},{type:'mute'},{type:'up',accent:false},{type:'down',accent:true},{type:'up',accent:false},{type:'mute'},{type:'up',accent:false},{type:'down',accent:false},{type:'up',accent:false},{type:'mute'},{type:'up',accent:false}] },
  { id:'calypso', name:'Calypso Strum', genre:'Latin', difficulty:2, timeSignature:[4,4], bpm:120, description:'Sunny Caribbean feel with syncopated accents. Think island vibes.', subdivisions:8, pattern:[{type:'down',accent:true},{type:'rest'},{type:'rest'},{type:'down',accent:false},{type:'up',accent:false},{type:'rest'},{type:'down',accent:true},{type:'up',accent:false}] },
  { id:'motown', name:'Motown Groove', genre:'Funk', difficulty:2, timeSignature:[4,4], bpm:108, description:'The smooth, driving Motown rhythm \u2014 keeps the body moving.', subdivisions:16, pattern:[{type:'down',accent:true},{type:'rest'},{type:'up',accent:false},{type:'rest'},{type:'down',accent:false},{type:'rest'},{type:'up',accent:false},{type:'down',accent:false},{type:'rest'},{type:'up',accent:false},{type:'rest'},{type:'down',accent:true},{type:'rest'},{type:'up',accent:false},{type:'rest'},{type:'down',accent:false}] },
  { id:'six-eight', name:'6/8 Time Basic', genre:'Folk', difficulty:2, timeSignature:[6,8], bpm:80, description:'Six-eight feel \u2014 two groups of three. Common in ballads and Irish music.', subdivisions:6, pattern:[{type:'down',accent:true},{type:'up',accent:false},{type:'up',accent:false},{type:'down',accent:true},{type:'up',accent:false},{type:'up',accent:false}] },
  { id:'waltz-bass-alt', name:'Waltz Bass Alternation', genre:'Folk', difficulty:2, timeSignature:[3,4], bpm:110, description:'Waltz with bass note on 1, then chord on 2 and 3 with upstroke fills.', subdivisions:6, pattern:[{type:'down',accent:true},{type:'rest'},{type:'up',accent:false},{type:'rest'},{type:'down',accent:false},{type:'up',accent:false}] },

  // ── Advanced (difficulty 3) ──────────────────────────────────────────────
  { id:'funk-full', name:'Full Funk 16th', genre:'Funk', difficulty:3, timeSignature:[4,4], bpm:96, description:'All-out 16th-note funk with ghost mutes and dynamic accents. Channel your inner Nile Rodgers.', subdivisions:16, pattern:[{type:'down',accent:true},{type:'mute'},{type:'up',accent:false},{type:'mute'},{type:'down',accent:false},{type:'up',accent:true},{type:'mute'},{type:'up',accent:false},{type:'mute'},{type:'down',accent:false},{type:'up',accent:false},{type:'mute'},{type:'down',accent:true},{type:'mute'},{type:'up',accent:false},{type:'mute'}] },
  { id:'flamenco-ras', name:'Flamenco Rasgueado', genre:'Latin', difficulty:3, timeSignature:[4,4], bpm:100, description:'Rapid multi-finger strum pattern. Each subdivision is a different finger rolling across the strings.', subdivisions:16, pattern:[{type:'down',accent:true},{type:'up',accent:false},{type:'down',accent:false},{type:'up',accent:false},{type:'down',accent:true},{type:'rest'},{type:'down',accent:false},{type:'up',accent:false},{type:'down',accent:true},{type:'up',accent:false},{type:'down',accent:false},{type:'up',accent:false},{type:'down',accent:true},{type:'rest'},{type:'mute'},{type:'rest'}] },
  { id:'bossa-sync', name:'Bossa Nova Syncopated', genre:'Latin', difficulty:3, timeSignature:[4,4], bpm:135, description:'Advanced bossa nova with full syncopation. The heartbeat of Jo\u00e3o Gilberto.', subdivisions:16, pattern:[{type:'down',accent:true},{type:'rest'},{type:'rest'},{type:'down',accent:false},{type:'rest'},{type:'up',accent:false},{type:'rest'},{type:'down',accent:true},{type:'rest'},{type:'up',accent:false},{type:'down',accent:false},{type:'rest'},{type:'up',accent:false},{type:'rest'},{type:'down',accent:false},{type:'rest'}] },
  { id:'jazz-antic', name:'Jazz Swing Anticipations', genre:'Jazz', difficulty:3, timeSignature:[4,4], bpm:150, description:'Swing comping with push anticipations \u2014 hitting chords before the beat for forward motion.', subdivisions:12, pattern:[{type:'rest'},{type:'rest'},{type:'down',accent:true},{type:'rest'},{type:'rest'},{type:'rest'},{type:'down',accent:false},{type:'rest'},{type:'down',accent:true},{type:'rest'},{type:'rest'},{type:'down',accent:false}] },
  { id:'afrobeat', name:'Afrobeat Pattern', genre:'Funk', difficulty:3, timeSignature:[4,4], bpm:110, description:'Fela Kuti-inspired rhythm \u2014 interlocking accents create a hypnotic African groove.', subdivisions:16, pattern:[{type:'down',accent:true},{type:'rest'},{type:'up',accent:false},{type:'down',accent:false},{type:'rest'},{type:'up',accent:true},{type:'rest'},{type:'down',accent:false},{type:'up',accent:false},{type:'rest'},{type:'down',accent:true},{type:'rest'},{type:'up',accent:false},{type:'down',accent:false},{type:'rest'},{type:'up',accent:false}] },
  { id:'reggae-drop', name:'Reggae One Drop', genre:'Reggae', difficulty:3, timeSignature:[4,4], bpm:75, description:'The one drop \u2014 beat 1 is empty, creating deep space. The soul of roots reggae.', subdivisions:8, pattern:[{type:'rest'},{type:'rest'},{type:'rest'},{type:'down',accent:true},{type:'rest'},{type:'mute'},{type:'rest'},{type:'down',accent:true}] },
  { id:'prog-78', name:'Progressive 7/8', genre:'Rock', difficulty:3, timeSignature:[7,8], bpm:140, description:'Odd-meter groove in 7/8 \u2014 feels like 4/4 with a beat chopped off. Think prog rock.', subdivisions:7, pattern:[{type:'down',accent:true},{type:'up',accent:false},{type:'down',accent:false},{type:'up',accent:false},{type:'down',accent:true},{type:'up',accent:false},{type:'down',accent:false}] },
  { id:'samba', name:'Samba Pattern', genre:'Latin', difficulty:3, timeSignature:[4,4], bpm:100, description:'Brazilian samba rhythm \u2014 the surdo-like bass pulse with the tamborim syncopation.', subdivisions:16, pattern:[{type:'down',accent:true},{type:'rest'},{type:'up',accent:false},{type:'rest'},{type:'down',accent:false},{type:'up',accent:false},{type:'rest'},{type:'down',accent:true},{type:'rest'},{type:'up',accent:false},{type:'down',accent:false},{type:'rest'},{type:'up',accent:false},{type:'rest'},{type:'down',accent:false},{type:'up',accent:false}] },
  { id:'second-line', name:'New Orleans Second Line', genre:'Funk', difficulty:3, timeSignature:[4,4], bpm:110, description:'The bouncing parade rhythm of New Orleans \u2014 syncopated and festive.', subdivisions:16, pattern:[{type:'down',accent:true},{type:'rest'},{type:'rest'},{type:'up',accent:false},{type:'rest'},{type:'down',accent:true},{type:'rest'},{type:'up',accent:false},{type:'down',accent:false},{type:'rest'},{type:'up',accent:false},{type:'rest'},{type:'down',accent:true},{type:'rest'},{type:'rest'},{type:'up',accent:false}] },
  { id:'twelve-eight-blues', name:'12/8 Blues', genre:'Blues', difficulty:3, timeSignature:[12,8], bpm:60, description:'Slow, deep 12/8 blues \u2014 each beat subdivided into triplets. Thick, soulful feel.', subdivisions:12, pattern:[{type:'down',accent:true},{type:'rest'},{type:'up',accent:false},{type:'down',accent:false},{type:'rest'},{type:'up',accent:false},{type:'down',accent:true},{type:'rest'},{type:'up',accent:false},{type:'down',accent:false},{type:'rest'},{type:'up',accent:false}] },
  { id:'shuffle-triplet', name:'Shuffle Triplet Feel', genre:'Blues', difficulty:3, timeSignature:[4,4], bpm:110, description:'Full triplet shuffle with accented offbeats. Drives hard-blues and boogie rock.', subdivisions:12, pattern:[{type:'down',accent:true},{type:'rest'},{type:'down',accent:false},{type:'down',accent:false},{type:'rest'},{type:'up',accent:true},{type:'down',accent:false},{type:'rest'},{type:'down',accent:false},{type:'down',accent:false},{type:'rest'},{type:'up',accent:true}] },
  { id:'montuno', name:'Latin Montuno', genre:'Latin', difficulty:3, timeSignature:[4,4], bpm:120, description:'Piano montuno rhythm adapted for guitar \u2014 the engine of salsa and son music.', subdivisions:16, pattern:[{type:'down',accent:true},{type:'rest'},{type:'rest'},{type:'down',accent:false},{type:'up',accent:false},{type:'rest'},{type:'down',accent:true},{type:'rest'},{type:'rest'},{type:'down',accent:false},{type:'rest'},{type:'up',accent:false},{type:'down',accent:false},{type:'rest'},{type:'down',accent:true},{type:'rest'}] },
];


/* ══════════════════════════════════════════════════════════════════════════════
   STATE
   ══════════════════════════════════════════════════════════════════════════════ */

var currentPattern = PATTERNS[0];
var bpm = 100;
var diffFilter = 0;
var isPlaying = false;
var mode = 'along';        // 'along' or 'callresp'
var barsBeforeResp = 1;
var clickVol = 0.7;
var patternVol = 0.8;
var tapTimes = [];
var currentSlot = -1;
var barCount = 0;
var isResponseBar = false;

/* Scheduler constants */
var SCHED_AHEAD = 0.1;
var LOOK_MS = 25;
var nextNoteTime = 0;
var currentSubIdx = 0;
var schedulerTimer = null;


/* ══════════════════════════════════════════════════════════════════════════════
   TEMPO NAMES
   ══════════════════════════════════════════════════════════════════════════════ */

var TEMPO_NAMES = [
  [20,39,'Larghissimo'], [40,59,'Largo'], [60,65,'Larghetto'],
  [66,75,'Adagio'], [76,107,'Andante'], [108,119,'Moderato'],
  [120,155,'Allegro'], [156,175,'Vivace'], [176,200,'Presto'],
  [201,300,'Prestissimo']
];

function getTempoName(b) {
  for (var i = 0; i < TEMPO_NAMES.length; i++) {
    if (b >= TEMPO_NAMES[i][0] && b <= TEMPO_NAMES[i][1]) return TEMPO_NAMES[i][2];
  }
  return '';
}


/* ══════════════════════════════════════════════════════════════════════════════
   BPM CONTROL
   ══════════════════════════════════════════════════════════════════════════════ */

function setBpm(val) {
  bpm = Math.max(20, Math.min(300, +val));
  document.getElementById('bpmDisplay').textContent = bpm;
  document.getElementById('bpmSlider').value = bpm;
  document.getElementById('tempoName').textContent = getTempoName(bpm);
  savePref('bpm', bpm);
}

function tapTempo() {
  var now = performance.now();
  if (tapTimes.length > 0 && now - tapTimes[tapTimes.length - 1] > 3000) tapTimes = [];
  tapTimes.push(now);
  if (tapTimes.length > 8) tapTimes.shift();
  if (tapTimes.length >= 2) {
    var s = 0;
    for (var i = 1; i < tapTimes.length; i++) s += tapTimes[i] - tapTimes[i - 1];
    setBpm(Math.round(60000 / (s / (tapTimes.length - 1))));
  }
  var btn = document.getElementById('tapBtn');
  btn.classList.add('tapped');
  setTimeout(function () { btn.classList.remove('tapped'); }, 150);
}


/* ══════════════════════════════════════════════════════════════════════════════
   VOLUME
   ══════════════════════════════════════════════════════════════════════════════ */

function setClickVol(v) { clickVol = v / 100; savePref('clickVol', v); }
function setPatternVol(v) { patternVol = v / 100; savePref('patternVol', v); }


/* ══════════════════════════════════════════════════════════════════════════════
   FILTERING & PATTERN SELECTION
   ══════════════════════════════════════════════════════════════════════════════ */

function filterPatterns() {
  var genre = document.getElementById('genreSelect').value;
  var sel = document.getElementById('patternSelect');
  sel.innerHTML = '';
  var filtered = PATTERNS.filter(function (p) {
    if (genre !== 'All' && p.genre !== genre) return false;
    if (diffFilter > 0 && p.difficulty !== diffFilter) return false;
    return true;
  });
  if (filtered.length === 0) {
    sel.innerHTML = '<option value="">No patterns match</option>';
    return;
  }
  filtered.forEach(function (p) {
    var opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.name;
    sel.appendChild(opt);
  });
  selectPattern();
}

function setDifficulty(d) {
  diffFilter = d;
  document.querySelectorAll('.seg-btn').forEach(function (b) {
    b.classList.toggle('active', +b.dataset.diff === d);
  });
  savePref('difficulty', d);
  filterPatterns();
}

function selectPattern() {
  var id = document.getElementById('patternSelect').value;
  var p = PATTERNS.find(function (x) { return x.id === id; });
  if (!p) return;
  currentPattern = p;
  setBpm(p.bpm);
  updatePatternDisplay();
  savePref('pattern', id);
  if (isPlaying) { stopPlay(); startPlay(); }
}

function updatePatternDisplay() {
  var p = currentPattern;
  document.getElementById('genreTag').textContent = p.genre;
  document.getElementById('diffStars').textContent = '\u2B50'.repeat(p.difficulty);
  document.getElementById('timeSig').textContent = p.timeSignature[0] + '/' + p.timeSignature[1];
  document.getElementById('patternDesc').textContent = p.description;
  currentSlot = -1;
  renderGrid();
}


/* ══════════════════════════════════════════════════════════════════════════════
   MODE CONTROL (Play Along / Call & Response)
   ══════════════════════════════════════════════════════════════════════════════ */

function setMode(m) {
  mode = m;
  document.querySelectorAll('.mode-btn').forEach(function (b) {
    b.classList.toggle('active', b.dataset.mode === m);
  });
  document.getElementById('barsControl').style.display = m === 'callresp' ? 'flex' : 'none';
  savePref('mode', m);
  if (isPlaying) { stopPlay(); startPlay(); }
}

function setBarsBeforeResp(n) {
  barsBeforeResp = n;
  document.querySelectorAll('.bars-btn').forEach(function (b) {
    b.classList.toggle('active', +b.dataset.bars === n);
  });
  savePref('barsBeforeResp', n);
}


/* ══════════════════════════════════════════════════════════════════════════════
   SVG RHYTHM GRID
   ══════════════════════════════════════════════════════════════════════════════ */

function renderGrid() {
  var p = currentPattern;
  var subs = p.subdivisions;
  var beatsPerBar = p.timeSignature[0];
  var subsPerBeat = subs / beatsPerBar;
  var cellW = 36;
  var cellH = 60;
  var labelH = 20;
  var subLabelH = 16;
  var padX = 8;
  var totalW = subs * cellW + padX * 2;
  var totalH = cellH + labelH + subLabelH + 10;

  var svg = document.getElementById('rhythmSvg');
  svg.setAttribute('width', totalW);
  svg.setAttribute('height', totalH);
  svg.setAttribute('viewBox', '0 0 ' + totalW + ' ' + totalH);

  var cs = getComputedStyle(document.body);
  var accent = cs.getPropertyValue('--accent').trim();
  var accent2 = cs.getPropertyValue('--accent2').trim();
  var muted = cs.getPropertyValue('--muted').trim() || cs.getPropertyValue('--text-3').trim();
  var surface2 = cs.getPropertyValue('--surface2').trim() || cs.getPropertyValue('--surface-lo').trim();
  var border = cs.getPropertyValue('--border').trim();
  var text = cs.getPropertyValue('--text').trim();

  var html = '';

  // Background cells
  for (var i = 0; i < subs; i++) {
    var x = padX + i * cellW;
    var isCurrent = i === currentSlot;
    var ghost = isResponseBar && isCurrent;
    var fill = 'transparent';
    if (isCurrent && !isResponseBar) fill = accent;
    else if (ghost) fill = surface2;
    html += '<rect x="' + x + '" y="0" width="' + cellW + '" height="' + cellH + '" rx="4" fill="' + fill + '" opacity="' + (isCurrent && !isResponseBar ? 0.2 : ghost ? 0.5 : 0) + '"/>';
  }

  // Beat separator lines
  for (var b = 0; b <= beatsPerBar; b++) {
    var x = padX + b * subsPerBeat * cellW;
    var thick = b === 0 || b === beatsPerBar;
    html += '<line x1="' + x + '" y1="0" x2="' + x + '" y2="' + cellH + '" stroke="' + border + '" stroke-width="' + (thick ? 2 : 1) + '" opacity="' + (thick ? 0.8 : 0.4) + '"/>';
  }

  // Pattern symbols
  for (var i = 0; i < subs; i++) {
    var slot = p.pattern[i];
    if (!slot) continue;
    var cx = padX + i * cellW + cellW / 2;
    var cy = cellH / 2;
    var isCurrent = i === currentSlot;
    var ghosted = isResponseBar;
    var opacity = ghosted ? 0.25 : 1;
    var isAccent = slot.accent;
    var sz = isAccent ? 1.3 : 1;
    var color = isCurrent && !isResponseBar ? accent : (isAccent ? accent : text);

    if (slot.type === 'down') {
      var h = 10 * sz, w = 8 * sz;
      html += '<polygon points="' + (cx - w) + ',' + (cy - h / 2) + ' ' + (cx + w) + ',' + (cy - h / 2) + ' ' + cx + ',' + (cy + h / 2) + '" fill="' + color + '" opacity="' + opacity + '"/>';
    } else if (slot.type === 'up') {
      var h = 10 * sz, w = 8 * sz;
      html += '<polygon points="' + (cx - w) + ',' + (cy + h / 2) + ' ' + (cx + w) + ',' + (cy + h / 2) + ' ' + cx + ',' + (cy - h / 2) + '" fill="' + color + '" opacity="' + opacity + '"/>';
    } else if (slot.type === 'mute') {
      html += '<text x="' + cx + '" y="' + (cy + 4) + '" text-anchor="middle" fill="' + color + '" opacity="' + opacity + '" font-family="var(--font-mono)" font-size="' + (14 * sz) + '" font-weight="' + (isAccent ? 700 : 400) + '">\u00d7</text>';
    } else if (slot.type === 'rest') {
      html += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (3 * sz) + '" fill="' + muted + '" opacity="' + (opacity * 0.5) + '"/>';
    } else if (slot.type === 'tap') {
      var s = 7 * sz;
      html += '<polygon points="' + cx + ',' + (cy - s) + ' ' + (cx + s) + ',' + cy + ' ' + cx + ',' + (cy + s) + ' ' + (cx - s) + ',' + cy + '" fill="' + color + '" opacity="' + opacity + '"/>';
    }
  }

  // Beat numbers
  for (var b = 0; b < beatsPerBar; b++) {
    var x = padX + b * subsPerBeat * cellW + (subsPerBeat * cellW) / 2;
    html += '<text x="' + x + '" y="' + (cellH + labelH - 4) + '" text-anchor="middle" fill="' + muted + '" font-family="var(--font-mono)" font-size="11">' + (b + 1) + '</text>';
  }

  // Subdivision labels
  if (subsPerBeat >= 2) {
    for (var i = 0; i < subs; i++) {
      var posInBeat = i % subsPerBeat;
      var label = '';
      if (subsPerBeat === 2) {
        if (posInBeat === 1) label = '+';
      } else if (subsPerBeat === 3) {
        if (posInBeat === 1) label = '+';
        else if (posInBeat === 2) label = 'a';
      } else if (subsPerBeat === 4) {
        if (posInBeat === 1) label = 'e';
        else if (posInBeat === 2) label = '+';
        else if (posInBeat === 3) label = 'a';
      }
      if (label) {
        var x = padX + i * cellW + cellW / 2;
        html += '<text x="' + x + '" y="' + (cellH + labelH + subLabelH - 6) + '" text-anchor="middle" fill="' + muted + '" font-family="var(--font-mono)" font-size="9" opacity="0.6">' + label + '</text>';
      }
    }
  }

  svg.innerHTML = html;
}


/* ══════════════════════════════════════════════════════════════════════════════
   AUDIO: CLICK SOUND
   ══════════════════════════════════════════════════════════════════════════════ */

function playClick(time, isAccent) {
  var ctx = getCtx();
  var gain = clickVol * (isAccent ? 1.0 : 0.6);
  if (gain < 0.001) return;
  var freq = isAccent ? 1800 : 1200;
  var decay = 0.025;

  var bsize = Math.ceil(ctx.sampleRate * 0.03);
  var buf = ctx.createBuffer(1, bsize, ctx.sampleRate);
  var data = buf.getChannelData(0);
  var tc = bsize * 0.15;
  for (var j = 0; j < bsize; j++) data[j] = (Math.random() * 2 - 1) * Math.exp(-j / tc);

  var noise = ctx.createBufferSource(); noise.buffer = buf;
  var bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = 2;
  var osc = ctx.createOscillator(); osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, time);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.3, time + decay);

  var gN = ctx.createGain(), gO = ctx.createGain(), master = ctx.createGain();
  gN.gain.setValueAtTime(gain * 0.7, time);
  gN.gain.exponentialRampToValueAtTime(0.0001, time + 0.02);
  gO.gain.setValueAtTime(gain * 0.5, time);
  gO.gain.exponentialRampToValueAtTime(0.0001, time + decay);
  master.gain.value = 1;

  noise.connect(bp); bp.connect(gN); gN.connect(master);
  osc.connect(gO); gO.connect(master);
  master.connect(ctx.destination);

  var end = time + decay + 0.01;
  noise.start(time); noise.stop(end);
  osc.start(time); osc.stop(end);
}


/* ══════════════════════════════════════════════════════════════════════════════
   AUDIO: PATTERN SOUNDS
   ══════════════════════════════════════════════════════════════════════════════ */

function playPatternSound(time, slot) {
  if (!slot || slot.type === 'rest') return;
  var ctx = getCtx();
  var baseGain = patternVol * (slot.accent ? 1.4 : 1.0);
  if (baseGain < 0.001) return;

  var freq, dur;
  if (slot.type === 'down') { freq = 300; dur = 0.04; }
  else if (slot.type === 'up') { freq = 500; dur = 0.03; }
  else if (slot.type === 'mute') { freq = 800; dur = 0.015; }
  else if (slot.type === 'tap') { freq = 400; dur = 0.035; }
  else return;

  var bsize = Math.ceil(ctx.sampleRate * (dur + 0.01));
  var buf = ctx.createBuffer(1, bsize, ctx.sampleRate);
  var data = buf.getChannelData(0);
  var tc = bsize * 0.2;
  for (var j = 0; j < bsize; j++) data[j] = (Math.random() * 2 - 1) * Math.exp(-j / tc);

  var noise = ctx.createBufferSource(); noise.buffer = buf;
  var bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = freq; bp.Q.value = 1.5;
  var gN = ctx.createGain();
  gN.gain.setValueAtTime(baseGain * 0.8, time);
  gN.gain.exponentialRampToValueAtTime(0.0001, time + dur);

  noise.connect(bp); bp.connect(gN); gN.connect(ctx.destination);
  noise.start(time); noise.stop(time + dur + 0.01);
}


/* ══════════════════════════════════════════════════════════════════════════════
   SCHEDULER
   ══════════════════════════════════════════════════════════════════════════════ */

function scheduleNote(subIdx, time) {
  var p = currentPattern;
  var subsPerBeat = p.subdivisions / p.timeSignature[0];
  var isDownbeat = subIdx % subsPerBeat === 0;
  var beatNum = Math.floor(subIdx / subsPerBeat);

  if (isDownbeat) {
    playClick(time, beatNum === 0);
  }

  if (!isResponseBar) {
    var slot = p.pattern[subIdx];
    if (slot) playPatternSound(time, slot);
  }

  var delay = (time - getCtx().currentTime) * 1000;
  setTimeout(function () {
    currentSlot = subIdx;
    renderGrid();
    updateCRIndicator();
  }, Math.max(0, delay));
}

function advance() {
  var p = currentPattern;
  var secPerSub = (60 / bpm) / (p.subdivisions / p.timeSignature[0]);
  nextNoteTime += secPerSub;
  currentSubIdx++;
  if (currentSubIdx >= p.subdivisions) {
    currentSubIdx = 0;
    barCount++;
    if (mode === 'callresp') {
      if (isResponseBar) {
        isResponseBar = false;
        barCount = 0;
      } else if (barCount >= barsBeforeResp) {
        isResponseBar = true;
        barCount = 0;
      }
    }
  }
}

function scheduler() {
  var ctx = getCtx();
  while (nextNoteTime < ctx.currentTime + SCHED_AHEAD) {
    scheduleNote(currentSubIdx, nextNoteTime);
    advance();
  }
}


/* ══════════════════════════════════════════════════════════════════════════════
   TRANSPORT
   ══════════════════════════════════════════════════════════════════════════════ */

function startPlay() {
  var ctx = getCtx();
  currentSubIdx = 0;
  barCount = 0;
  isResponseBar = false;
  nextNoteTime = ctx.currentTime + 0.05;
  schedulerTimer = setInterval(scheduler, LOOK_MS);
  isPlaying = true;
  var btn = document.getElementById('playBtn');
  btn.textContent = '\u25A0';
  btn.classList.add('playing');
}

function stopPlay() {
  if (schedulerTimer) { clearInterval(schedulerTimer); schedulerTimer = null; }
  isPlaying = false;
  currentSlot = -1;
  isResponseBar = false;
  var btn = document.getElementById('playBtn');
  btn.textContent = '\u25B6';
  btn.classList.remove('playing');
  document.getElementById('crIndicator').textContent = '';
  renderGrid();
}

function togglePlay() {
  if (isPlaying) stopPlay(); else startPlay();
}

function updateCRIndicator() {
  if (mode !== 'callresp') return;
  var el = document.getElementById('crIndicator');
  if (isResponseBar) {
    el.innerHTML = '<span class="cr-response">Your turn \u2014 play!</span>';
  } else {
    el.innerHTML = '<span class="cr-call">Listen\u2026</span>';
  }
}


/* ══════════════════════════════════════════════════════════════════════════════
   KEYBOARD SHORTCUTS
   ══════════════════════════════════════════════════════════════════════════════ */

document.addEventListener('keydown', function (e) {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;
  if (e.key === ' ' || e.code === 'Space') { e.preventDefault(); togglePlay(); }
  else if (e.key === 't' || e.key === 'T') { tapTempo(); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); setBpm(bpm + 1); }
  else if (e.key === 'ArrowDown') { e.preventDefault(); setBpm(bpm - 1); }
  else if (e.key === 'ArrowRight') { e.preventDefault(); setBpm(bpm + 5); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); setBpm(bpm - 5); }
});


/* ══════════════════════════════════════════════════════════════════════════════
   INITIALISATION
   ══════════════════════════════════════════════════════════════════════════════ */

(function init() {
  var prefs = loadPrefs();

  /* Restore difficulty filter */
  if (prefs.difficulty !== undefined) {
    diffFilter = prefs.difficulty;
    document.querySelectorAll('.seg-btn').forEach(function (b) {
      b.classList.toggle('active', +b.dataset.diff === diffFilter);
    });
  }

  /* Restore genre */
  if (prefs.genre) {
    var genreSel = document.getElementById('genreSelect');
    if (genreSel) genreSel.value = prefs.genre;
  }

  /* Populate pattern list */
  filterPatterns();

  /* Restore selected pattern */
  if (prefs.pattern) {
    var sel = document.getElementById('patternSelect');
    var opts = sel.options;
    for (var i = 0; i < opts.length; i++) {
      if (opts[i].value === prefs.pattern) { sel.value = prefs.pattern; selectPattern(); break; }
    }
  }

  /* Restore BPM */
  if (prefs.bpm) setBpm(prefs.bpm);

  /* Restore mode */
  if (prefs.mode) setMode(prefs.mode);
  if (prefs.barsBeforeResp) setBarsBeforeResp(prefs.barsBeforeResp);

  /* Restore volumes */
  if (prefs.clickVol !== undefined) {
    clickVol = prefs.clickVol / 100;
    document.getElementById('clickVol').value = prefs.clickVol;
  }
  if (prefs.patternVol !== undefined) {
    patternVol = prefs.patternVol / 100;
    document.getElementById('patternVol').value = prefs.patternVol;
  }

  /* Apply theme mode */
  applyMode(loadTheme().mode || 'dark', true);

  renderGrid();
})();
