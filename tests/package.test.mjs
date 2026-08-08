import assert from 'node:assert/strict';
import test from 'node:test';
import path from 'node:path';
import { cpSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

import { validateRepository } from '../scripts/validate-repo.mjs';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const INCLUDED_ROOTS = new Set([
  '.editorconfig',
  '.gitattributes',
  '.github',
  '.gitignore',
  'AGENTS.md',
  'assets',
  'CHANGELOG.md',
  'CITATION.cff',
  'CODE_OF_CONDUCT.md',
  'CONTRIBUTING.md',
  'evals',
  'LICENSE',
  'package.json',
  'README.md',
  'RELEASING.md',
  'requirements-validation.txt',
  'scripts',
  'SECURITY.md',
  'skills',
  'tests'
]);

function copyRepository() {
  const destination = mkdtempSync(path.join(tmpdir(), 'agentic-rd-repo-'));
  cpSync(repositoryRoot, destination, {
    recursive: true,
    filter: (source) => {
      const relative = path.relative(repositoryRoot, source);
      return relative === '' || INCLUDED_ROOTS.has(relative.split(path.sep)[0]);
    }
  });
  return destination;
}

test('repository package satisfies structural invariants', () => {
  assert.deepEqual(validateRepository(repositoryRoot), []);
});

test('every GitHub Actions workflow must pin actions to full commit SHAs', (t) => {
  const root = copyRepository();
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const workflowDirectory = path.join(root, '.github', 'workflows');
  const unpinnedCases = new Map([
    ['block.yml', 'steps:\n  - uses: actions/checkout@main\n'],
    ['quoted.yml', 'steps:\n  - \'uses\': "actions/checkout@main"\n'],
    ['flow.yml', 'steps: [{ name: checkout, "uses": actions/checkout@main }]\n'],
    ['indirect.yml', 'steps:\n  - uses: *checkout-action\n']
  ]);
  for (const [name, content] of unpinnedCases) {
    const workflowPath = path.join(workflowDirectory, name);
    writeFileSync(workflowPath, content);
    assert.ok(
      validateRepository(root).includes(`.github/workflows/${name} must pin actions to full commit SHAs`),
      `expected unpinned action detection for ${name}`
    );
    rmSync(workflowPath);
  }

  const sha = '3d3c42e5aac5ba805825da76410c181273ba90b1';
  const safePath = path.join(workflowDirectory, 'safe-syntax.yml');
  writeFileSync(
    safePath,
    `steps:\n  - 'uses': "actions/checkout@${sha}"\n  - { uses: actions/checkout@${sha} }\n  - uses: ./local-action\n  - uses: docker://alpine:3.22\n  - run: 'echo "{ uses: actions/checkout@main }"'\n  # uses: actions/checkout@main\n`
  );
  assert.equal(
    validateRepository(root).some((failure) => failure.startsWith('.github/workflows/safe-syntax.yml ')),
    false
  );
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

test('malformed package metadata is reported without crashing validation', (t) => {
  const root = copyRepository();
  t.after(() => rmSync(root, { recursive: true, force: true }));

  writeFileSync(path.join(root, 'package.json'), '{ invalid json\n');

  assert.ok(validateRepository(root).some((failure) => failure.startsWith('Invalid package.json:')));
});

test('repository Markdown validation does not follow symlinked directories', (t) => {
  const root = copyRepository();
  const outside = mkdtempSync(path.join(tmpdir(), 'agentic-rd-docs-outside-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  t.after(() => rmSync(outside, { recursive: true, force: true }));
  writeFileSync(path.join(outside, 'external.md'), '[broken external link](missing.md)\n');

  try {
    symlinkSync(outside, path.join(root, 'linked-docs'), 'dir');
  } catch (error) {
    if (error.code === 'EPERM' || error.code === 'EACCES' || error.code === 'UNKNOWN') {
      t.skip(`symlink creation unavailable: ${error.code}`);
      return;
    }
    throw error;
  }

  assert.deepEqual(validateRepository(root), []);
});
