const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const instructionsPath = path.join(__dirname, '..', '.github', 'copilot-instructions.md');

test('copilot instructions require conventional commits with allowed repository types', () => {
  const content = fs.readFileSync(instructionsPath, 'utf8');

  assert.match(content, /Conventional Commits format/i);
  assert.match(content, /type\(scope\): description/);
  assert.match(
    content,
    /feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`/
  );
});
