# Contributing

Contributions should preserve portability, deterministic safety checks, and progressive disclosure.

Read [AGENTS.md](AGENTS.md) first. It defines the repository invariants, documentation synchronization matrix, validation expectations, and release boundaries.

## Development Setup

Use Node.js 20 or newer for the dependency-free test suite. Release validation also requires Python 3.11 or newer and GitHub CLI 2.96 or newer.

Install the pinned Agent Skills reference validator into an isolated Python environment:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install --disable-pip-version-check --only-binary=:all: --require-hashes -r requirements-validation.txt
```

## Guidelines

- Keep the installable package under `skills/agentic-rd-skill/`.
- Keep `SKILL.md` concise and action-oriented; place detailed guidance in one-level `references/` files.
- Put reusable output templates in `assets/` and deterministic workflow logic in `scripts/` inside the skill.
- Do not add host-specific tool pre-approvals to portable frontmatter.
- Preserve the phase dependency order and single-writer run log.
- Preserve workflow 1.0 read compatibility when changing the workflow 1.1 state contract.
- Use exact own-membership checks for user-controlled whitelist keys and validate both current and candidate workflow state before persistence.
- Keep structural validation honest: required headings and finding coverage improve auditability but do not establish semantic correctness.
- A `needs_revision` change must preserve revision history and require an upstream artifact change or explicit no-change disposition before approval.
- Treat zero executed host checks as inconclusive, never passed.
- Do not add migration behavior, force-overwrite options, provider SDKs, or external mutations without an explicit design decision.
- Update tests, README, changelog, metadata, and evaluation cases when public behavior changes.

## Validation

Run:

```powershell
npm run check
.\.venv\Scripts\agentskills.exe validate (Resolve-Path '.\skills\agentic-rd-skill').Path
gh skill publish --dry-run
```

Run `npm run smoke:hosts` only when at least one eligible host CLI is installed. If no check executes, the underlying runner exits 3 and reports `inconclusive`; malformed selectors and options exit 2 as usage errors. npm may expose either child exit as a generic non-zero status. See [RELEASING.md](RELEASING.md) for release-only gates and immutable-release verification.

Pull requests should explain the behavior changed, compatibility impact, safety impact, and verification evidence. Do not include AI attribution or generated-by footers.
