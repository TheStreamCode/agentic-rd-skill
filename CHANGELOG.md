# Changelog

## 0.2.0

- Made the team-collaboration step single-writer: specialists return notes to the orchestrator, which consolidates `work/03-team-collaboration.md` (removes a concurrent-write hazard).
- Added an explicit phase-to-output mapping in `SKILL.md` and `references/workflow.md`.
- Added "Scale To The Brief" guidance so small briefs do not trigger a full multi-wave run.
- Rewrote the `SKILL.md` description in third-person trigger form and declared `allowed-tools`.
- Replaced brittle verbatim-string checks in `validate-skill.mjs` with structural heading and path checks.
- Added `references/example-run.md`, a compact end-to-end example.
- Minor: scaffold script now prints a next-step hint; README clarifies the meaning of "R&D".

## 0.1.0

- Converted the repository into a self-contained `agentic-rd-skill` skill.
- Added workflow references, Markdown templates, scaffold script, and validation script.
- Added public repository metadata and GitHub community files.
