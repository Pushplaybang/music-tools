// ══════════════════════════════════════════════════════════════════
// GLOBAL THEME UTILITIES
// Shared across all tools. Handles cross-page mode (light/dark) and
// accent colour persistence via a single shared localStorage key so
// a preference set in one tool is immediately reflected in all others.
// ══════════════════════════════════════════════════════════════════

const THEME_KEY = 'musicTools_theme_v1';

/** Reads the global theme object from localStorage. */
function loadTheme() {
  try { return JSON.parse(localStorage.getItem(THEME_KEY) || '{}'); } catch(e) { return {}; }
}

/** Writes one key/value pair into the global theme object. */
function saveTheme(k, v) {
  try {
    const d = loadTheme();
    d[k] = v;
    localStorage.setItem(THEME_KEY, JSON.stringify(d));
  } catch(e) {}
}

// ── Accent colour presets ──────────────────────────────────────────
// Each preset defines --accent, --accent2, and their glow variants
// for both light and dark modes. Inline styles set on <body> override
// the stylesheet values so no CSS changes are needed per-preset.

const ACCENT_PRESETS = {
  pink: {
    light: { '--accent': '#0080C0', '--accent2': '#C0006E', '--accent-glow': 'rgba(0,128,192,0.22)',   '--accent2-glow': 'rgba(192,0,110,0.18)'  },
    dark:  { '--accent': '#00D8FF', '--accent2': '#FF2688', '--accent-glow': 'rgba(0,216,255,0.28)',   '--accent2-glow': 'rgba(255,38,136,0.24)'  },
  },
  orange: {
    light: { '--accent': '#A05800', '--accent2': '#D44200', '--accent-glow': 'rgba(160,88,0,0.22)',    '--accent2-glow': 'rgba(212,66,0,0.18)'    },
    dark:  { '--accent': '#FFB050', '--accent2': '#FF6830', '--accent-glow': 'rgba(255,176,80,0.28)',  '--accent2-glow': 'rgba(255,104,48,0.24)'  },
  },
  teal: {
    light: { '--accent': '#007878', '--accent2': '#009080', '--accent-glow': 'rgba(0,120,120,0.22)',   '--accent2-glow': 'rgba(0,144,128,0.18)'   },
    dark:  { '--accent': '#20E0D8', '--accent2': '#00CCB8', '--accent-glow': 'rgba(32,224,216,0.28)',  '--accent2-glow': 'rgba(0,204,184,0.24)'   },
  },
  olive: {
    light: { '--accent': '#5A7000', '--accent2': '#748C00', '--accent-glow': 'rgba(90,112,0,0.22)',    '--accent2-glow': 'rgba(116,140,0,0.18)'   },
    dark:  { '--accent': '#A8C800', '--accent2': '#C4E020', '--accent-glow': 'rgba(168,200,0,0.28)',   '--accent2-glow': 'rgba(196,224,32,0.24)'  },
  },
};

/**
 * Applies an accent preset to the page.
 * Sets CSS custom properties as inline styles on <body> (overriding the
 * stylesheet), marks the active swatch, and persists the choice globally.
 * Must be called AFTER the mode is already set on body so the correct
 * light/dark colour values are used.
 */
function applyAccent(name, noSave) {
  const mode   = document.body.dataset.mode || 'light';
  const preset = ACCENT_PRESETS[name] || ACCENT_PRESETS.pink;
  const vars   = preset[mode] || preset.light;
  Object.entries(vars).forEach(([k, v]) => document.body.style.setProperty(k, v));
  document.body.dataset.accent = name;
  document.querySelectorAll('.accent-swatch').forEach(s => s.classList.toggle('active', s.dataset.accent === name));
  if (!noSave) saveTheme('accent', name);
}

// Wire up swatch click handlers for whichever swatches are on this page
document.querySelectorAll('.accent-swatch').forEach(s => {
  s.addEventListener('click', () => applyAccent(s.dataset.accent));
});
