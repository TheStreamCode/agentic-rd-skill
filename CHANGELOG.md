# Changelog

## [Unreleased]

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

### Changed

- Replaced post-hoc collaboration with orchestrator-owned handoffs after every wave.
- Replaced the heading-based validator with stateful behavior and repository tests.
- Removed broad host-specific `allowed-tools` pre-approval from skill frontmatter.
- Improved CLI UX with lazy phase templates, readable phase aliases, actionable status output, and explicit stale-final recovery.

## 0.3.0

- Added workflow scaling, single-writer team collaboration, phase/output mapping, and a compact example.

## 0.2.0

- Added parallel-subagent guidance, structural validation, and self-contained skill packaging.

## 0.1.0

- Converted the generalized Agent Laboratory workflow into an Agent Skill package.
