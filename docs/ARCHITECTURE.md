# Architecture Reference

## Tool structure

Each tool lives in `src/` as a single `.html` file:

1. `<head>` — links to `style/music-tools.css` (shared) and `style/<tool>.css` (tool-specific)
2. Modal overlays — help, score, history, etc.
3. `.theme-bar` — sticky chrome bar with nav, accent dropdown, mode toggle
4. `.content` wrapper — `<header>` + one or more `.card` sections
5. `.app-footer` — "made with ♥ by Paul van Zyl"
6. `<script src="js/music-tools.js">` — shared global theme utilities (loaded first)
7. `<script src="js/<tool>.js">` — all tool-specific JS

The `index.html` landing page is at the repo root and has its own inline `<style>` block
(it does not import `music-tools.css`) but duplicates the tokens and key component styles
it needs. It also loads `src/js/music-tools.js`.

## Shared JS — `src/js/music-tools.js`

Loaded by every tool and the index page. Provides:

- `THEME_KEY` — `'musicTools_theme_v1'` — the single global localStorage key
- `loadTheme()` / `saveTheme(k, v)` — read/write the global theme object
- `ACCENT_PRESETS` — colour maps for pink / orange / teal / olive in both modes
- `ACCENT_DOT_COLORS` — vivid swatch colours for the dropdown trigger dot
- `applyAccent(name, noSave)` — applies CSS vars to `<body>`, updates dropdown state
- Delegated `document` click listener — handles accent dropdown open/close/select

## Global theme persistence

Mode (light/dark) and accent colour are stored together in one localStorage entry:

```js
// key: 'musicTools_theme_v1'
{ "mode": "dark", "accent": "orange" }
```

Setting mode or accent in any tool or on the index page is immediately reflected when
navigating to another tool, because every `init()` reads from this shared key.

Per-tool preferences (root note, BPM, session blocks, etc.) continue to use each tool's
own unique localStorage key.

## Mode switching pattern (every tool JS)

```js
function applyMode(m, noSave) {
  document.body.dataset.mode = m;
  const badge = document.getElementById('modeBadge');
  if (badge) badge.textContent = m === 'dark' ? 'DARK' : 'LIGHT';
  if (!noSave) saveTheme('mode', m);
  // Re-apply accent vars because each preset has mode-specific values
  applyAccent(document.body.dataset.accent || loadTheme().accent || 'orange', true);
}
```

Default mode: `'dark'`. Default accent: `'orange'`.

## Audio engine (identical in every tool JS)

```js
let audioCtx = null;
function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}
```

Always call `getCtx()` inside a user-gesture handler — never at module load time.

## Per-tool localStorage pattern

```js
const LS = 'uniqueToolKey_v1';  // unique per tool — see CLAUDE.md for the list
function savePref(k, v) {
  try { const d = JSON.parse(localStorage.getItem(LS) || '{}'); d[k] = v; localStorage.setItem(LS, JSON.stringify(d)); } catch(e) {}
}
function loadPrefs() {
  try { return JSON.parse(localStorage.getItem(LS) || '{}'); } catch(e) { return {}; }
}
```

## Design token system — Stasis v3 two-mode

Tokens are defined in `src/style/music-tools.css` under `[data-mode="light"]` and
`[data-mode="dark"]` selectors. The index page duplicates the subset it needs inline.

### Key colour tokens

| Token | Light | Dark | Usage |
|---|---|---|---|
| `--text` | `#0A1220` | `#D8E8F8` | Primary body text |
| `--text-2` | `#344A68` | `#8AA0C0` | Secondary / supporting text |
| `--text-3` | `#7088A8` | `#5A7898` | Muted / caption text; aliased as `--muted` |
| `--text-hi` | `#2e5075` | `#9dbada` | Section headings, control labels, tags — brighter/darker than muted |
| `--accent` | `#0080C0` | `#00D8FF` | Primary interactive colour (overridden by accent preset inline styles) |
| `--accent-2` | `#C0006E` | `#FF2688` | Secondary accent (overridden by preset); aliased as `--accent2` |
| `--bg` | `#EAEDF5` | `#080A0F` | Page background |
| `--surface` | `#F3F5FC` | `#0D1019` | Card / panel background |

### Accent colour presets

Four presets (pink, orange, teal, olive) override `--accent`, `--accent2`, and their
`-glow` variants as inline `body` styles via `applyAccent()`. This means the inline
style always wins over the stylesheet. The overrides happen per-mode so switching
light ↔ dark immediately re-applies the correct set of values.

**Default accent: orange** (stored in `musicTools_theme_v1`).

### Typography

- Headings: `'Syne'` (`--font-h`)
- Body / mono: `'DM Mono'` (`--font-b`)
- Both loaded from Google Fonts; degrade to system-sans / system-mono offline

## CSS component vocabulary

| Class / pattern | Description |
|---|---|
| `.card` + `.card-title` | Main content containers; title uses `--text-hi` |
| `.controls` + `.control-group > label` | Config grid; labels use `--text-hi` |
| `.btn-primary` / `.btn-secondary` / `.btn-accent2` / `.btn-danger` | Action buttons |
| `.toggle-label` + `.toggle-track` + `.toggle-thumb` | Boolean toggles |
| `.modal-overlay.show` > `.modal-card` + `.modal-close` | Modal system |
| `.theme-bar` > `.bar-left` + `.bar-right` | Sticky chrome bar |
| `.bar-icon-btn` / `.bar-sep` / `.bar-title` | Bar child elements |
| `.accent-drop` + `.accent-drop-btn` + `.accent-drop-panel` | Accent colour dropdown |
| `.mode-toggle` + `.mode-badge` | Light/dark toggle pill |
| `.progress-wrap` > `.progress-track` > `.progress-fill` | Gradient progress bars |
| `.vis-tab` / `.vis-panel` | Tabbed visualiser switching |
| `.doc-header` / `.doc-sub` / `.doc-body` | Help modal typography |

## Modal system

```js
function openModal(id)  { document.getElementById(id).classList.add('show');    document.body.style.overflow = 'hidden'; }
function closeModal(id) { document.getElementById(id).classList.remove('show'); document.body.style.overflow = ''; }
```

Click-outside-to-close is wired on every `.modal-overlay`. Score/complete overlays
that require an explicit button dismiss skip the outside-click listener.

## Music data constants (shared reference)

```js
const NOTES    = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const ENH      = {'C#':'Db','D#':'Eb','F#':'Gb','G#':'Ab','A#':'Bb'};
const midiFreq = m => 440 * Math.pow(2, (m - 69) / 12);
const noteFreq = (note, oct) => midiFreq((oct + 1) * 12 + NOTES.indexOf(note));
const noteToMidi = (note, oct) => (oct + 1) * 12 + NOTES.indexOf(note);
```

## Instrument tuning data

**Guitar** — Standard, Drop D, Open G, Open D, Open E, Open A, DADGAD, Half Step Down
**Bass** — Standard, Drop D, 5-String, Half Step Down
**Ukulele** — Soprano GCEA, Low G, Baritone, D Tuning, Open C
