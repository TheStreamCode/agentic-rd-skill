# Changelog

## [Unreleased]

### Added

- Added workflow contract 1.1 with minimum phase headings, stable finding-coverage tables, safe multi-artifact scaffolding, configurable human-review metadata, and explicit valid-incomplete versus valid-complete output.
- Added durable revision IDs, upstream-artifact fingerprints, and explicit no-change dispositions for stage-gate reapproval.
- Added deterministic coverage for zero-host smoke behavior and the newly reproduced setup, revision-bypass, and invalid-state mutation paths.
- Added repository-wide `AGENTS.md` instructions and a maintainer release-integrity checklist.

### Changed

- Setup now remains `in_progress` until the filled brief and run log are verified when evidence starts.
- Every state-mutating CLI command now rejects a globally invalid input state before writing.
- Host smoke reports an inconclusive non-success when every eligible check is skipped.
- Replaced drift-prone README benchmark/package point values with executable guardrail documentation.
- Aligned the example run, role/laboratory references, compatibility notes, contributor guidance, security policy, and GitHub templates with workflow contract 1.1.

### Fixed

- Prevented stage-gate reapproval from silently bypassing a requested revision.
- Prevented `advance` and `finalize` from mutating state that fails full workflow validation.
- Clarified protected tag/version selection versus GitHub immutable-release guarantees.

## [1.0.0] - 2026-07-31

### Breaking

- Repackaged the installable skill under `skills/agentic-rd-skill/` for standard discovery and publishing.
- Replaced the v0.3 artifact model with a dependency-ordered v1 workflow and `run-state.json`.
- Removed v0.3 migration and force-overwrite behavior; legacy workspaces are preserved and rejected.

### Added

- Added a dependency-free Node.js CLI for initialization, status, transitions, validation, resume, and gated finalization.
- Added compact, standard, and extended profiles with bounded specialists, concurrency, waves, and revisions.
- Added explicit source-trust, authorization, privacy, and sensitive-domain review rules.
- Added official-spec, package, CLI, cross-platform, and behavioral evaluation coverage.
- Added a host compatibility matrix for Codex, Claude Code, GitHub Copilot, Gemini CLI, and OpenCode.
- Added a realistic CLI performance benchmark with CI regression budgets and a documented utility/UX review.
- Added GitHub CLI installation guidance alongside the manual installation path.
- Added discoverability-focused README sections for real use cases, workflow steps, Agent Laboratory comparison, FAQs, maintainer attribution, and search intent coverage.
- Expanded repository and package metadata for GitHub, traditional search, and AI search discovery without keyword stuffing.
- Added a single `npm run check` quality gate, pinned validation dependencies, CODEOWNERS, and guided issue routing.

### Changed

- Replaced post-hoc collaboration with orchestrator-owned handoffs after every wave.
- Replaced the heading-based validator with stateful behavior and repository tests.
- Removed broad host-specific `allowed-tools` pre-approval from skill frontmatter.
- Improved CLI UX with lazy phase templates, readable phase aliases, actionable status output, and explicit stale-final recovery.
- Pinned GitHub Actions to immutable commits, disabled persisted checkout credentials, bounded job runtimes, and added an aggregate CI quality check.
- Removed the obsolete writable Dependabot auto-merge workflow after version updates were disabled.

### Security

- Made workflow-state updates atomic so interrupted writes preserve the previous valid state.
- Rejected symlinked Markdown artifacts and non-file template conflicts instead of following or silently keeping them.
- Rejected numeric CLI values outside JavaScript's safe integer range.

## 0.3.0

- Added workflow scaling, single-writer team collaboration, phase/output mapping, and a compact example.

## 0.2.0

- Added parallel-subagent guidance, structural validation, and self-contained skill packaging.

## 0.1.0

- Converted the generalized Agent Laboratory workflow into an Agent Skill package.
