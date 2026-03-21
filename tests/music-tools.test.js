const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const scriptPath = path.join(__dirname, '..', 'src', 'js', 'music-tools.js');
const source = fs.readFileSync(scriptPath, 'utf8');

function createDocument() {
  let bodyMode = 'dark';
  let bodyAccent = '';
  const styleMap = new Map();
  const accentItems = [
    { dataset: { accent: 'pink' }, classList: createClassList() },
    { dataset: { accent: 'orange' }, classList: createClassList() },
    { dataset: { accent: 'teal' }, classList: createClassList() },
    { dataset: { accent: 'olive' }, classList: createClassList() },
  ];

  const accentDot = {
    style: {
      setProperty(name, value) {
        styleMap.set(`dot:${name}`, value);
      },
    },
  };

  const drop = {
    contains: () => false,
    classList: createClassList(),
  };

  const button = {
    contains: () => false,
    setAttribute(name, value) {
      styleMap.set(`button:${name}`, value);
    },
  };

  return {
    styleMap,
    accentItems,
    accentDot,
    drop,
    button,
    document: {
      body: {
        style: {
          setProperty(name, value) {
            styleMap.set(name, value);
          },
        },
        dataset: {
          get mode() {
            return bodyMode;
          },
          set mode(value) {
            bodyMode = value;
          },
          get accent() {
            return bodyAccent;
          },
          set accent(value) {
            bodyAccent = value;
          },
        },
      },
      getElementById(id) {
        if (id === 'accentDrop') return drop;
        if (id === 'accentDropBtn') return button;
        return null;
      },
      querySelector(selector) {
        if (selector === '.accent-drop-dot') return accentDot;
        return null;
      },
      querySelectorAll(selector) {
        if (selector === '.accent-drop-item') return accentItems;
        return [];
      },
      addEventListener() {},
    },
  };
}

function createClassList() {
  const classes = new Set();
  return {
    add(name) {
      classes.add(name);
    },
    remove(name) {
      classes.delete(name);
    },
    toggle(name, force) {
      if (typeof force === 'boolean') {
        if (force) classes.add(name);
        else classes.delete(name);
        return force;
      }
      if (classes.has(name)) {
        classes.delete(name);
        return false;
      }
      classes.add(name);
      return true;
    },
    contains(name) {
      return classes.has(name);
    },
  };
}

function createLocalStorage(initial = {}) {
  const store = new Map(Object.entries(initial));
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
  };
}

function loadMusicToolsHarness(initialStorage = {}) {
  const localStorage = createLocalStorage(initialStorage);
  const { document, styleMap, accentItems } = createDocument();
  const context = {
    console,
    JSON,
    Object,
    localStorage,
    document,
  };
  vm.createContext(context);
  vm.runInContext(source, context, { filename: 'music-tools.js' });
  return { context, localStorage, styleMap, accentItems };
}

test('loadTheme returns parsed theme object from localStorage', () => {
  const initial = { musicTools_theme_v1: JSON.stringify({ mode: 'light', accent: 'teal' }) };
  const { context } = loadMusicToolsHarness(initial);

  const theme = context.loadTheme();
  assert.deepEqual(theme, { mode: 'light', accent: 'teal' });
});

test('saveTheme stores a single key without removing existing values', () => {
  const initial = { musicTools_theme_v1: JSON.stringify({ mode: 'dark' }) };
  const { context, localStorage } = loadMusicToolsHarness(initial);

  context.saveTheme('accent', 'olive');

  assert.equal(
    localStorage.getItem('musicTools_theme_v1'),
    JSON.stringify({ mode: 'dark', accent: 'olive' })
  );
});

test('applyAccent uses orange fallback for unknown accent and persists requested name', () => {
  const { context, styleMap, localStorage, accentItems } = loadMusicToolsHarness();
  context.document.body.dataset.mode = 'dark';

  context.applyAccent('unknown-accent');

  assert.equal(styleMap.get('--accent'), '#FFB050');
  assert.equal(styleMap.get('--accent2'), '#FF6830');
  assert.equal(styleMap.get('dot:--sw'), '#FF6830');
  assert.equal(context.document.body.dataset.accent, 'unknown-accent');
  assert.equal(
    localStorage.getItem('musicTools_theme_v1'),
    JSON.stringify({ accent: 'unknown-accent' })
  );
  const activeCount = accentItems.filter((item) => item.classList.contains('active')).length;
  assert.equal(activeCount, 0);
});

test('applyAccent supports noSave flag and marks matching accent item as active', () => {
  const { context, styleMap, localStorage, accentItems } = loadMusicToolsHarness();
  context.document.body.dataset.mode = 'light';

  context.applyAccent('teal', true);

  assert.equal(styleMap.get('--accent'), '#007878');
  assert.equal(styleMap.get('--accent2'), '#009080');
  assert.equal(styleMap.get('dot:--sw'), '#00CCB8');
  assert.equal(context.document.body.dataset.accent, 'teal');
  assert.equal(localStorage.getItem('musicTools_theme_v1'), null);
  const activeAccents = accentItems
    .filter((item) => item.classList.contains('active'))
    .map((item) => item.dataset.accent);
  assert.deepEqual(activeAccents, ['teal']);
});
