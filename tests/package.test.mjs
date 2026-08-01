import assert from 'node:assert/strict';
import test from 'node:test';
import path from 'node:path';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

import { validateRepository } from '../scripts/validate-repo.mjs';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EXCLUDED_ROOTS = new Set(['.git', '.venv', 'node_modules', 'work', 'coverage']);

function copyRepository() {
  const destination = mkdtempSync(path.join(tmpdir(), 'agentic-rd-repo-'));
  cpSync(repositoryRoot, destination, {
    recursive: true,
    filter: (source) => {
      const relative = path.relative(repositoryRoot, source);
      return relative === '' || !EXCLUDED_ROOTS.has(relative.split(path.sep)[0]);
    }
  });
  return destination;
}

test('repository package satisfies structural invariants', () => {
  assert.deepEqual(validateRepository(repositoryRoot), []);
});

test('release version drift is reported on every synchronized surface', (t) => {
  const root = copyRepository();
  t.after(() => rmSync(root, { recursive: true, force: true }));

  // The copy must be clean before drift is introduced, otherwise the assertions below
  // could pass for an unrelated reason.
  assert.deepEqual(validateRepository(root), []);

  const packagePath = path.join(root, 'package.json');
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
  packageJson.version = '9.9.9';
  writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);

  const failures = validateRepository(root);
  for (const surface of ['SKILL.md metadata version', 'CITATION.cff version', 'README version badge']) {
    assert.ok(
      failures.some((failure) => failure.startsWith(surface) && failure.includes('9.9.9')),
      `expected a drift failure for ${surface}, received: ${failures.join(' | ')}`
    );
  }
  assert.ok(
    failures.some((failure) => failure.includes('CHANGELOG.md must contain a dated')),
    `expected a missing changelog release failure, received: ${failures.join(' | ')}`
  );
});

test('a non-semantic package version is rejected', (t) => {
  const root = copyRepository();
  t.after(() => rmSync(root, { recursive: true, force: true }));

  const packagePath = path.join(root, 'package.json');
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
  packageJson.version = '1.1';
  writeFileSync(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`);

  assert.ok(validateRepository(root).includes('package.json version must be a semantic x.y.z string'));
});
