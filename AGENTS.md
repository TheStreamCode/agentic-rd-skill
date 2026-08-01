# Repository Instructions

These instructions apply to the entire repository. Preserve narrower instructions if a future subdirectory adds its own `AGENTS.md`.

## Purpose And Sources Of Truth

This repository publishes a portable Agent Skill plus a dependency-free Node.js workflow CLI.

- `skills/agentic-rd-skill/` is the installable package.
- `skills/agentic-rd-skill/SKILL.md` is the concise activation and operating contract.
- `skills/agentic-rd-skill/references/workflow.md` is the detailed workflow/state reference.
- `skills/agentic-rd-skill/scripts/rd.mjs` is the executable state-machine implementation.
- `skills/agentic-rd-skill/assets/` contains the canonical artifact templates.
- `README.md` documents public behavior and installation.
- `evals/` contains dated evidence. Historical snapshots must not be presented as current measurements.
- `project-brief.md` and `work/` are ignored local dogfood artifacts, not tracked product source.

When documentation and runtime behavior disagree, verify the CLI and tests, then update every affected source of truth in the same change.

## Repository Invariants

- Support Node.js 20 or newer and keep the installable skill free of runtime dependencies.
- Keep portable frontmatter provider-neutral; never add host-specific `allowed-tools` or implicit external authority.
- Preserve phase order: setup, evidence, plan, execution, results, cross-review, stage gate, final.
- New runs use workflow contract 1.1. Existing workflow 1.0 state remains readable; v0.3 workspaces are preserved and rejected rather than migrated.
- Setup remains `in_progress` until the filled brief and run log pass their artifact contracts.
- State-mutating commands validate the current global state before writing. The documented stale-final recovery is the only scoped repair exception.
- `validate` distinguishes valid-incomplete, valid-complete, and invalid state. Structural validation is not semantic assurance.
- Stage-gate approval requires at least 8/10, no zero dimension, and zero blockers.
- A requested revision must retain its ID and be resolved by an upstream artifact change or an explicit no-change disposition.
- `package.json` is the single source of truth for the release version. `SKILL.md` metadata, `CITATION.cff`, the README version badge, and a dated `CHANGELOG.md` release section must match it; `npm run validate` fails on any partial bump.
- Do not hardcode the release version anywhere else. Scripts that need it must read it from `package.json` or the shipped `SKILL.md` frontmatter.
- The CLI is single-writer. Do not introduce concurrent state mutation without a designed locking/generation protocol and cross-platform tests.
- Preserve atomic state replacement, managed-path containment, symlink rejection, non-overwrite behavior, and explicit exit classes.
- Preflight the complete initialization layout before the first scaffold write; a late path conflict must leave earlier missing files untouched.
- Keep `currentPhase` equal to the latest non-pending phase and keep stage-gate score, dimensions, blockers, and decision metadata consistent with the gate status.
- Never convert skipped or zero-execution host checks into a pass.

## Implementation Style

- Use ESM and Node.js built-ins. Avoid adding packages when the standard library is sufficient.
- Keep operations deterministic, synchronous where the current CLI is synchronous, and safe on Linux, macOS, and Windows.
- Validate arguments and current state before filesystem mutation.
- Use workspace-relative managed paths; reject traversal, symlinks, type conflicts, and unsafe slugs.
- Preserve the previous valid `run-state.json` if a write fails.
- Repository validators and test fixtures must not follow symlinked directories or copy ignored local workflow/secrets into disposable repository clones.
- Keep exit codes stable: `0` success, `2` usage, `3` workflow/inconclusive state, `4` filesystem or safety failure.
- Add focused regression tests for every reproduced defect and verify rejected mutations leave state/artifacts unchanged.
- Do not weaken tests, hide expected failures, or rewrite unrelated user changes to make a gate pass.

## Documentation Synchronization

Update all affected surfaces when behavior changes:

- CLI command, option, output, or transition: CLI help, `SKILL.md`, `references/workflow.md`, README, tests, changelog, and relevant eval cases.
- Required artifact heading or field: asset template, CLI contract table, benchmark fixture, tests, example run, and traceability guidance.
- Host claim: README matrix, `references/compatibility.md`, and a dated eval with the exact host/version/check executed.
- Package/release process: `RELEASING.md`, repository validator, changelog, and public wording.
- Release version: `package.json` first, then `skills/agentic-rd-skill/SKILL.md` metadata, `CITATION.cff`, the README badge, and a dated `CHANGELOG.md` section. Confirm with `npm run validate` rather than by inspection.
- Security boundary: `SECURITY.md`, `quality-and-safety.md`, tests, and threat notes in the change description.

Do not copy current package bytes or benchmark point values into undated README prose. Keep point-in-time measurements in dated eval files and make `npm run benchmark` the current source.

## Validation

Run the smallest relevant test first, then the complete local gate:

```powershell
npm run check
```

For package/release-affecting changes also run:

```powershell
agentskills validate (Resolve-Path '.\skills\agentic-rd-skill').Path
gh skill publish --dry-run
```

`npm run smoke:hosts` is environment-dependent. The underlying Node runner exits 3 with an `inconclusive` message when zero eligible checks run; npm may surface that child exit as a generic non-zero status. Never report either form as host verification. Model-backed smokes require explicit budget and credential authorization.

Windows may skip symlink tests with `EPERM`; preserve the skip and rely on CI platforms that can create symlinks rather than disabling the checks.

## Change And Release Boundaries

- Make narrow edits and preserve dirty or concurrent worktrees.
- Do not commit, push, tag, publish, deploy, alter GitHub settings, or sync a global installed copy unless the user explicitly authorizes that action.
- Do not bump versions during ordinary implementation. Follow `RELEASING.md` when a release is explicitly requested.
- Never claim a release is immutable until GitHub reports `immutable: true` for that release.
- Do not add AI-attribution or generated-by footers to commits, pull requests, or documentation.
