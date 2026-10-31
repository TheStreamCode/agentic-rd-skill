# Workflow Reference

## Contents

- Brief and profiles
- Artifact contract
- Phase sequence
- State transitions and CLI
- Failure and recovery

## Brief And Profiles

The brief must identify the subject, goal, deliverable, audience, context, constraints, scope boundaries, success criteria, language, human-review needs, mutation authorization, and available resource budget. Unknown non-blocking fields may be recorded as assumptions.

Profile defaults:

| Profile | Specialists | Concurrent | Waves | Intended use |
| --- | ---: | ---: | ---: | --- |
| `compact` | 1 | 1 | 1 | Narrow, low-risk, substantive work |
| `standard` | 4 | 4 | 2 | Default research and planning work |
| `extended` | 6 | 6 | 3 | Broad, multi-domain, or regulated work |

Every profile allows at most two revision rounds. Host capacity may reduce concurrency but must not increase profile limits without user authorization.

## Artifact Contract

```text
project-brief.md
work/
├── run-state.json
├── 00-run-log.md
├── 01-evidence/
├── 02-plan.md
├── 03-execution/
├── 04-results/
├── 05-cross-review.md
├── 06-stage-gate.md
└── 07-final-output.md
```

The CLI creates only the brief, state, run log, and owned directories during initialization. Phase artifacts are created lazily. This keeps a new run small and prevents empty files from appearing complete.

`run-state.json` is the machine-readable workflow state. New runs use workflow contract `1.1`; existing `1.0` runs remain readable. Markdown files remain the human-readable evidence trail. If they disagree, stop, reconcile the artifacts, and rerun validation rather than silently trusting either side.

Workflow 1.1 requires the phase-specific headings supplied by the bundled templates. A file remains templated only while it contains a canonical placeholder from its matching bundled asset; unrelated literal brace syntax is valid technical content. Material evidence findings use stable IDs such as `E-01`; the plan, results, and final coverage tables must resolve or explicitly defer each ID. These checks improve structural traceability but do not certify semantic truth.

## Phase Sequence

### Setup

Fill the brief and run log, choose the profile and human-review mode, and record constraints and authorization boundaries. Setup remains `in_progress` after initialization. Starting evidence validates both artifacts and marks setup complete; it is rejected while either artifact is empty, templated, or missing required workflow 1.1 headings.

### Evidence

Each evidence specialist reads the brief and run log, owns one file under `01-evidence/`, records source URLs or local evidence, assigns stable IDs to material findings, and distinguishes observations from inferences. Offline work must state that current external facts were not verified. Use the CLI `artifact` command to scaffold the second and later specialist files safely.

After the wave, the orchestrator consolidates questions, overlaps, disagreements, and handoffs into the run log. Only then may planning start.

### Plan

The plan owner reads every evidence output and the reconciled run log. `02-plan.md` defines the work to execute, resources, ownership, finding coverage, acceptance criteria, verification, risks, unavailable evidence, and stop conditions. Execution cannot start until the plan is complete and any required human plan review is recorded.

### Execution

Execution may mean code inspection, experiments, benchmarks, scenario analysis, architecture review, market comparison, document analysis, or implementation planning. Each specialist reads the plan plus relevant evidence and owns one file under `03-execution/`.

Do not broaden authority: analysis does not authorize implementation, and implementation does not authorize deployment or publication.

If execution uses a disposable scratch copy, keep the commands and raw outcomes in the execution artifact, record that the copy was removed, and do not leave references to paths that no longer exist.

### Results

Results specialists read execution artifacts and write interpretations under `04-results/`. They must separate observed results, failed or inconclusive attempts, uncertainty, trade-offs, and recommendations.

### Cross-Review

Cross-review reads the brief, run log, evidence, plan, execution, and results. It identifies conflicts, unsupported claims, duplicated work, missing verification, and assigned revisions. Required revisions must be applied to the owned source artifact and recorded in the run log. The revision status in cross-review is a pre-gate snapshot; after the stage-gate decision, the stage-gate artifact and run log record the final outcome.

### Stage Gate

Score each dimension from 0 to 2:

1. Alignment with the brief and success criteria.
2. Evidence quality and traceability.
3. Execution correctness and verification.
4. Risks, uncertainty, authorization, and safety.
5. Synthesis readiness and actionability.

Approve only when the total is at least 8, no dimension is 0, and no blocking issue remains. `Needs Revision` requires a non-blank reason and starts a targeted revision record. Reapproval requires a changed upstream-source-artifact fingerprint or an explicit no-change disposition in `--reason`; the run log is not part of the fingerprint. The resolved revision record lists the changed source artifacts, or an empty list for a no-change disposition. `Blocked` requires the filled stage-gate artifact, a non-blank reason, and `--blockers` of at least 1. A third revision round is not allowed.

### Final

Run `finalize` only after approval. It creates `work/07-final-output.md` and marks the final phase `in_progress`; complete the phase only after the filled artifact validates. The final synthesizer uses approved artifacts, removes duplication, preserves material uncertainty and minority views, and does not introduce unsupported claims. Record the post-completion `validate --json` result in the run log; do not claim a validation result in the final artifact before it has been run.

## State Transitions And CLI

All paths are relative to the active skill root and target workspace.

```text
node <skill-root>/scripts/rd.mjs init <workspace> --profile standard --human-review final-only
node <skill-root>/scripts/rd.mjs advance <workspace> --phase evidence --status in_progress
node <skill-root>/scripts/rd.mjs artifact <workspace> --phase evidence --name security-review
node <skill-root>/scripts/rd.mjs advance <workspace> --phase evidence --status complete
node <skill-root>/scripts/rd.mjs advance <workspace> --phase stage-gate --status needs_revision --score 7 --blockers 1 --reason "Resolve E-03"
node <skill-root>/scripts/rd.mjs advance <workspace> --phase stage-gate --status approved --score 8 --dimensions 2,2,1,1,2 --blockers 0
node <skill-root>/scripts/rd.mjs finalize <workspace>
node <skill-root>/scripts/rd.mjs validate <workspace> --json
```

Normal phase statuses are `pending`, `in_progress`, `complete`, `needs_revision`, and `blocked`. `pending` and `setup` are managed internally and cannot be set with `advance`; setup completes when evidence starts. Stage gate uses `approved` instead of `complete`; final uses `complete` after the filled final artifact validates. Starting a phase with `in_progress` creates its first template lazily without replacing existing content. `artifact` creates additional evidence/execution/result templates from a safe lowercase slug. The CLI accepts the readable `cross-review` and `stage-gate` phase names as aliases for its machine-state keys.

Every state-changing command validates the current global state and the candidate transition before it writes. `init` scaffolds the managed layout and does not mutate existing workflow state; it refuses to scaffold when an existing state fails validation. Profile and option names use exact whitelist membership, and paid-tool, credentialed-system, and external-write budgets remain false; authorization must come from the user and brief rather than workspace state. `validate --json` returns `valid_incomplete`, `valid_complete`, or `invalid` and uses equivalent explicit text; a successful validity check alone is not a completion claim and does not verify human-review decisions. `status` reports both validity/completion and a concrete next prerequisite. Human-review mode is recorded in state for audit; actual checkpoint decisions remain in the run log. `lastReason` retains the most recently supplied transition reason; approval and revision reasons also remain in the revision history and run log.

Starting an earlier phase after a gate revision invalidates all later phase statuses and removes gate approval from state. Existing artifacts are preserved for review; they are never silently deleted or overwritten. If a final output already exists, state marks it stale; starting the final phase without an output does not. After the gate is approved again, explicitly reopen the final phase with `--status in_progress --reason <review reason>` before reusing or revising that output.

The CLI assumes a single orchestrator mutates `run-state.json`. Do not run concurrent state-changing CLI commands in the same workspace; concurrent-writer locking is not part of workflow 1.1.

CLI exit codes:

- `0`: success.
- `2`: invalid command, flag, profile, or argument.
- `3`: invalid workflow state, transition, artifact, or gate.
- `4`: unsafe path or filesystem failure.

## Failure And Recovery

- Allow up to three focused, non-destructive repair attempts for the same execution failure class. Record every attempt.
- A phase may resume from existing v1 state after `status` and `validate` succeed.
- The CLI deliberately does not migrate v0.3 workspaces. If it detects legacy artifacts without v1 state, it stops without changing them.
- Never use a force-reset option. The CLI preserves existing content and refuses incompatible initialization.
- If Node.js is unavailable, maintain the same state and gate rules manually and record that automated validation was unavailable.
