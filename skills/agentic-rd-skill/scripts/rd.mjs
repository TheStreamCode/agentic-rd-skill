#!/usr/bin/env node

import {
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync
} from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const EXIT = Object.freeze({ SUCCESS: 0, USAGE: 2, STATE: 3, FILESYSTEM: 4 });
const PROFILE_LIMITS = Object.freeze({
  compact: { maxSpecialists: 1, maxConcurrent: 1, maxWaves: 1 },
  standard: { maxSpecialists: 4, maxConcurrent: 4, maxWaves: 2 },
  extended: { maxSpecialists: 6, maxConcurrent: 6, maxWaves: 3 }
});
const PHASES = Object.freeze([
  'setup',
  'evidence',
  'plan',
  'execution',
  'results',
  'crossReview',
  'stageGate',
  'final'
]);
const PHASE_LABELS = Object.freeze({
  setup: 'Setup',
  evidence: 'Evidence',
  plan: 'Plan',
  execution: 'Execution',
  results: 'Results',
  crossReview: 'Cross-review',
  stageGate: 'Stage gate',
  final: 'Final synthesis'
});
const PHASE_ALIASES = Object.freeze({
  'cross-review': 'crossReview',
  'stage-gate': 'stageGate'
});
const PHASE_START_ARTIFACTS = Object.freeze({
  evidence: ['evidence.md', 'work/01-evidence/01-evidence.md'],
  plan: ['plan.md', 'work/02-plan.md'],
  execution: ['execution.md', 'work/03-execution/01-execution.md'],
  results: ['results.md', 'work/04-results/01-results.md'],
  crossReview: ['cross-review.md', 'work/05-cross-review.md'],
  stageGate: ['stage-gate.md', 'work/06-stage-gate.md']
});
const NORMAL_STATUSES = new Set(['pending', 'in_progress', 'complete', 'needs_revision', 'blocked']);
const GATE_STATUSES = new Set(['pending', 'in_progress', 'approved', 'needs_revision', 'blocked']);
const FINAL_STATUSES = new Set(['pending', 'in_progress', 'complete', 'blocked']);
const PLACEHOLDER_PATTERN = /\{\{[^}]+\}\}/;

const scriptPath = fileURLToPath(import.meta.url);
const skillRoot = path.resolve(path.dirname(scriptPath), '..');
const assetsRoot = path.join(skillRoot, 'assets');

class CliError extends Error {
  constructor(message, exitCode) {
    super(message);
    this.exitCode = exitCode;
  }
}

function printUsage() {
  console.log(`Agentic R&D workflow CLI

Usage:
  rd.mjs init [target] [--profile compact|standard|extended] [--dry-run]
  rd.mjs status [target] [--json]
  rd.mjs advance [target] --phase <evidence|plan|execution|results|cross-review|stage-gate|final> --status <status> [--score N] [--dimensions 2,2,1,1,2] [--blockers N] [--reason text]
  rd.mjs validate [target] [--json]
  rd.mjs finalize [target]

Exit codes: 0 success, 2 usage, 3 workflow state, 4 filesystem/safety.`);
}

function parseArguments(tokens, optionSchema) {
  const options = {};
  const positional = [];

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (!token.startsWith('--')) {
      positional.push(token);
      continue;
    }

    const optionName = token.slice(2);
    const optionType = optionSchema[optionName];
    if (!optionType) {
      throw new CliError(`Unknown option: --${optionName}`, EXIT.USAGE);
    }

    if (optionType === 'boolean') {
      options[optionName] = true;
      continue;
    }

    const value = tokens[index + 1];
    if (value === undefined || value.startsWith('--')) {
      throw new CliError(`Option --${optionName} requires a value`, EXIT.USAGE);
    }
    options[optionName] = value;
    index += 1;
  }

  if (positional.length > 1) {
    throw new CliError('Only one target directory may be provided', EXIT.USAGE);
  }

  return { options, targetArgument: positional[0] };
}

function resolveWorkspace(targetArgument) {
  const workspace = path.resolve(targetArgument ?? process.cwd());
  if (!existsSync(workspace)) {
    throw new CliError(`Target directory does not exist: ${workspace}`, EXIT.FILESYSTEM);
  }

  let details;
  try {
    details = lstatSync(workspace);
  } catch (error) {
    throw new CliError(`Cannot inspect target directory: ${error.message}`, EXIT.FILESYSTEM);
  }

  if (details.isSymbolicLink()) {
    throw new CliError(`Refusing a symlinked target directory: ${workspace}`, EXIT.FILESYSTEM);
  }
  if (!details.isDirectory()) {
    throw new CliError(`Target is not a directory: ${workspace}`, EXIT.FILESYSTEM);
  }
  return workspace;
}

function resolveManagedPath(workspace, relativePath) {
  const destination = path.resolve(workspace, relativePath);
  const relation = path.relative(workspace, destination);
  if (relation === '' || (!relation.startsWith('..') && !path.isAbsolute(relation))) {
    return destination;
  }
  throw new CliError(`Managed path escapes the target workspace: ${relativePath}`, EXIT.FILESYSTEM);
}

function assertNoSymlinkComponents(workspace, destination) {
  const relation = path.relative(workspace, destination);
  let current = workspace;
  for (const component of relation.split(path.sep).filter(Boolean)) {
    current = path.join(current, component);
    if (existsSync(current) && lstatSync(current).isSymbolicLink()) {
      throw new CliError(`Refusing managed path through symlink: ${current}`, EXIT.FILESYSTEM);
    }
  }
}

function ensureManagedDirectory(workspace, relativePath, dryRun = false) {
  const destination = resolveManagedPath(workspace, relativePath);
  assertNoSymlinkComponents(workspace, destination);
  if (existsSync(destination)) {
    if (!statSync(destination).isDirectory()) {
      throw new CliError(`Expected a directory: ${destination}`, EXIT.FILESYSTEM);
    }
    return false;
  }
  if (!dryRun) mkdirSync(destination, { recursive: true });
  return true;
}

function copyTemplateIfMissing(workspace, templateName, relativePath, dryRun = false) {
  const destination = resolveManagedPath(workspace, relativePath);
  assertNoSymlinkComponents(workspace, destination);
  if (existsSync(destination)) return false;
  ensureManagedDirectory(workspace, path.dirname(relativePath), dryRun);
  if (!dryRun) copyFileSync(path.join(assetsRoot, templateName), destination);
  return true;
}

function writeManagedJson(workspace, relativePath, value) {
  const destination = resolveManagedPath(workspace, relativePath);
  assertNoSymlinkComponents(workspace, destination);
  ensureManagedDirectory(workspace, path.dirname(relativePath));
  writeFileSync(destination, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function readJsonFile(filePath, label) {
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'));
  } catch (error) {
    throw new CliError(`Cannot parse ${label}: ${error.message}`, EXIT.STATE);
  }
}

function statePath(workspace) {
  return resolveManagedPath(workspace, 'work/run-state.json');
}

function readState(workspace) {
  const filePath = statePath(workspace);
  if (!existsSync(filePath)) {
    throw new CliError('No v1 workflow state found. Run init first.', EXIT.STATE);
  }
  assertNoSymlinkComponents(workspace, filePath);
  const state = readJsonFile(filePath, 'work/run-state.json');
  if (state.schemaVersion !== 1 || state.workflowVersion !== '1.0') {
    throw new CliError('Unsupported workflow state version; expected v1.0.', EXIT.STATE);
  }
  if (!PROFILE_LIMITS[state.profile]) {
    throw new CliError(`Unknown profile in workflow state: ${state.profile}`, EXIT.STATE);
  }
  if (
    !state.phases
    || typeof state.phases !== 'object'
    || !state.budgets
    || !state.metrics
    || !state.stageGate
    || typeof state.finalStale !== 'boolean'
  ) {
    throw new CliError('Workflow state is missing required v1 fields.', EXIT.STATE);
  }
  return state;
}

function newState(profile) {
  const timestamp = new Date().toISOString();
  return {
    schemaVersion: 1,
    workflowVersion: '1.0',
    profile,
    createdAt: timestamp,
    updatedAt: timestamp,
    currentPhase: 'setup',
    humanReview: 'final-only',
    phases: Object.fromEntries(PHASES.map((phase) => [phase, phase === 'setup' ? 'complete' : 'pending'])),
    revisionRounds: 0,
    stageGate: { decision: null, score: null, dimensions: null, blockers: 0 },
    finalStale: false,
    budgets: {
      ...PROFILE_LIMITS[profile],
      maxRevisionRounds: 2,
      paidTools: false,
      credentialedPrivateSystems: false,
      externalWrites: false
    },
    metrics: { phaseTransitions: 0, executionAttempts: 0 },
    lastReason: null
  };
}

function detectLegacyOrForeignWork(workspace) {
  const workPath = resolveManagedPath(workspace, 'work');
  if (!existsSync(workPath)) return;
  assertNoSymlinkComponents(workspace, workPath);
  if (!statSync(workPath).isDirectory()) {
    throw new CliError('The reserved work path exists and is not a directory.', EXIT.FILESYSTEM);
  }
  const entries = readdirSync(workPath);
  if (entries.length > 0 && !entries.includes('run-state.json')) {
    throw new CliError(
      'A non-v1 work directory already exists. v0.3 migration is intentionally unsupported; preserve it and initialize in a clean workspace.',
      EXIT.STATE
    );
  }
}

function commandInit(tokens) {
  const parsed = parseArguments(tokens, { profile: 'value', 'dry-run': 'boolean' });
  const workspace = resolveWorkspace(parsed.targetArgument);
  const dryRun = Boolean(parsed.options['dry-run']);
  const requestedProfile = parsed.options.profile;
  if (requestedProfile && !PROFILE_LIMITS[requestedProfile]) {
    throw new CliError(`Unknown profile: ${requestedProfile}`, EXIT.USAGE);
  }

  const existingStatePath = statePath(workspace);
  detectLegacyOrForeignWork(workspace);

  let state;
  let stateCreated = false;
  if (existsSync(existingStatePath)) {
    state = readState(workspace);
    if (requestedProfile && requestedProfile !== state.profile) {
      throw new CliError(
        `Workflow already uses profile ${state.profile}; refusing to change it to ${requestedProfile}.`,
        EXIT.STATE
      );
    }
  } else {
    state = newState(requestedProfile ?? 'standard');
    stateCreated = true;
  }

  const results = [
    ['project-brief.md', copyTemplateIfMissing(workspace, 'project-brief.md', 'project-brief.md', dryRun)],
    ['work/', ensureManagedDirectory(workspace, 'work', dryRun)],
    ['work/00-run-log.md', copyTemplateIfMissing(workspace, 'run-log.md', 'work/00-run-log.md', dryRun)],
    ['work/01-evidence/', ensureManagedDirectory(workspace, 'work/01-evidence', dryRun)],
    ['work/03-execution/', ensureManagedDirectory(workspace, 'work/03-execution', dryRun)],
    ['work/04-results/', ensureManagedDirectory(workspace, 'work/04-results', dryRun)]
  ];

  if (stateCreated && !dryRun) writeManagedJson(workspace, 'work/run-state.json', state);
  results.splice(2, 0, ['work/run-state.json', stateCreated]);

  for (const [item, created] of results) {
    console.log(`${dryRun ? 'would ' : ''}${created ? 'create' : 'keep'} ${item}`);
  }
  console.log(`profile ${state.profile}`);
  console.log(dryRun ? 'dry-run complete; no files written' : 'next: complete project-brief.md, then start evidence');
}

function listMarkdownFiles(workspace, relativeDirectory) {
  const directory = resolveManagedPath(workspace, relativeDirectory);
  assertNoSymlinkComponents(workspace, directory);
  if (!existsSync(directory) || !statSync(directory).isDirectory()) return [];
  return readdirSync(directory)
    .filter((name) => name.toLowerCase().endsWith('.md'))
    .map((name) => path.join(directory, name));
}

function assertFilledFile(workspace, relativePath) {
  const filePath = resolveManagedPath(workspace, relativePath);
  assertNoSymlinkComponents(workspace, filePath);
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    throw new CliError(`Missing required artifact: ${relativePath}`, EXIT.STATE);
  }
  const content = readFileSync(filePath, 'utf8');
  if (content.trim().length === 0) {
    throw new CliError(`Artifact is empty: ${relativePath}`, EXIT.STATE);
  }
  if (PLACEHOLDER_PATTERN.test(content)) {
    throw new CliError(`Artifact still contains template placeholders: ${relativePath}`, EXIT.STATE);
  }
}

function assertFilledDirectory(workspace, relativePath) {
  const files = listMarkdownFiles(workspace, relativePath);
  if (files.length === 0) {
    throw new CliError(`No Markdown artifacts found in ${relativePath}`, EXIT.STATE);
  }
  for (const filePath of files) {
    const content = readFileSync(filePath, 'utf8');
    const relativeFile = path.relative(workspace, filePath).split(path.sep).join('/');
    if (content.trim().length === 0 || PLACEHOLDER_PATTERN.test(content)) {
      throw new CliError(`Incomplete artifact: ${relativeFile}`, EXIT.STATE);
    }
  }
}

function assertPhaseArtifact(workspace, phase) {
  switch (phase) {
    case 'evidence':
      assertFilledFile(workspace, 'project-brief.md');
      assertFilledDirectory(workspace, 'work/01-evidence');
      return;
    case 'plan':
      assertFilledFile(workspace, 'work/02-plan.md');
      return;
    case 'execution':
      assertFilledDirectory(workspace, 'work/03-execution');
      return;
    case 'results':
      assertFilledDirectory(workspace, 'work/04-results');
      return;
    case 'crossReview':
      assertFilledFile(workspace, 'work/05-cross-review.md');
      return;
    case 'stageGate':
      assertFilledFile(workspace, 'work/06-stage-gate.md');
      return;
    case 'final':
      assertFilledFile(workspace, 'work/07-final-output.md');
      return;
    default:
      return;
  }
}

function statusSetForPhase(phase) {
  if (phase === 'stageGate') return GATE_STATUSES;
  if (phase === 'final') return FINAL_STATUSES;
  return NORMAL_STATUSES;
}

function canonicalPhase(value) {
  return PHASE_ALIASES[value] ?? value;
}

function cliPhaseName(phase) {
  if (phase === 'crossReview') return 'cross-review';
  if (phase === 'stageGate') return 'stage-gate';
  return phase;
}

function phaseIsSatisfied(state, phase) {
  if (phase === 'stageGate') return state.phases[phase] === 'approved';
  return state.phases[phase] === 'complete';
}

function assertPredecessor(state, phase) {
  const index = PHASES.indexOf(phase);
  if (index <= 0) return;
  const predecessor = PHASES[index - 1];
  if (!phaseIsSatisfied(state, predecessor)) {
    throw new CliError(
      `${PHASE_LABELS[phase]} cannot advance before ${PHASE_LABELS[predecessor]} is complete.`,
      EXIT.STATE
    );
  }
}

function resetLaterPhases(state, phase, workspace) {
  const phaseIndex = PHASES.indexOf(phase);
  const finalPath = resolveManagedPath(workspace, 'work/07-final-output.md');
  if (phaseIndex < PHASES.indexOf('final') && (state.phases.final !== 'pending' || existsSync(finalPath))) {
    state.finalStale = true;
  }
  for (const laterPhase of PHASES.slice(phaseIndex + 1)) {
    state.phases[laterPhase] = 'pending';
  }
  state.stageGate = { decision: null, score: null, dimensions: null, blockers: 0 };
}

function parseIntegerOption(value, name, defaultValue = undefined) {
  if (value === undefined) return defaultValue;
  if (!/^\d+$/.test(value)) throw new CliError(`--${name} must be a non-negative integer`, EXIT.USAGE);
  return Number(value);
}

function parseDimensions(value, required = false) {
  if (value === undefined) {
    if (required) throw new CliError('--dimensions is required for stage-gate approval', EXIT.STATE);
    return null;
  }
  const dimensions = value.split(',').map((item) => Number(item.trim()));
  if (dimensions.length !== 5 || dimensions.some((item) => !Number.isInteger(item) || item < 0 || item > 2)) {
    throw new CliError('--dimensions must contain five comma-separated scores from 0 to 2', EXIT.USAGE);
  }
  return dimensions;
}

function commandAdvance(tokens) {
  const parsed = parseArguments(tokens, {
    phase: 'value',
    status: 'value',
    score: 'value',
    dimensions: 'value',
    blockers: 'value',
    reason: 'value'
  });
  const workspace = resolveWorkspace(parsed.targetArgument);
  const state = readState(workspace);
  const phase = canonicalPhase(parsed.options.phase);
  const status = parsed.options.status;

  if (!phase || !PHASES.includes(phase) || phase === 'setup') {
    throw new CliError(`--phase must be one of: ${PHASES.slice(1).map(cliPhaseName).join(', ')}`, EXIT.USAGE);
  }
  if (!status || !statusSetForPhase(phase).has(status)) {
    throw new CliError(`Invalid status for ${phase}: ${status ?? '<missing>'}`, EXIT.USAGE);
  }
  if (status === 'pending') {
    throw new CliError('The pending status is managed internally and cannot be set with advance.', EXIT.USAGE);
  }

  const score = parseIntegerOption(parsed.options.score, 'score');
  const dimensions = parseDimensions(parsed.options.dimensions, phase === 'stageGate' && status === 'approved');
  const blockers = parseIntegerOption(parsed.options.blockers, 'blockers', 0);
  const currentIndex = PHASES.indexOf(state.currentPhase);
  const targetIndex = PHASES.indexOf(phase);
  const reopeningEarlierPhase = targetIndex < currentIndex;

  if (reopeningEarlierPhase && status === 'complete') {
    throw new CliError(`Reopen ${PHASE_LABELS[phase]} with in_progress before completing it again.`, EXIT.STATE);
  }

  if (reopeningEarlierPhase && ['in_progress', 'needs_revision', 'blocked'].includes(status)) {
    resetLaterPhases(state, phase, workspace);
  }

  if (status === 'in_progress') {
    const revising = state.phases.stageGate === 'needs_revision' && targetIndex < PHASES.indexOf('stageGate');
    if (!revising) assertPredecessor(state, phase);
    if (!reopeningEarlierPhase && revising) resetLaterPhases(state, phase, workspace);
    if (phase === 'execution') state.metrics.executionAttempts += 1;
  }

  if (status === 'complete') {
    assertPredecessor(state, phase);
    assertPhaseArtifact(workspace, phase);
  }

  if (status === 'needs_revision' || status === 'blocked') assertPredecessor(state, phase);

  if (phase === 'stageGate') {
    if (status === 'approved') {
      assertPredecessor(state, phase);
      assertPhaseArtifact(workspace, phase);
      if (score === undefined || score < 8 || score > 10) {
        throw new CliError('Stage-gate approval requires --score between 8 and 10.', EXIT.STATE);
      }
      if (dimensions.some((item) => item === 0) || dimensions.reduce((total, item) => total + item, 0) !== score) {
        throw new CliError('Stage-gate dimensions must be non-zero and sum to --score.', EXIT.STATE);
      }
      if (blockers !== 0) {
        throw new CliError('Stage-gate approval requires --blockers 0.', EXIT.STATE);
      }
      state.stageGate = { decision: 'approved', score, dimensions, blockers: 0 };
    } else if (status === 'needs_revision') {
      assertPhaseArtifact(workspace, phase);
      if (state.revisionRounds >= state.budgets.maxRevisionRounds) {
        throw new CliError('Revision limit reached; mark the workflow blocked.', EXIT.STATE);
      }
      state.revisionRounds += 1;
      state.stageGate = { decision: 'needs_revision', score: score ?? null, dimensions, blockers };
    } else if (status === 'blocked') {
      state.stageGate = { decision: 'blocked', score: score ?? null, dimensions, blockers: Math.max(1, blockers) };
    }
  }

  if (phase === 'final' && status === 'in_progress' && state.finalStale) {
    if (!parsed.options.reason) {
      throw new CliError('Revising a stale final output requires --reason to record the review.', EXIT.STATE);
    }
    state.finalStale = false;
  }

  if (phase === 'final' && status === 'complete') {
    if (state.phases.stageGate !== 'approved') {
      throw new CliError('Final synthesis cannot complete before stage-gate approval.', EXIT.STATE);
    }
    if (state.finalStale) {
      throw new CliError('Final output is stale; reopen it with in_progress and --reason before completion.', EXIT.STATE);
    }
    assertPhaseArtifact(workspace, phase);
  }

  let createdArtifact = null;
  if (status === 'in_progress' && PHASE_START_ARTIFACTS[phase]) {
    const [templateName, relativePath] = PHASE_START_ARTIFACTS[phase];
    if (copyTemplateIfMissing(workspace, templateName, relativePath)) createdArtifact = relativePath;
  }

  state.phases[phase] = status;
  state.currentPhase = phase;
  state.updatedAt = new Date().toISOString();
  state.metrics.phaseTransitions += 1;
  state.lastReason = parsed.options.reason ?? null;
  writeManagedJson(workspace, 'work/run-state.json', state);
  console.log(`${cliPhaseName(phase)} -> ${status}`);
  if (createdArtifact) console.log(`created ${createdArtifact}`);
  if (phase === 'stageGate') console.log(`revision rounds ${state.revisionRounds}/${state.budgets.maxRevisionRounds}`);
}

function validateState(workspace, state) {
  const failures = [];
  const capture = (callback) => {
    try {
      callback();
    } catch (error) {
      failures.push(error.message);
    }
  };

  for (const relativePath of ['project-brief.md', 'work/00-run-log.md']) {
    capture(() => {
      const filePath = resolveManagedPath(workspace, relativePath);
      assertNoSymlinkComponents(workspace, filePath);
      if (!existsSync(filePath) || !statSync(filePath).isFile()) {
        throw new CliError(`Missing required file: ${relativePath}`, EXIT.STATE);
      }
    });
  }
  for (const relativePath of ['work/01-evidence', 'work/03-execution', 'work/04-results']) {
    capture(() => {
      const directory = resolveManagedPath(workspace, relativePath);
      assertNoSymlinkComponents(workspace, directory);
      if (!existsSync(directory) || !statSync(directory).isDirectory()) {
        throw new CliError(`Missing required directory: ${relativePath}`, EXIT.STATE);
      }
    });
  }

  for (const phase of PHASES) {
    const status = state.phases[phase];
    if (!statusSetForPhase(phase).has(status)) failures.push(`Invalid status for ${phase}: ${status}`);
    if (status === 'complete' || status === 'approved') capture(() => assertPhaseArtifact(workspace, phase));
  }
  if (state.phases.setup !== 'complete') failures.push('setup must remain complete');
  if (!PHASES.includes(state.currentPhase)) failures.push(`Invalid currentPhase: ${state.currentPhase}`);

  for (let index = 1; index < PHASES.length; index += 1) {
    const phase = PHASES[index];
    if (state.phases[phase] !== 'pending') {
      const predecessor = PHASES[index - 1];
      const isRevisionState = state.phases.stageGate === 'needs_revision' && index < PHASES.indexOf('stageGate');
      if (!isRevisionState && !phaseIsSatisfied(state, predecessor)) {
        failures.push(`${phase} is active while predecessor ${predecessor} is incomplete`);
      }
    }
  }

  const finalPath = resolveManagedPath(workspace, 'work/07-final-output.md');
  if (existsSync(finalPath) && state.phases.stageGate !== 'approved' && !state.finalStale) {
    failures.push('Final output exists without stage-gate approval');
  }
  if (state.finalStale && !existsSync(finalPath)) failures.push('finalStale is set but no final output exists');
  if (state.finalStale && state.phases.final !== 'pending') failures.push('Stale final output must remain pending');
  if (state.finalStale && state.phases.stageGate === 'approved') {
    failures.push('Stale final output requires a recorded review before finalization');
  }
  if (state.phases.stageGate === 'approved') {
    const dimensions = state.stageGate.dimensions;
    const invalidDimensions = !Array.isArray(dimensions)
      || dimensions.length !== 5
      || dimensions.some((item) => !Number.isInteger(item) || item < 1 || item > 2)
      || dimensions.reduce((total, item) => total + item, 0) !== state.stageGate.score;
    if (state.stageGate.score < 8 || state.stageGate.blockers !== 0 || invalidDimensions) {
      failures.push('Approved gate has an invalid score or blockers');
    }
  }
  if (state.revisionRounds > state.budgets.maxRevisionRounds) {
    failures.push('Revision round limit exceeded');
  }
  if (state.budgets.maxRevisionRounds !== 2) failures.push('maxRevisionRounds must remain 2');
  return [...new Set(failures)];
}

function commandValidate(tokens) {
  const parsed = parseArguments(tokens, { json: 'boolean' });
  const workspace = resolveWorkspace(parsed.targetArgument);
  const state = readState(workspace);
  const failures = validateState(workspace, state);
  if (parsed.options.json) {
    console.log(JSON.stringify({ valid: failures.length === 0, failures }, null, 2));
  } else if (failures.length === 0) {
    console.log('Workflow validation passed.');
  } else {
    console.error('Workflow validation failed:');
    for (const failure of failures) console.error(`- ${failure}`);
  }
  if (failures.length > 0) throw new CliError('Workflow state or artifacts are invalid.', EXIT.STATE);
}

function commandStatus(tokens) {
  const parsed = parseArguments(tokens, { json: 'boolean' });
  const workspace = resolveWorkspace(parsed.targetArgument);
  const state = readState(workspace);
  if (parsed.options.json) {
    console.log(JSON.stringify(state, null, 2));
    return;
  }
  console.log(`profile: ${state.profile}`);
  console.log(`current phase: ${state.currentPhase}`);
  for (const phase of PHASES) console.log(`${cliPhaseName(phase)}: ${state.phases[phase]}`);
  console.log(`revision rounds: ${state.revisionRounds}/${state.budgets.maxRevisionRounds}`);
  console.log(`final output stale: ${state.finalStale ? 'yes' : 'no'}`);
  if (state.finalStale && state.phases.stageGate === 'approved') {
    console.log('next: review the preserved final output, then reopen final with in_progress and --reason');
  } else if (state.finalStale) {
    console.log('next: complete the revised phases and obtain stage-gate approval again');
  } else if (state.phases.stageGate === 'approved' && state.phases.final === 'pending') {
    console.log('next: run finalize to create the final synthesis template');
  } else {
    const activePhase = PHASES.find((phase) => ['in_progress', 'needs_revision', 'blocked'].includes(state.phases[phase]));
    const pendingPhase = PHASES.find((phase) => state.phases[phase] === 'pending');
    console.log(`next: ${activePhase ? `resolve ${PHASE_LABELS[activePhase]}` : pendingPhase ? `start ${PHASE_LABELS[pendingPhase]}` : 'workflow complete'}`);
  }
  console.log(`updated: ${state.updatedAt}`);
}

function commandFinalize(tokens) {
  const parsed = parseArguments(tokens, {});
  const workspace = resolveWorkspace(parsed.targetArgument);
  const state = readState(workspace);
  if (state.phases.stageGate !== 'approved') {
    throw new CliError('Cannot create final output before stage-gate approval.', EXIT.STATE);
  }
  if (state.finalStale) {
    throw new CliError(
      'Existing final output is stale. Run advance --phase final --status in_progress --reason <review reason> before reuse.',
      EXIT.STATE
    );
  }
  const created = copyTemplateIfMissing(workspace, 'final-output.md', 'work/07-final-output.md');
  if (state.phases.final === 'pending') {
    state.phases.final = 'in_progress';
    state.currentPhase = 'final';
    state.updatedAt = new Date().toISOString();
    state.metrics.phaseTransitions += 1;
    writeManagedJson(workspace, 'work/run-state.json', state);
  }
  console.log(`${created ? 'created' : 'kept'} work/07-final-output.md`);
}

function main() {
  const [command, ...tokens] = process.argv.slice(2);
  if (!command || command === '--help' || command === '-h' || command === 'help') {
    printUsage();
    return;
  }
  switch (command) {
    case 'init':
      commandInit(tokens);
      return;
    case 'status':
      commandStatus(tokens);
      return;
    case 'advance':
      commandAdvance(tokens);
      return;
    case 'validate':
      commandValidate(tokens);
      return;
    case 'finalize':
      commandFinalize(tokens);
      return;
    default:
      throw new CliError(`Unknown command: ${command}`, EXIT.USAGE);
  }
}

try {
  main();
} catch (error) {
  if (error instanceof CliError) {
    console.error(`error: ${error.message}`);
    process.exit(error.exitCode);
  }
  console.error(`error: ${error.message}`);
  process.exit(EXIT.FILESYSTEM);
}
