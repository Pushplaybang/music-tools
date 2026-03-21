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

// Vivid representative swatch colors (used in the dropdown trigger dot).
// These are the dark-mode accent2 values — always vivid regardless of page mode.
const ACCENT_DOT_COLORS = {
  pink:   '#FF2688',
  orange: '#FF6830',
  teal:   '#00CCB8',
  olive:  '#C4E020',
};

/**
 * Applies an accent preset to the page.
 * Sets CSS custom properties as inline styles on <body> (overriding the
 * stylesheet), updates the dropdown trigger dot and active item, and
 * persists the choice globally.
 * Must be called AFTER the mode is already set on body so the correct
 * light/dark colour values are used.
 */
function applyAccent(name, noSave) {
  const mode   = document.body.dataset.mode || 'dark';
  const preset = ACCENT_PRESETS[name] || ACCENT_PRESETS.orange;
  const vars   = preset[mode] || preset.dark;
  Object.entries(vars).forEach(([k, v]) => document.body.style.setProperty(k, v));
  document.body.dataset.accent = name;

  // Update the trigger button's colour dot
  const dot = document.querySelector('.accent-drop-dot');
  if (dot) dot.style.setProperty('--sw', ACCENT_DOT_COLORS[name] || ACCENT_DOT_COLORS.orange);

  // Mark the active item in the dropdown panel
  document.querySelectorAll('.accent-drop-item').forEach(item =>
    item.classList.toggle('active', item.dataset.accent === name));

  if (!noSave) saveTheme('accent', name);
}

// ── Accent dropdown interaction ────────────────────────────────────
// Uses a single delegated listener on document so it works whether the
// dropdown is opened or closed, and handles outside-click to dismiss.

document.addEventListener('click', function(e) {
  const drop = document.getElementById('accentDrop');
  if (!drop) return;
  const btn = document.getElementById('accentDropBtn');

  // Click on a menu item → apply accent and close
  const item = e.target.closest('.accent-drop-item');
  if (item && drop.contains(item)) {
    applyAccent(item.dataset.accent);
    drop.classList.remove('open');
    if (btn) btn.setAttribute('aria-expanded', 'false');
    return;
  }

  // Click on the toggle button → flip open/closed
  if (btn && (e.target === btn || btn.contains(e.target))) {
    const isOpen = drop.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(isOpen));
    return;
  }

  // Click anywhere else → close
  if (!drop.contains(e.target)) {
    drop.classList.remove('open');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }
});
