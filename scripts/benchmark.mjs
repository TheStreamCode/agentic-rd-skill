#!/usr/bin/env node

import { arch, cpus, platform, tmpdir, totalmem } from 'node:os';
import {
  mkdtempSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync
} from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { performance } from 'node:perf_hooks';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const skillRoot = path.join(repositoryRoot, 'skills', 'agentic-rd-skill');
const cliPath = path.join(skillRoot, 'scripts', 'rd.mjs');
const sampleCount = 15;
const limits = Object.freeze({
  packageBytes: 256 * 1024,
  initP95Ms: 750,
  statusP95Ms: 500,
  validateP95Ms: 750
});

function runCli(args) {
  const started = performance.now();
  const result = spawnSync(process.execPath, [cliPath, ...args], {
    cwd: repositoryRoot,
    encoding: 'utf8',
    windowsHide: true,
    maxBuffer: 2 * 1024 * 1024
  });
  const elapsedMs = performance.now() - started;
  if (result.status !== 0) {
    throw new Error(`CLI failed (${args.join(' ')}): ${(result.stderr || result.stdout).trim()}`);
  }
  return elapsedMs;
}

function writeFilled(workspace, relativePath, kilobytes = 1) {
  const destination = path.join(workspace, relativePath);
  mkdirSync(path.dirname(destination), { recursive: true });
  const paragraph = 'Observed evidence with a traceable source, explicit uncertainty, and a bounded recommendation.\n';
  const content = `# Filled artifact\n\n${paragraph.repeat(Math.max(1, Math.ceil((kilobytes * 1024) / paragraph.length)))}`;
  writeFileSync(destination, content, 'utf8');
}

function packageMetrics(directory) {
  let files = 0;
  let bytes = 0;
  const visit = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) visit(entryPath);
      else if (entry.isFile()) {
        files += 1;
        bytes += statSync(entryPath).size;
      }
    }
  };
  visit(directory);
  return { files, bytes };
}

function distribution(values) {
  const sorted = [...values].sort((left, right) => left - right);
  const percentile = (fraction) => sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * fraction) - 1)];
  return {
    samples: sorted.length,
    minMs: Number(sorted[0].toFixed(2)),
    meanMs: Number((sorted.reduce((total, value) => total + value, 0) / sorted.length).toFixed(2)),
    p50Ms: Number(percentile(0.5).toFixed(2)),
    p95Ms: Number(percentile(0.95).toFixed(2)),
    maxMs: Number(sorted.at(-1).toFixed(2))
  };
}

function buildRealisticWorkspace(workspace) {
  runCli(['init', workspace, '--profile', 'standard']);
  writeFilled(workspace, 'project-brief.md');
  writeFilled(workspace, 'work/00-run-log.md');

  runCli(['advance', workspace, '--phase', 'evidence', '--status', 'in_progress']);
  for (let index = 1; index <= 4; index += 1) {
    writeFilled(workspace, `work/01-evidence/${String(index).padStart(2, '0')}-evidence.md`, 10);
  }
  runCli(['advance', workspace, '--phase', 'evidence', '--status', 'complete']);

  runCli(['advance', workspace, '--phase', 'plan', '--status', 'in_progress']);
  writeFilled(workspace, 'work/02-plan.md', 5);
  runCli(['advance', workspace, '--phase', 'plan', '--status', 'complete']);

  runCli(['advance', workspace, '--phase', 'execution', '--status', 'in_progress']);
  for (let index = 1; index <= 4; index += 1) {
    writeFilled(workspace, `work/03-execution/${String(index).padStart(2, '0')}-execution.md`, 10);
  }
  runCli(['advance', workspace, '--phase', 'execution', '--status', 'complete']);

  runCli(['advance', workspace, '--phase', 'results', '--status', 'in_progress']);
  for (let index = 1; index <= 2; index += 1) {
    writeFilled(workspace, `work/04-results/${String(index).padStart(2, '0')}-results.md`, 10);
  }
  runCli(['advance', workspace, '--phase', 'results', '--status', 'complete']);

  runCli(['advance', workspace, '--phase', 'cross-review', '--status', 'in_progress']);
  writeFilled(workspace, 'work/05-cross-review.md', 5);
  runCli(['advance', workspace, '--phase', 'cross-review', '--status', 'complete']);
  runCli(['advance', workspace, '--phase', 'stage-gate', '--status', 'in_progress']);
  writeFilled(workspace, 'work/06-stage-gate.md', 3);
  runCli([
    'advance', workspace, '--phase', 'stage-gate', '--status', 'approved', '--score', '8',
    '--dimensions', '2,2,1,1,2', '--blockers', '0'
  ]);
  runCli(['finalize', workspace]);
  writeFilled(workspace, 'work/07-final-output.md', 8);
  runCli(['advance', workspace, '--phase', 'final', '--status', 'complete']);
}

const temporaryRoot = mkdtempSync(path.join(tmpdir(), 'agentic-rd-benchmark-'));
try {
  const initTimes = [];
  for (let index = 0; index < sampleCount; index += 1) {
    const workspace = path.join(temporaryRoot, `init-${index}`);
    mkdirSync(workspace);
    initTimes.push(runCli(['init', workspace, '--profile', 'standard']));
  }

  const realisticWorkspace = path.join(temporaryRoot, 'realistic-standard');
  mkdirSync(realisticWorkspace);
  buildRealisticWorkspace(realisticWorkspace);
  runCli(['status', realisticWorkspace]);
  runCli(['validate', realisticWorkspace]);

  const statusTimes = [];
  const validateTimes = [];
  for (let index = 0; index < sampleCount; index += 1) {
    statusTimes.push(runCli(['status', realisticWorkspace]));
    validateTimes.push(runCli(['validate', realisticWorkspace]));
  }

  const packageSize = packageMetrics(skillRoot);
  const results = {
    schemaVersion: 1,
    environment: {
      node: process.version,
      platform: platform(),
      architecture: arch(),
      cpu: cpus()[0]?.model ?? 'unknown',
      logicalCpus: cpus().length,
      memoryGiB: Number((totalmem() / 1024 ** 3).toFixed(1))
    },
    workload: {
      profile: 'standard',
      evidenceArtifacts: 4,
      executionArtifacts: 4,
      resultArtifacts: 2,
      approximateArtifactDataKiB: 126,
      samplesPerCommand: sampleCount,
      measurement: 'fresh Node.js process per command; one warm-up before status and validate samples'
    },
    package: packageSize,
    timings: {
      init: distribution(initTimes),
      status: distribution(statusTimes),
      validate: distribution(validateTimes)
    },
    limits,
    passed: false,
    failures: []
  };

  if (packageSize.bytes > limits.packageBytes) results.failures.push('packageBytes');
  if (results.timings.init.p95Ms > limits.initP95Ms) results.failures.push('initP95Ms');
  if (results.timings.status.p95Ms > limits.statusP95Ms) results.failures.push('statusP95Ms');
  if (results.timings.validate.p95Ms > limits.validateP95Ms) results.failures.push('validateP95Ms');
  results.passed = results.failures.length === 0;

  console.log(JSON.stringify(results, null, 2));
  if (!results.passed) process.exitCode = 1;
} finally {
  rmSync(temporaryRoot, { recursive: true, force: true });
}
