import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const smokePath = path.join(repositoryRoot, 'scripts', 'smoke-hosts.mjs');

test('host smoke reports an inconclusive non-success when zero checks execute', (t) => {
  const emptyPath = mkdtempSync(path.join(tmpdir(), 'agentic-rd-empty-path-'));
  t.after(() => rmSync(emptyPath, { recursive: true, force: true }));
  const result = spawnSync(process.execPath, [smokePath, '--host', 'copilot'], {
    cwd: repositoryRoot,
    encoding: 'utf8',
    windowsHide: true,
    env: { ...process.env, PATH: emptyPath, Path: emptyPath }
  });
  assert.equal(result.status, 3);
  assert.match(result.stdout, /skipped GitHub Copilot discovery/);
  assert.match(result.stderr, /inconclusive: zero checks executed/);
  assert.doesNotMatch(result.stdout, /smokes passed/);
});

test('host smoke rejects unknown host selectors', () => {
  const result = spawnSync(process.execPath, [smokePath, '--host', 'unknown'], {
    cwd: repositoryRoot,
    encoding: 'utf8',
    windowsHide: true
  });
  assert.equal(result.status, 2);
  assert.match(result.stderr, /Unknown host/);
});
