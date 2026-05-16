#!/usr/bin/env node

import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const skillRoot = path.resolve(path.dirname(scriptPath), '..');
const templatesRoot = path.join(skillRoot, 'assets', 'templates');

const args = process.argv.slice(2);
const force = args.includes('--force') || args.includes('-f');
const positional = args.filter((arg) => arg !== '--force' && arg !== '-f');

if (positional.length > 1) {
  console.error('Usage: node init-rd-workflow.mjs [target-directory] [--force]');
  process.exit(1);
}

const targetRoot = path.resolve(positional[0] ?? process.cwd());
const workRoot = path.join(targetRoot, 'work');

function ensureDirectory(directoryPath) {
  mkdirSync(directoryPath, { recursive: true });
}

function copyTemplate(templateName, destinationRelativePath) {
  const sourcePath = path.join(templatesRoot, templateName);
  const destinationPath = path.join(targetRoot, destinationRelativePath);

  if (existsSync(destinationPath) && !force) {
    return false;
  }

  ensureDirectory(path.dirname(destinationPath));
  copyFileSync(sourcePath, destinationPath);
  return true;
}

ensureDirectory(targetRoot);
ensureDirectory(workRoot);
ensureDirectory(path.join(workRoot, '02-specialist-outputs'));

const results = [
  ['project-brief.md', copyTemplate('project-brief.md', 'project-brief.md')],
  ['work/00-lab-notes.md', copyTemplate('lab-notes.md', 'work/00-lab-notes.md')],
  ['work/01-orchestration-plan.md', copyTemplate('orchestration-plan.md', 'work/01-orchestration-plan.md')],
  ['work/03-team-collaboration.md', copyTemplate('team-collaboration.md', 'work/03-team-collaboration.md')],
  ['work/04-cross-review-notes.md', copyTemplate('cross-review-notes.md', 'work/04-cross-review-notes.md')],
  ['work/05-stage-gate-review.md', copyTemplate('stage-gate-review.md', 'work/05-stage-gate-review.md')]
];

for (const [filePath, created] of results) {
  console.log(`${created ? 'created' : 'kept'} ${filePath}`);
}

console.log('created work/02-specialist-outputs/');
console.log('skipped work/06-final-output.md until stage-gate approval');
