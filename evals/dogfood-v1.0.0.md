# v1.0.0 End-to-End Dogfood

Snapshot: 2026-07-31 on Windows 11, Node.js 24, GitHub CLI 2.96.0. This is a maintainer-orchestrated evaluation of the published v1.0.0 workflow on its own repository. It is not a blinded comparison or independent user study.

## Scope

- Ran the complete workflow from setup through final synthesis with the `standard` profile.
- Used three evidence specialties and three execution packages across two parallel work waves.
- Exercised the published package, repository gates, normal state path, controlled failures, recovery, cross-review, targeted revisions, and stage-gate scoring.
- Kept experiments in ignored workflow artifacts or verified disposable directories; no product source or GitHub state was changed during the evaluation.

## Outcome

- Final workflow state: complete and structurally valid.
- Stage gate: approved 9/10 with dimensions `2,2,1,2,2` and zero blockers. This score assessed the evaluation package, not the product itself.
- Final artifact trail: 13 Markdown files, 122,044 bytes, 983 lines, and no unresolved template placeholders.
- Elapsed state time: approximately 29 minutes 53 seconds from initialization to final completion. Tokens, model cost, and active model time were unavailable.

The supported readiness conclusion was conditional: the package and tested nominal mechanics were usable for expert-supervised substantive work, but v1.0.0 was not an autonomous semantic-assurance system.

## Verified Strengths

- Fresh pinned and unpinned GitHub CLI installations resolved v1.0.0 at the published commit; installed CLI initialization and validation passed.
- Repository validation, deterministic tests, benchmark guardrail, official Agent Skills validation, GitHub publish dry-run, release CI, and CodeQL passed for the published commit.
- Out-of-order and placeholder-filled completion attempts returned workflow errors without changing state; the run recovered after bounded corrections.
- The artifact boundaries made evidence, inference, failure, limitation, review, and approval decisions independently inspectable.

## Reproduced Gaps

1. Setup was marked complete and evidence could start before the generated brief was filled.
2. A `needs_revision` gate could be reopened and approved without an upstream change or recorded no-change disposition.
3. `advance` could mutate a type-correct but globally inconsistent state before a separate `validate` rejected it.
4. `validate` reported success for a valid in-progress run without clearly distinguishing it from completed-workflow validation.
5. Generic non-empty Markdown without template tokens could satisfy phase completion, so the CLI enforced structure but not meaningful artifact contracts.
6. Host smoke exited successfully when every eligible host check was skipped.

## Public Claim Findings

- Direct package installation was verified; catalog search returned no result at observation time.
- Tag rules protected `v*`, but the release API reported `immutable: false`; tag protection was not treated as immutable-release attestation.
- The README's below-58-KiB statement was stale: the published package measured 61,111 bytes during the dogfood.
- Current universal host parity, Gemini activation, comparative research quality, speed, token use, and cost remained unverified.

## Implemented Follow-up

The unreleased workflow 1.1 implementation addresses the directly actionable findings:

- setup remains in progress until the brief and run log pass their contracts;
- mutating commands validate global state before writing;
- revision IDs, artifact fingerprints, and no-change dispositions prevent silent reapproval bypass;
- `validate` distinguishes valid-incomplete, valid-complete, and invalid states;
- phase-specific headings and finding-coverage tables add lightweight structural traceability;
- `artifact` safely scaffolds additional specialist outputs;
- zero executed host checks now produce an inconclusive non-success;
- README metrics are executable guardrails instead of copied point values, and release integrity has a dedicated checklist.

After these changes and the documentation alignment, `npm run check` passed with 25 tests, zero failures, and two expected Windows symlink skips. The updated 18-file installable package measured 85,011 bytes; Windows/Node 24 p95 values were 55.02 ms for init, 56.51 ms for status, and 57.59 ms for validate, all within guardrails.

## Remaining Evidence Needed

- Independent replication of failure experiments and reviewer passes.
- Real current host discovery/activation runs, including Gemini when available.
- Crash, concurrent-writer, partial-init, rename/write fault, and hostile filesystem tests; workflow 1.1 explicitly documents a single-writer assumption.
- Blinded repeated with-skill/without-skill evaluation using factuality, completion, revision, actionability, latency, token, cost, and user-rating metrics.
