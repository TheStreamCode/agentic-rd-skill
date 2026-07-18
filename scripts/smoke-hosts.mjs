#!/usr/bin/env node

import { cpSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const repositoryRoot = path.resolve(path.dirname(scriptPath), '..');
const skillSource = path.join(repositoryRoot, 'skills', 'agentic-rd-skill');
const runModelSmokes = process.argv.includes('--model-smokes');
const hostOptionIndex = process.argv.indexOf('--host');
const selectedHost = hostOptionIndex === -1 ? null : process.argv[hostOptionIndex + 1];
const validHosts = new Set(['codex', 'claude', 'copilot', 'opencode']);
if (selectedHost && !validHosts.has(selectedHost)) {
  console.error(`Unknown host: ${selectedHost}`);
  process.exit(2);
}
const workspace = mkdtempSync(path.join(tmpdir(), 'agentic-rd-host-smoke-'));
const failures = [];
const skipped = [];

function stripAnsi(value) {
  return value.replace(/\u001B\[[0-?]*[ -/]*[@-~]/g, '');
}

function run(command, args, options = {}) {
  let executable = command;
  let executableArgs = args;
  if (process.platform === 'win32' && command === 'codex') {
    executable = process.execPath;
    executableArgs = [path.join(path.dirname(process.execPath), 'node_modules', '@openai', 'codex', 'bin', 'codex.js'), ...args];
  } else if (process.platform === 'win32' && command === 'copilot') {
    executable = 'copilot.exe';
  }
  return spawnSync(executable, executableArgs, {
    cwd: options.cwd ?? workspace,
    encoding: 'utf8',
    windowsHide: true,
    timeout: options.timeout ?? 60_000,
    maxBuffer: 2 * 1024 * 1024,
    env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0', ...options.env }
  });
}

function commandAvailable(command) {
  const result = run(command, ['--version'], { timeout: 10_000 });
  return !result.error && result.status === 0;
}

function record(name, result, expectedPattern) {
  const output = stripAnsi(`${result.stdout ?? ''}\n${result.stderr ?? ''}`);
  if (result.error) {
    failures.push(`${name}: ${result.error.message}`);
    return;
  }
  if (result.status !== 0) {
    failures.push(`${name}: exited ${result.status}: ${output.trim().slice(0, 800)}`);
    return;
  }
  if (!expectedPattern.test(output)) {
    failures.push(`${name}: expected discovery marker not found: ${output.trim().slice(0, 800)}`);
    return;
  }
  console.log(`passed ${name}`);
}

function installWorkspaceSkill(relativeRoot) {
  const destination = path.join(workspace, relativeRoot, 'agentic-rd-skill');
  mkdirSync(path.dirname(destination), { recursive: true });
  cpSync(skillSource, destination, { recursive: true });
}

function includesHost(host) {
  return selectedHost === null || selectedHost === host;
}

try {
  installWorkspaceSkill(path.join('.agents', 'skills'));
  installWorkspaceSkill(path.join('.claude', 'skills'));
  run('git', ['init', '--quiet']);

  if (includesHost('copilot') && commandAvailable('copilot')) {
    record('GitHub Copilot discovery', run('copilot', ['-C', workspace, 'skill', 'list']), /agentic-rd-skill/i);
  } else if (includesHost('copilot')) {
    skipped.push('GitHub Copilot discovery: command not installed');
  }

  if (includesHost('opencode') && commandAvailable('opencode')) {
    record('OpenCode discovery', run('opencode', ['debug', 'skill', '--pure']), /agentic-rd-skill/i);
  } else if (includesHost('opencode')) {
    skipped.push('OpenCode discovery: command not installed');
  }

  if (runModelSmokes) {
    const expected = /DISCOVERED\s+agentic-rd-skill\s+1\.0\.0/i;
    const genericPrompt =
      'Activate the workspace skill named agentic-rd-skill. Do not create or edit files, run scripts, or research the web. Read only the activated skill metadata and return exactly: DISCOVERED agentic-rd-skill 1.0.0';

    if (includesHost('codex') && commandAvailable('codex')) {
      record(
        'Codex activation',
        run('codex', [
          'exec', '--ephemeral', '--skip-git-repo-check', '--sandbox', 'read-only', '-C', workspace,
          '$agentic-rd-skill ' + genericPrompt
        ]),
        expected
      );
    } else if (includesHost('codex')) {
      skipped.push('Codex activation: command not installed');
    }

    if (includesHost('claude') && commandAvailable('claude')) {
      record(
        'Claude Code activation',
        run('claude', [
          '-p', `/agentic-rd-skill ${genericPrompt}`, '--allowedTools', 'Read', '--effort', 'low',
          '--model', 'haiku', '--max-budget-usd', '0.50', '--no-session-persistence', '--output-format', 'text'
        ]),
        expected
      );
    } else if (includesHost('claude')) {
      skipped.push('Claude Code activation: command not installed');
    }

    if (includesHost('copilot') && commandAvailable('copilot')) {
      record(
        'GitHub Copilot activation',
        run('copilot', [
          '-C', workspace, '-p', `/agentic-rd-skill ${genericPrompt}`, '--allow-tool=read',
          '--available-tools=read', '--max-ai-credits', '30', '--silent',
          '--no-custom-instructions', '--no-remote', '--no-remote-export', '--disable-builtin-mcps'
        ]),
        expected
      );
    }

    if (includesHost('opencode') && commandAvailable('opencode')) {
      record(
        'OpenCode activation',
        run('opencode', ['run', '--pure', '--agent', 'plan', genericPrompt]),
        expected
      );
    }
  }
} finally {
  rmSync(workspace, { recursive: true, force: true });
}

for (const message of skipped) console.log(`skipped ${message}`);
if (failures.length > 0) {
  console.error('Host smoke failures:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log(runModelSmokes ? 'Host discovery and activation smokes passed.' : 'Host discovery smokes passed.');
