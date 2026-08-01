# v1.1.0 Security Review

Snapshot: 2026-08-01 on Windows 11 with Node.js 24.18.0, npm 11.16.0, Python 3.12.10, and GitHub CLI 2.96.0. This is a repository-grounded maintainer review, not a third-party audit or a guarantee of semantic correctness.

## Executive Summary

No critical or high-severity vulnerability was identified in the dependency-free skill package or local workflow CLI. Four defense-in-depth findings were corrected before release: atomic initialization preflight, stricter workflow-state coherence, non-following repository document traversal, and narrower disposable test copies. No tracked credential pattern was found, and the installable skill remained free of runtime dependencies.

## Scope And Method

- Reviewed the installable package, CLI state transitions, managed-path operations, repository validators, benchmarks, host-smoke runner, tests, GitHub Actions, release metadata, and public documentation.
- Examined process execution, filesystem writes, symlink handling, path containment, temporary-directory cleanup, environment inheritance, release version synchronization, and package contents.
- Ran syntax checks, repository validation, deterministic tests, realistic benchmarks, the hash-pinned Agent Skills reference validator, GitHub skill publish dry-run, tracked-secret pattern checks, and Git integrity checks.
- Used GitHub API evidence for repository visibility, secret scanning, push protection, pull-request checks, CodeQL, releases, and branch rules.

## Medium Findings

### SEC-01: Late initialization conflicts could leave partial scaffolding

Impact: a repair-style `init` could recreate an earlier missing artifact before discovering that a later managed destination had the wrong file type.

Resolution: `skills/agentic-rd-skill/scripts/rd.mjs:386-400` now dry-runs every managed destination before the first write. A regression test proves a conflicting run-log path leaves the missing brief and existing state unchanged.

### SEC-02: Repository Markdown traversal followed directory symlinks

Impact: a local or malicious checkout could make validation leave the repository root, inspect unintended Markdown, or recurse through a symlink cycle.

Resolution: `scripts/validate-repo.mjs:70-106` now uses non-following file checks and `Dirent` traversal. Symlinked directories are not visited; required symlinked files do not satisfy the regular-file contract.

## Low Findings

### SEC-03: Disposable repository fixtures copied broad local content

The release-version regression fixture copied nearly the whole working directory except a short denylist. `tests/package.test.mjs:11-41` now allowlists project-owned roots, excluding ignored root-level workflow artifacts, environment files, logs, and unrelated local material.

### SEC-04: Malformed package metadata could abort validation

`scripts/validate-repo.mjs:181-205` now converts JSON parse failure into an explicit repository-validation finding. The validator continues reporting the fault without an uncaught exception.

## Residual Risks And Limitations

- The workflow state machine remains intentionally single-writer. Concurrent state-changing CLI processes are unsupported until a locking or generation protocol is designed and tested.
- Structural heading, coverage, fingerprint, and gate checks do not establish that artifact claims are true, unbiased, or independently reviewed.
- Windows could not create symlinks in the local test environment (`EPERM`); Linux and macOS CI remain the authoritative regression coverage for symlink paths.
- Host discovery was inconclusive because GitHub Copilot CLI and OpenCode were not installed. No model-backed host smoke was run, and the 2026-07-18 activation matrix remains historical evidence.
- Child host processes inherit the invoking environment so authenticated CLIs can operate. Model-backed smokes remain opt-in and require explicit credential and budget authorization.

## Verification Status

The complete local gate, official Agent Skills validator, and GitHub publish dry-run passed after these changes. Remote CI and CodeQL evidence must be rechecked on the final commit; release, tag, and installation verification remain separate publication gates.
