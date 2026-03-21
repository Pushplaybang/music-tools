const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const workflowPath = path.join(__dirname, '..', '.github', 'workflows', 'dist-web.yml');
const source = fs.readFileSync(workflowPath, 'utf8');

test('dist-web workflow runs on main pushes and copies src into dist-web', () => {
  assert.match(source, /push:\n\s+branches: \[main\]/);
  assert.match(source, /cp -R src\/. dist-web\//);
});

test('dist-web workflow minifies JS and CSS files in place', () => {
  assert.match(source, /find dist-web -type f -name '\*\.js'/);
  assert.match(source, /npx terser/);
  assert.match(source, /find dist-web -type f -name '\*\.css'/);
  assert.match(source, /npx cleancss/);
});

test('dist-web workflow preserves HTML by copying the whole src tree', () => {
  assert.doesNotMatch(source, /-name '\*\.html'.*minify/i);
  assert.match(source, /Upload dist-web artifact/);
});
