import assert from 'node:assert/strict';
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cliPath = path.join(repositoryRoot, 'skills', 'agentic-rd-skill', 'scripts', 'rd.mjs');
const assetsRoot = path.join(repositoryRoot, 'skills', 'agentic-rd-skill', 'assets');

function workspaceFor(t, suffix = '') {
  const workspace = mkdtempSync(path.join(tmpdir(), `agentic-rd-test-${suffix}`));
  t.after(() => rmSync(workspace, { recursive: true, force: true }));
  return workspace;
}

function runCli(args) {
  return spawnSync(process.execPath, [cliPath, ...args], {
    cwd: repositoryRoot,
    encoding: 'utf8',
    windowsHide: true
  });
}

function templateFor(relativePath) {
  if (relativePath === 'project-brief.md') return 'project-brief.md';
  if (relativePath === 'work/00-run-log.md') return 'run-log.md';
  if (relativePath.includes('01-evidence')) return 'evidence.md';
  if (relativePath === 'work/02-plan.md') return 'plan.md';
  if (relativePath.includes('03-execution')) return 'execution.md';
  if (relativePath.includes('04-results')) return 'results.md';
  if (relativePath === 'work/05-cross-review.md') return 'cross-review.md';
  if (relativePath === 'work/06-stage-gate.md') return 'stage-gate.md';
  if (relativePath === 'work/07-final-output.md') return 'final-output.md';
  return null;
}

function filledArtifact(relativePath, marker = 'Verified content') {
  const template = templateFor(relativePath);
  if (!template) return `# Filled artifact\n\n${marker}.\n`;
  return readFileSync(path.join(assetsRoot, template), 'utf8').replace(/\{\{[^}]+\}\}/g, marker);
}

function writeFilled(workspace, relativePath, content = filledArtifact(relativePath)) {
  const destination = path.join(workspace, relativePath);
  mkdirSync(path.dirname(destination), { recursive: true });
  writeFileSync(destination, content, 'utf8');
}

function initializeFilledBrief(t, profile = 'standard') {
  const workspace = workspaceFor(t, 'flow-');
  const init = runCli(['init', workspace, '--profile', profile]);
  assert.equal(init.status, 0, init.stderr);
  writeFilled(workspace, 'project-brief.md');
  writeFilled(workspace, 'work/00-run-log.md');
  return workspace;
}

function completeThroughCrossReview(workspace) {
  assert.equal(runCli(['advance', workspace, '--phase', 'evidence', '--status', 'in_progress']).status, 0);
  writeFilled(workspace, 'work/01-evidence/01-evidence.md');
  assert.equal(runCli(['advance', workspace, '--phase', 'evidence', '--status', 'complete']).status, 0);
  writeFilled(workspace, 'work/02-plan.md');
  assert.equal(runCli(['advance', workspace, '--phase', 'plan', '--status', 'complete']).status, 0);
  writeFilled(workspace, 'work/03-execution/01-execution.md');
  assert.equal(runCli(['advance', workspace, '--phase', 'execution', '--status', 'complete']).status, 0);
  writeFilled(workspace, 'work/04-results/01-results.md');
  assert.equal(runCli(['advance', workspace, '--phase', 'results', '--status', 'complete']).status, 0);
  writeFilled(workspace, 'work/05-cross-review.md');
  assert.equal(runCli(['advance', workspace, '--phase', 'crossReview', '--status', 'complete']).status, 0);
  writeFilled(workspace, 'work/06-stage-gate.md');
}

test('help documents the stable command surface', () => {
  const result = runCli(['--help']);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /rd\.mjs init/);
  assert.match(result.stdout, /rd\.mjs finalize/);
});

test('init is idempotent and reports existing directories accurately', (t) => {
  const workspace = workspaceFor(t, 'space in path-');
  const first = runCli(['init', workspace, '--profile', 'compact', '--human-review', 'plan-and-final']);
  assert.equal(first.status, 0, first.stderr);
  assert.match(first.stdout, /create work\/01-evidence\//);

  writeFileSync(path.join(workspace, 'project-brief.md'), 'USER CONTENT', 'utf8');
  const second = runCli(['init', workspace]);
  assert.equal(second.status, 0, second.stderr);
  assert.match(second.stdout, /keep work\/01-evidence\//);
  assert.equal(readFileSync(path.join(workspace, 'project-brief.md'), 'utf8'), 'USER CONTENT');

  const state = JSON.parse(readFileSync(path.join(workspace, 'work', 'run-state.json'), 'utf8'));
  assert.equal(state.profile, 'compact');
  assert.equal(state.budgets.maxSpecialists, 1);
  assert.equal(state.workflowVersion, '1.1');
  assert.equal(state.phases.setup, 'in_progress');
  assert.equal(state.humanReview, 'plan-and-final');
});

test('setup remains in progress and blocks evidence until the brief and run log are filled', (t) => {
  const workspace = workspaceFor(t, 'setup-');
  assert.equal(runCli(['init', workspace]).status, 0);
  const before = readFileSync(path.join(workspace, 'work', 'run-state.json'), 'utf8');

  const blocked = runCli(['advance', workspace, '--phase', 'evidence', '--status', 'in_progress']);
  assert.equal(blocked.status, 3);
  assert.match(blocked.stderr, /project-brief\.md/);
  assert.equal(readFileSync(path.join(workspace, 'work', 'run-state.json'), 'utf8'), before);

  writeFilled(workspace, 'project-brief.md');
  writeFilled(workspace, 'work/00-run-log.md');
  const started = runCli(['advance', workspace, '--phase', 'evidence', '--status', 'in_progress']);
  assert.equal(started.status, 0, started.stderr);
  const state = JSON.parse(readFileSync(path.join(workspace, 'work', 'run-state.json'), 'utf8'));
  assert.equal(state.phases.setup, 'complete');
  assert.equal(state.phases.evidence, 'in_progress');
});

test('init rejects file-path conflicts before creating workflow state', (t) => {
  const workspace = workspaceFor(t, 'conflict-');
  mkdirSync(path.join(workspace, 'project-brief.md'));

  const result = runCli(['init', workspace]);

  assert.equal(result.status, 4);
  assert.match(result.stderr, /Expected a regular file/);
  assert.equal(existsSync(path.join(workspace, 'work', 'run-state.json')), false);
});

test('dry-run writes nothing', (t) => {
  const workspace = workspaceFor(t, 'dry-');
  const result = runCli(['init', workspace, '--dry-run']);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /dry-run complete/);
  assert.equal(existsSync(path.join(workspace, 'project-brief.md')), false);
});

test('validate distinguishes a valid incomplete run from a completed run', (t) => {
  const workspace = workspaceFor(t, 'validation-semantics-');
  assert.equal(runCli(['init', workspace]).status, 0);
  const validation = runCli(['validate', workspace, '--json']);
  assert.equal(validation.status, 0, validation.stderr);
  assert.deepEqual(JSON.parse(validation.stdout), {
    valid: true,
    complete: false,
    status: 'valid_incomplete',
    currentPhase: 'setup',
    failures: []
  });
  const textStatus = runCli(['status', workspace]);
  assert.equal(textStatus.status, 0, textStatus.stderr);
  assert.match(textStatus.stdout, /workflow complete: no/);
  assert.match(textStatus.stdout, /complete project-brief\.md and work\/00-run-log\.md/);
});

test('existing workflow 1.0 state remains readable and resumable after setup repair', (t) => {
  const workspace = workspaceFor(t, 'legacy-v1-');
  assert.equal(runCli(['init', workspace]).status, 0);
  const statePath = path.join(workspace, 'work', 'run-state.json');
  const legacy = JSON.parse(readFileSync(statePath, 'utf8'));
  legacy.workflowVersion = '1.0';
  legacy.phases.setup = 'complete';
  delete legacy.revisions;
  delete legacy.pendingRevisionId;
  writeFileSync(statePath, `${JSON.stringify(legacy, null, 2)}\n`, 'utf8');

  const beforeRepair = runCli(['status', workspace, '--json']);
  assert.equal(beforeRepair.status, 0, beforeRepair.stderr);
  const status = JSON.parse(beforeRepair.stdout);
  assert.equal(status.workflowVersion, '1.0');
  assert.equal(status.validation.valid, false);
  assert.deepEqual(status.revisions, []);

  writeFilled(workspace, 'project-brief.md');
  writeFilled(workspace, 'work/00-run-log.md');
  const resumed = runCli(['advance', workspace, '--phase', 'evidence', '--status', 'in_progress']);
  assert.equal(resumed.status, 0, resumed.stderr);
});

test('unknown options and profile changes fail without creating accidental paths', (t) => {
  const workspace = workspaceFor(t, 'flags-');
  const unknown = runCli(['init', workspace, '--bogus']);
  assert.equal(unknown.status, 2);
  assert.match(unknown.stderr, /Unknown option/);

  assert.equal(runCli(['init', workspace, '--profile', 'standard']).status, 0);
  const changed = runCli(['init', workspace, '--profile', 'extended']);
  assert.equal(changed.status, 3);
  assert.match(changed.stderr, /refusing to change/);
});

test('legacy or foreign work directories are preserved and rejected', (t) => {
  const workspace = workspaceFor(t, 'legacy-');
  writeFilled(workspace, 'work/01-orchestration-plan.md');
  const result = runCli(['init', workspace]);
  assert.equal(result.status, 3);
  assert.match(result.stderr, /migration is intentionally unsupported/);
  assert.equal(existsSync(path.join(workspace, 'work', '01-orchestration-plan.md')), true);
  assert.equal(existsSync(path.join(workspace, 'work', 'run-state.json')), false);
});

test('out-of-order phases and incomplete template artifacts are rejected', (t) => {
  const workspace = initializeFilledBrief(t);
  const outOfOrder = runCli(['advance', workspace, '--phase', 'plan', '--status', 'in_progress']);
  assert.equal(outOfOrder.status, 3);
  assert.match(outOfOrder.stderr, /before Evidence is complete/);

  writeFilled(workspace, 'work/01-evidence/01-evidence.md', '# Evidence\n\n{{unfinished}}\n');
  assert.equal(runCli(['advance', workspace, '--phase', 'evidence', '--status', 'in_progress']).status, 0);
  const incomplete = runCli(['advance', workspace, '--phase', 'evidence', '--status', 'complete']);
  assert.equal(incomplete.status, 3);
  assert.match(incomplete.stderr, /Incomplete artifact/);
});

test('workflow 1.1 phase contracts reject non-placeholder Markdown with missing headings', (t) => {
  const workspace = initializeFilledBrief(t);
  assert.equal(runCli(['advance', workspace, '--phase', 'evidence', '--status', 'in_progress']).status, 0);
  writeFilled(workspace, 'work/01-evidence/01-evidence.md', '# Evidence\n\nSyntactically filled but structurally incomplete.\n');
  const result = runCli(['advance', workspace, '--phase', 'evidence', '--status', 'complete']);
  assert.equal(result.status, 3);
  assert.match(result.stderr, /missing required headings/);
});

test('starting phases creates lazy templates and accepts readable phase aliases', (t) => {
  const workspace = initializeFilledBrief(t);
  const evidence = runCli(['advance', workspace, '--phase', 'evidence', '--status', 'in_progress']);
  assert.equal(evidence.status, 0, evidence.stderr);
  assert.match(evidence.stdout, /created work\/01-evidence\/01-evidence\.md/);
  assert.equal(existsSync(path.join(workspace, 'work', '01-evidence', '01-evidence.md')), true);

  writeFilled(workspace, 'work/01-evidence/01-evidence.md');
  assert.equal(runCli(['advance', workspace, '--phase', 'evidence', '--status', 'complete']).status, 0);
  writeFilled(workspace, 'work/02-plan.md');
  assert.equal(runCli(['advance', workspace, '--phase', 'plan', '--status', 'complete']).status, 0);
  writeFilled(workspace, 'work/03-execution/01-execution.md');
  assert.equal(runCli(['advance', workspace, '--phase', 'execution', '--status', 'complete']).status, 0);
  writeFilled(workspace, 'work/04-results/01-results.md');
  assert.equal(runCli(['advance', workspace, '--phase', 'results', '--status', 'complete']).status, 0);

  const crossReview = runCli(['advance', workspace, '--phase', 'cross-review', '--status', 'in_progress']);
  assert.equal(crossReview.status, 0, crossReview.stderr);
  assert.equal(existsSync(path.join(workspace, 'work', '05-cross-review.md')), true);
  writeFilled(workspace, 'work/05-cross-review.md');
  assert.equal(runCli(['advance', workspace, '--phase', 'cross-review', '--status', 'complete']).status, 0);
  const gate = runCli(['advance', workspace, '--phase', 'stage-gate', '--status', 'in_progress']);
  assert.equal(gate.status, 0, gate.stderr);
  assert.equal(existsSync(path.join(workspace, 'work', '06-stage-gate.md')), true);
});

test('artifact command safely scaffolds additional owned phase artifacts', (t) => {
  const workspace = initializeFilledBrief(t);
  assert.equal(runCli(['advance', workspace, '--phase', 'evidence', '--status', 'in_progress']).status, 0);

  const created = runCli(['artifact', workspace, '--phase', 'evidence', '--name', 'security-review']);
  assert.equal(created.status, 0, created.stderr);
  assert.match(created.stdout, /created work\/01-evidence\/security-review\.md/);
  assert.equal(existsSync(path.join(workspace, 'work', '01-evidence', 'security-review.md')), true);

  const unsafe = runCli(['artifact', workspace, '--phase', 'evidence', '--name', '../escape']);
  assert.equal(unsafe.status, 2);
  assert.match(unsafe.stderr, /lowercase slug/);

  const wrongPhase = runCli(['artifact', workspace, '--phase', 'results', '--name', 'early']);
  assert.equal(wrongPhase.status, 3);
  assert.match(wrongPhase.stderr, /must be in_progress/);
});

test('approved gate controls finalization and completed run validates', (t) => {
  const workspace = initializeFilledBrief(t);
  const premature = runCli(['finalize', workspace]);
  assert.equal(premature.status, 3);

  completeThroughCrossReview(workspace);
  const lowScore = runCli([
    'advance', workspace, '--phase', 'stageGate', '--status', 'approved', '--score', '7',
    '--dimensions', '2,2,1,1,1', '--blockers', '0'
  ]);
  assert.equal(lowScore.status, 3);

  const zeroDimension = runCli([
    'advance', workspace, '--phase', 'stageGate', '--status', 'approved', '--score', '8',
    '--dimensions', '2,2,2,2,0', '--blockers', '0'
  ]);
  assert.equal(zeroDimension.status, 3);
  assert.match(zeroDimension.stderr, /non-zero/);

  const approved = runCli([
    'advance', workspace, '--phase', 'stageGate', '--status', 'approved', '--score', '8',
    '--dimensions', '2,2,1,1,2', '--blockers', '0'
  ]);
  assert.equal(approved.status, 0, approved.stderr);
  const approvedStatus = runCli(['status', workspace]);
  assert.equal(approvedStatus.status, 0, approvedStatus.stderr);
  assert.match(approvedStatus.stdout, /next: run finalize/);

  const finalize = runCli(['finalize', workspace]);
  assert.equal(finalize.status, 0, finalize.stderr);
  assert.equal(existsSync(path.join(workspace, 'work', '07-final-output.md')), true);

  writeFilled(workspace, 'work/07-final-output.md');
  const complete = runCli(['advance', workspace, '--phase', 'final', '--status', 'complete']);
  assert.equal(complete.status, 0, complete.stderr);

  const validation = runCli(['validate', workspace, '--json']);
  assert.equal(validation.status, 0, validation.stderr);
  assert.deepEqual(
    { valid: JSON.parse(validation.stdout).valid, complete: JSON.parse(validation.stdout).complete },
    { valid: true, complete: true }
  );

  const status = runCli(['status', workspace, '--json']);
  assert.equal(status.status, 0, status.stderr);
  assert.equal(JSON.parse(status.stdout).phases.final, 'complete');
});

test('revision requests require evidence of change or an explicit no-change disposition and remain capped', (t) => {
  const workspace = initializeFilledBrief(t);
  completeThroughCrossReview(workspace);

  for (let round = 1; round <= 2; round += 1) {
    const revision = runCli([
      'advance', workspace, '--phase', 'stageGate', '--status', 'needs_revision', '--score', '7', '--blockers', '1',
      '--reason', `Resolve review gap ${round}`
    ]);
    assert.equal(revision.status, 0, revision.stderr);

    assert.equal(runCli(['advance', workspace, '--phase', 'stageGate', '--status', 'in_progress']).status, 0);
    const bypass = runCli([
      'advance', workspace, '--phase', 'stageGate', '--status', 'approved', '--score', '8',
      '--dimensions', '2,2,1,1,2', '--blockers', '0'
    ]);
    assert.equal(bypass.status, 3);
    assert.match(bypass.stderr, /no upstream artifact change/);

    assert.equal(runCli(['advance', workspace, '--phase', 'crossReview', '--status', 'in_progress']).status, 0);
    writeFilled(
      workspace,
      'work/05-cross-review.md',
      filledArtifact('work/05-cross-review.md', `Resolved revision ${round}`)
    );
    assert.equal(runCli(['advance', workspace, '--phase', 'crossReview', '--status', 'complete']).status, 0);
    assert.equal(runCli(['advance', workspace, '--phase', 'stageGate', '--status', 'in_progress']).status, 0);
    const approved = runCli([
      'advance', workspace, '--phase', 'stageGate', '--status', 'approved', '--score', '8',
      '--dimensions', '2,2,1,1,2', '--blockers', '0'
    ]);
    assert.equal(approved.status, 0, approved.stderr);
    if (round < 2) assert.equal(runCli(['advance', workspace, '--phase', 'stageGate', '--status', 'in_progress']).status, 0);
  }

  assert.equal(runCli(['advance', workspace, '--phase', 'stageGate', '--status', 'in_progress']).status, 0);
  const third = runCli([
    'advance', workspace, '--phase', 'stageGate', '--status', 'needs_revision', '--score', '7', '--blockers', '1',
    '--reason', 'A third revision is forbidden'
  ]);
  assert.equal(third.status, 3);
  assert.match(third.stderr, /Revision limit reached/);

  const state = JSON.parse(readFileSync(path.join(workspace, 'work', 'run-state.json'), 'utf8'));
  assert.equal(state.revisionRounds, 2);
  assert.equal(state.revisions.length, 2);
  assert.equal(state.pendingRevisionId, null);
  assert.equal(state.phases.stageGate, 'in_progress');
});

test('an explicit no-change disposition resolves a pending gate revision', (t) => {
  const workspace = initializeFilledBrief(t);
  completeThroughCrossReview(workspace);
  const requested = runCli([
    'advance', workspace, '--phase', 'stage-gate', '--status', 'needs_revision', '--score', '7',
    '--blockers', '1', '--reason', 'Confirm whether the evidence already resolves the concern'
  ]);
  assert.equal(requested.status, 0, requested.stderr);
  assert.equal(runCli(['advance', workspace, '--phase', 'stage-gate', '--status', 'in_progress']).status, 0);

  const approved = runCli([
    'advance', workspace, '--phase', 'stage-gate', '--status', 'approved', '--score', '8',
    '--dimensions', '2,2,1,1,2', '--blockers', '0',
    '--reason', 'No content change: the cited source already satisfies the requested check'
  ]);
  assert.equal(approved.status, 0, approved.stderr);
  const state = JSON.parse(readFileSync(path.join(workspace, 'work', 'run-state.json'), 'utf8'));
  assert.equal(state.pendingRevisionId, null);
  assert.equal(state.revisions[0].resolution, 'no_change_disposition');
  assert.match(state.revisions[0].resolutionReason, /No content change/);
});

test('mutating commands reject a globally inconsistent state before writing', (t) => {
  const workspace = initializeFilledBrief(t);
  assert.equal(runCli(['advance', workspace, '--phase', 'evidence', '--status', 'in_progress']).status, 0);
  writeFilled(workspace, 'work/01-evidence/01-evidence.md');
  assert.equal(runCli(['advance', workspace, '--phase', 'evidence', '--status', 'complete']).status, 0);
  writeFilled(workspace, 'work/02-plan.md');
  assert.equal(runCli(['advance', workspace, '--phase', 'plan', '--status', 'complete']).status, 0);

  const statePath = path.join(workspace, 'work', 'run-state.json');
  const state = JSON.parse(readFileSync(statePath, 'utf8'));
  state.phases.evidence = 'pending';
  writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
  const before = readFileSync(statePath, 'utf8');
  const result = runCli(['advance', workspace, '--phase', 'execution', '--status', 'in_progress']);
  assert.equal(result.status, 3);
  assert.match(result.stderr, /Refusing to mutate an invalid workflow/);
  assert.equal(readFileSync(statePath, 'utf8'), before);
  assert.equal(existsSync(path.join(workspace, 'work', '03-execution', '01-execution.md')), false);
});

test('reopening a completed run preserves but invalidates the final output', (t) => {
  const workspace = initializeFilledBrief(t);
  completeThroughCrossReview(workspace);
  assert.equal(runCli([
    'advance', workspace, '--phase', 'stageGate', '--status', 'approved', '--score', '8',
    '--dimensions', '2,2,1,1,2', '--blockers', '0'
  ]).status, 0);
  assert.equal(runCli(['finalize', workspace]).status, 0);
  writeFilled(workspace, 'work/07-final-output.md', filledArtifact('work/07-final-output.md', 'Original final'));
  assert.equal(runCli(['advance', workspace, '--phase', 'final', '--status', 'complete']).status, 0);

  const reopen = runCli(['advance', workspace, '--phase', 'results', '--status', 'in_progress']);
  assert.equal(reopen.status, 0, reopen.stderr);
  let state = JSON.parse(readFileSync(path.join(workspace, 'work', 'run-state.json'), 'utf8'));
  assert.equal(state.finalStale, true);
  assert.equal(state.phases.final, 'pending');
  assert.equal(
    readFileSync(path.join(workspace, 'work', '07-final-output.md'), 'utf8'),
    filledArtifact('work/07-final-output.md', 'Original final')
  );
  assert.equal(runCli(['validate', workspace]).status, 0);

  writeFilled(workspace, 'work/04-results/01-results.md', filledArtifact('work/04-results/01-results.md', 'Revised results'));
  assert.equal(runCli(['advance', workspace, '--phase', 'results', '--status', 'complete']).status, 0);
  assert.equal(runCli(['advance', workspace, '--phase', 'crossReview', '--status', 'complete']).status, 0);
  assert.equal(runCli([
    'advance', workspace, '--phase', 'stageGate', '--status', 'approved', '--score', '8',
    '--dimensions', '2,2,1,1,2', '--blockers', '0'
  ]).status, 0);

  const staleFinalize = runCli(['finalize', workspace]);
  assert.equal(staleFinalize.status, 3);
  assert.match(staleFinalize.stderr, /stale/);
  const missingReason = runCli(['advance', workspace, '--phase', 'final', '--status', 'in_progress']);
  assert.equal(missingReason.status, 3);
  assert.match(missingReason.stderr, /--reason/);
  const reviewed = runCli([
    'advance', workspace, '--phase', 'final', '--status', 'in_progress', '--reason', 'Reviewed after revised results'
  ]);
  assert.equal(reviewed.status, 0, reviewed.stderr);
  state = JSON.parse(readFileSync(path.join(workspace, 'work', 'run-state.json'), 'utf8'));
  assert.equal(state.finalStale, false);
});

test('pending is internal-only and malformed state returns a workflow error', (t) => {
  const workspace = initializeFilledBrief(t);
  const pending = runCli(['advance', workspace, '--phase', 'evidence', '--status', 'pending']);
  assert.equal(pending.status, 2);
  assert.match(pending.stderr, /managed internally/);

  writeFileSync(path.join(workspace, 'work', 'run-state.json'), '{"schemaVersion":1,"workflowVersion":"1.0","profile":"standard"}\n');
  const malformed = runCli(['status', workspace]);
  assert.equal(malformed.status, 3);
  assert.match(malformed.stderr, /missing required v1 fields/);

  writeFileSync(path.join(workspace, 'work', 'run-state.json'), 'null\n');
  const nonObject = runCli(['status', workspace]);
  assert.equal(nonObject.status, 3);
  assert.match(nonObject.stderr, /must be a JSON object/);
});

test('malformed revision history is reported as invalid instead of crashing status', (t) => {
  const workspace = workspaceFor(t, 'bad-revision-');
  assert.equal(runCli(['init', workspace]).status, 0);
  const statePath = path.join(workspace, 'work', 'run-state.json');
  const state = JSON.parse(readFileSync(statePath, 'utf8'));
  state.revisions = [null];
  writeFileSync(statePath, `${JSON.stringify(state, null, 2)}\n`, 'utf8');

  const status = runCli(['status', workspace, '--json']);
  assert.equal(status.status, 0, status.stderr);
  assert.equal(JSON.parse(status.stdout).validation.valid, false);
  assert.match(JSON.parse(status.stdout).validation.failures.join('\n'), /invalid metadata/);

  const validation = runCli(['validate', workspace, '--json']);
  assert.equal(validation.status, 3);
  assert.match(validation.stdout, /Revision history contains invalid metadata/);
});

test('unsafe integers and stage-gate-only options are rejected as usage errors', (t) => {
  const workspace = initializeFilledBrief(t);
  const unsafeInteger = runCli([
    'advance', workspace, '--phase', 'evidence', '--status', 'in_progress',
    '--reason', 'bounded input', '--score', '999999999999999999999999'
  ]);
  assert.equal(unsafeInteger.status, 2);
  assert.match(unsafeInteger.stderr, /valid only for stage-gate/);

  assert.equal(runCli(['advance', workspace, '--phase', 'evidence', '--status', 'in_progress']).status, 0);
  writeFilled(workspace, 'work/01-evidence/01-evidence.md');
  assert.equal(runCli(['advance', workspace, '--phase', 'evidence', '--status', 'complete']).status, 0);
  writeFilled(workspace, 'work/02-plan.md');
  assert.equal(runCli(['advance', workspace, '--phase', 'plan', '--status', 'complete']).status, 0);
  writeFilled(workspace, 'work/03-execution/01-execution.md');
  assert.equal(runCli(['advance', workspace, '--phase', 'execution', '--status', 'complete']).status, 0);
  writeFilled(workspace, 'work/04-results/01-results.md');
  assert.equal(runCli(['advance', workspace, '--phase', 'results', '--status', 'complete']).status, 0);
  writeFilled(workspace, 'work/05-cross-review.md');
  assert.equal(runCli(['advance', workspace, '--phase', 'cross-review', '--status', 'complete']).status, 0);
  writeFilled(workspace, 'work/06-stage-gate.md');

  const unsafeBlockers = runCli([
    'advance', workspace, '--phase', 'stage-gate', '--status', 'blocked',
    '--blockers', '999999999999999999999999'
  ]);
  assert.equal(unsafeBlockers.status, 2);
  assert.match(unsafeBlockers.stderr, /safe non-negative integer/);
});

test('reopening an approved stage gate clears stale decision metadata', (t) => {
  const workspace = initializeFilledBrief(t);
  completeThroughCrossReview(workspace);
  assert.equal(runCli([
    'advance', workspace, '--phase', 'stage-gate', '--status', 'approved', '--score', '8',
    '--dimensions', '2,2,1,1,2', '--blockers', '0'
  ]).status, 0);

  const reopen = runCli(['advance', workspace, '--phase', 'stage-gate', '--status', 'in_progress']);
  assert.equal(reopen.status, 0, reopen.stderr);
  const state = JSON.parse(readFileSync(path.join(workspace, 'work', 'run-state.json'), 'utf8'));
  assert.deepEqual(state.stageGate, { decision: null, score: null, dimensions: null, blockers: 0 });
  assert.equal(runCli(['validate', workspace]).status, 0);
});

test('Markdown artifact symlinks are rejected when the platform permits symlink creation', (t) => {
  const workspace = initializeFilledBrief(t);
  assert.equal(runCli(['advance', workspace, '--phase', 'evidence', '--status', 'in_progress']).status, 0);
  const outside = path.join(workspaceFor(t, 'artifact-outside-'), 'outside.md');
  writeFileSync(outside, '# External artifact\n\nMust not be followed.\n', 'utf8');
  const linkedArtifact = path.join(workspace, 'work', '01-evidence', 'linked.md');
  try {
    symlinkSync(outside, linkedArtifact, 'file');
  } catch (error) {
    if (error.code === 'EPERM' || error.code === 'EACCES' || error.code === 'UNKNOWN') {
      t.skip(`symlink creation unavailable: ${error.code}`);
      return;
    }
    throw error;
  }

  const result = runCli(['advance', workspace, '--phase', 'evidence', '--status', 'complete']);
  assert.equal(result.status, 4);
  assert.match(result.stderr, /symlink/);
});

test('managed symlink paths are rejected when the platform permits symlink creation', (t) => {
  const workspace = workspaceFor(t, 'symlink-');
  const outside = workspaceFor(t, 'outside-');
  try {
    symlinkSync(outside, path.join(workspace, 'work'), 'dir');
  } catch (error) {
    if (error.code === 'EPERM' || error.code === 'EACCES' || error.code === 'UNKNOWN') {
      t.skip(`symlink creation unavailable: ${error.code}`);
      return;
    }
    throw error;
  }
  const result = runCli(['init', workspace]);
  assert.equal(result.status, 4);
  assert.match(result.stderr, /symlink/);
});
