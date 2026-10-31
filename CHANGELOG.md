# Changelog

## [Unreleased]

### Added

- Documented direct installation through the cross-agent Skills CLI and added the `skills.sh` catalog badge, which will resolve after catalog indexing.
- The tag-triggered Release workflow now verifies the tag/version match and `main` ancestry, runs the full deterministic check suite, the official Agent Skills validator, and `gh skill publish --dry-run`, then publishes the GitHub release without installing dependencies in the dependency-free repository.
- Repository validation now requires the release, docs, Dependabot, markdownlint, and issue-template configuration files and rejects a replaced no-op `validate` script.
- Revision records now store per-artifact baseline hashes and a `changedArtifacts` list so a resolved revision names the source artifacts that changed.

### Changed

- `init` refuses to scaffold while an existing run state fails validation; missing layout is no longer restored over an inconsistent workflow.
- `finalize` documentation now describes template creation and the separate `advance --phase final --status complete` transition.
- The compact example uses the template file names created by lazy phase starts, and the host matrix records the dated activation snapshot and the default smoke scope.
- `benchmark` now asserts that its realistic workspace validates as `valid_complete`.
- `lastReason` retains the most recently supplied transition reason instead of being cleared by a later reasonless transition.
- Guidance now requires real checkpoint timestamps, treats cross-review revision status as a pre-gate snapshot, records removal of disposable scratch copies, and states that `valid_complete` does not verify human-review decisions or claim truth.

### Fixed

- Detected unpinned GitHub Actions references expressed with plain, quoted, or flow-style YAML `uses` keys while ignoring examples inside quoted scalar values.
- Clarified that the v1.1.0 security review is historical evidence and removed the release-version literal from the bug-report placeholder.
- Excluded `work/00-run-log.md` from the revision fingerprint so a log-only edit cannot satisfy the upstream source-artifact proof.
- Rejected empty `--profile` and `--human-review` values instead of writing state the CLI cannot read.
- Rejected dangling symlink and junction components before the first write and preflighted the state destination during initialization.
- Marked the final output stale only when the output file exists, so reopening an upstream phase after starting the final phase without a file remains valid.
- Required a filled stage-gate artifact, `--blockers` of at least 1, and a non-blank reason for a blocked gate, rejected whitespace-only `--reason` values, printed the readable phase alias in `status`, and classified unreadable state paths as filesystem errors.
- The `init` next-step message now names both required setup artifacts.

## [1.1.1] - 2026-08-08

### Fixed

- Rejected prototype-inherited option and profile names so unsupported profiles cannot bypass resource limits or unknown-option handling.
- Validated fail-closed authorization budgets and every candidate workflow transition before state replacement, including coherent predecessor ordering during revision rounds.
- Limited incomplete-template detection to canonical placeholders shipped by the matching asset, allowing unrelated literal brace syntax in technical artifacts.
- Extended repository validation to every GitHub Actions workflow and made host-smoke argument errors return the usage exit class.

## [1.1.0] - 2026-08-01

Workflow contract 1.1 is now released. Existing workflow 1.0 state remains readable and there is no breaking change to the v1 artifact layout or CLI surface.

### Added

- Added workflow contract 1.1 with minimum phase headings, stable finding-coverage tables, safe multi-artifact scaffolding, configurable human-review metadata, and explicit valid-incomplete versus valid-complete output.
- Added durable revision IDs, upstream-artifact fingerprints, and explicit no-change dispositions for stage-gate reapproval.
- Added deterministic coverage for zero-host smoke behavior and the newly reproduced setup, revision-bypass, and invalid-state mutation paths.
- Added repository-wide `AGENTS.md` instructions and a maintainer release-integrity checklist.
- Added a repository-validated release-version invariant: `package.json` is the single source of truth and `npm run validate` now fails when `SKILL.md` metadata, `CITATION.cff`, the README version badge, or a dated `CHANGELOG.md` release section disagrees with it.
- Added a regression test that mutates a copied repository tree to prove the release-version invariant reports drift on every checked surface.

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
- Fixed the model-backed host smoke asserting a hardcoded `1.0.0` activation marker; it now reads the shipped `SKILL.md` metadata version, so a release bump can no longer make the activation check assert a version the package does not declare.
- Fixed the repository validator's Markdown walk descending into the local `.venv` and treating the ignored local `project-brief.md` dogfood artifact as tracked source, which made link validation depend on the contributor's local environment. A directory whose name ends in `.md` is also no longer misread as a file.
- Preflighted every managed initialization destination before the first write so a late file/directory conflict cannot leave partial scaffolding behind.
- Rejected contradictory `currentPhase` and stage-gate decision metadata before a state-changing command can persist a newly invalid workflow.
- Stopped repository Markdown validation from following symlinked directories and restricted disposable test copies to project-owned roots instead of ignored local files.
- Reported malformed `package.json` content as a validation failure instead of crashing the repository validator.

### Known Issues

- Symlink-rejection tests are skipped with `EPERM` on Windows hosts that cannot create symlinks; the Linux and macOS CI jobs remain the authoritative coverage for those paths.
- `npm run smoke:hosts` remains environment-dependent and exits 3 with `inconclusive` when no eligible host CLI is installed. The host activation matrix is still the dated 2026-07-18 snapshot and was not rerun for this release.

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
