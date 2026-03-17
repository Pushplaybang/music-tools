# Music Tools Suite

## What this is
Browser-based music practice tools for everyday use. Each tool is a single self-contained HTML file — no build step, no backend, no npm runtime dependencies, no CDN libraries. Web Audio API for all sound. Fully offline after first load (Google Fonts degrade gracefully to system fonts).

## Hard constraints — NEVER violate these
- Every tool is ONE `.html` file in `src/` containing HTML and JS inline, linking to `music-tools.css` for shared styles
- All shared CSS lives in `music-tools.css` — never duplicate token blocks in tool HTML
- Tool HTML `<style>` blocks contain ONLY tool-specific CSS
- Zero runtime dependencies. No npm imports, no CDN scripts, no frameworks
- No user data collection, no analytics, no cookies, no server communication
- All persistent state via localStorage only — each tool uses a unique LS key
- Tools must work offline after first page load
- All audio through Web Audio API using the shared getCtx() pattern

## Repository structure
music-tools/
├── CLAUDE.md              ← You are here. Claude Code reads this automatically.
├── music-tools.css        # Shared design system (tokens, components, chrome)
├── index.html             # Collection home/landing page
├── src/
│   ├── ear-trainer.html   # LS key: earTrainer_v6
│   ├── tuner.html         # LS key: musicTool_StrobeTuner_v1
│   ├── pulse.html         # LS key: musicTool_pulse_v1
│   ├── drone.html         # LS key: musicTool_drone_v1
│   ├── practice-timer.html # LS key: musicTool_practiceTimer_v1
│   └── chord-reference.html # LS key: musicTool_chordRef_v1
├── music-tools-boilerplate.html  # Design system reference (read-only, not served as a tool)
├── docs/
│   ├── ARCHITECTURE.md    # Shared patterns, audio engine, theme system
│   ├── ear-trainer.md
│   ├── instrument-tuner.md
│   ├── pulse.md
│   ├── drone.md
│   ├── practice-timer.md
│   └── chord-reference.md
├── server.js              # Dev server (node server.js)
├── package.json
└── README.md

## Design system — Stasis v3 two-mode (light / dark)
Two-mode token system using `[data-mode="light"]` and `[data-mode="dark"]` selectors.
Fonts: Syne (headings) + DM Mono (body/mono). Tokens defined in `music-tools.css`.

See music-tools-boilerplate.html for the canonical reference. NEVER hardcode colours — always use CSS custom properties. After ANY CSS change, verify both modes render correctly.

## Shared code patterns

### Audio engine (identical in every tool)
let audioCtx = null;
function getCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

### localStorage (unique LS key per tool)
const LS = 'uniqueToolKey_v1';
function savePref(k, v) {
  try { const d = JSON.parse(localStorage.getItem(LS) || '{}'); d[k] = v; localStorage.setItem(LS, JSON.stringify(d)); } catch(e) {}
}
function loadPrefs() {
  try { return JSON.parse(localStorage.getItem(LS) || '{}'); } catch(e) { return {}; }
}

### Mode switching
function applyMode(m, noSave) {
  document.body.dataset.mode = m;
  const badge = document.getElementById('modeBadge');
  if (badge) badge.textContent = m === 'dark' ? 'DARK' : 'LIGHT';
  if (!noSave) savePref('mode', m);
}

### Music data constants
const NOTES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const ENH = {'C#':'Db','D#':'Eb','F#':'Gb','G#':'Ab','A#':'Bb'};
const midiFreq = m => 440 * Math.pow(2, (m - 69) / 12);
const noteFreq = (note, oct) => midiFreq((oct + 1) * 12 + NOTES.indexOf(note));
const noteToMidi = (note, oct) => (oct + 1) * 12 + NOTES.indexOf(note);

## CSS component vocabulary
- `.card` with `.card-title` — main content containers
- `.controls` grid — config dropdowns (`.control-group > label + select`)
- `.btn-primary` / `.btn-secondary` / `.btn-accent2` / `.btn-danger`
- `.toggle-label` with hidden checkbox + `.toggle-track` / `.toggle-thumb`
- `.modal-overlay.show` > `.modal-card` with `.modal-close`
- `.theme-bar` > `.bar-left` + `.bar-right` with `.bar-icon-btn`, `.bar-sep`
- `.mode-toggle` + `.mode-badge` — light/dark mode switcher
- `.progress-wrap` > `.progress-track` > `.progress-fill` — gradient progress bars
- `.vis-tab` / `.vis-panel` — tabbed visualiser switching

## Responsive rules
- Minimum usable width: 320px. Primary mobile test width: 375px
- CSS Grid breakpoints: 3+ cols → 2-col at 600px → 1-col at 380px
- Touch targets: minimum 44×44px
- Mode toggle replaces former 5-pill theme switcher
- Horizontal scroll OK for piano and fretboards

## Git & commit conventions — ALWAYS follow these

All commits **must** use [Conventional Commits](https://www.conventionalcommits.org/) format:

```
type(scope): short description
```

**Valid types** (CI enforced): `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

**Valid scopes** (optional): `ear-trainer`, `tuner`, `pulse`, `chord-ref`, `rhythm`, `progressions`, `practice-timer`, `drone`, `practice-guide`, `songbook`, `server`, `ci`

**Examples:**
- `feat(ear-trainer): add melodic interval drill mode`
- `fix(tuner): correct A4 reference frequency default`
- `docs: update architecture overview`
- `chore: bump dev server port`

**Breaking changes** — append `!` before the colon:
- `feat(pulse)!: remove legacy BPM tap API`

**Why this matters:**
- `commit-lint.yml` validates every commit in every PR — non-conventional messages will fail CI and block merge.
- `release.yml` uses commit types to determine the semver bump (`feat` → minor, `feat!`/`fix!` → major, everything else → patch) and generates release notes from commit subjects on every merge to `main`.

Non-conventional commits that somehow reach `main` will not break the release workflow — they are treated as patch-level changes and appear verbatim in the release notes. The CI gate on PRs is the primary enforcement mechanism.

## Testing checklist (verify before completing ANY task)
1. Both light and dark modes render correctly
2. Mobile layout at 375px width — no horizontal overflow, no tiny touch targets
3. localStorage save/restore round-trips correctly
4. Audio plays (getCtx() resumes suspended context on user gesture)
5. No console errors
6. Help modal content matches actual current features exactly (no removed features referenced)
7. CSS file loads correctly via relative path (test from file:// and localhost)

## Documentation maintenance — ALWAYS keep these in sync
When adding new tools, features, or making significant changes:
- **README.md** — Update the tools table, project structure tree, and any affected descriptions
- **CLAUDE.md** — Update the repository structure listing (including LS keys for new tools)
- **index.html** — Add tool card, update grid layout if needed, add docs link to the links bar
- **docs/** — Create or update the per-tool documentation file (e.g. `docs/tool-name.md`)

These files must stay accurate as we continue to iterate. A stale README or CLAUDE.md leads to confusion and errors in future development.
