import assert from 'node:assert/strict';
import test from 'node:test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { validateRepository } from '../scripts/validate-repo.mjs';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('repository package satisfies structural invariants', () => {
  assert.deepEqual(validateRepository(repositoryRoot), []);
});
