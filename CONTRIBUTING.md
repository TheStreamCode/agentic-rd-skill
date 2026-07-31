# Contributing

Contributions should preserve portability, deterministic safety checks, and progressive disclosure.

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
- Do not add migration behavior, force-overwrite options, provider SDKs, or external mutations without an explicit design decision.
- Update tests, README, changelog, metadata, and evaluation cases when public behavior changes.

## Validation

Run:

```powershell
npm run check
.\.venv\Scripts\agentskills.exe validate (Resolve-Path '.\skills\agentic-rd-skill').Path
gh skill publish --dry-run
```

Pull requests should explain the behavior changed, compatibility impact, safety impact, and verification evidence. Do not include AI attribution or generated-by footers.
