# Implementation Notes

Use these notes when running, installing, or distributing the skill in a coding-agent environment.

## Distribution

This directory is the complete skill package. Copy or install the `agentic-rd-skill/` folder into the skill directory used by the target coding agent.

The package is intentionally self-contained:

- Do not rely on repository-level `AGENTS.md`, `prompts/`, `templates/`, `guides/`, or `docs/` directories.
- Keep operational instructions in `SKILL.md`.
- Keep detailed documentation in `references/`.
- Keep reusable output formats in `assets/templates/`.
- Keep deterministic helpers in `scripts/`.

Agents should not ask the user to read external repository documentation before running the workflow.

## Scaffold Script

Run the scaffold script from any workspace:

```bash
node path/to/agentic-rd-skill/scripts/init-rd-workflow.mjs .
```

The script creates missing workflow files from bundled templates. It does not overwrite existing files unless `--force` is passed. It never creates `work/05-final-output.md`.

## File Handling

- Treat `project-brief.md` and `work/` files as workflow state.
- Read current files before updating them.
- Preserve existing user content unless the user asks to replace it or `--force` is appropriate.
- Keep specialist outputs separate until cross-review.
- Do not write final synthesis content into any earlier phase file.

## Real Subagents

Use real subagents when the environment supports them and the user has allowed subagent work. Give each subagent:

- The project brief.
- The orchestration plan.
- Its assigned role and scope.
- The exact output file it owns.

Do not ask multiple subagents to edit the same file.

## Simulated Specialist Passes

If real subagents are unavailable, simulate specialists as separate passes:

- Start each pass from the brief, orchestration plan, role, and scope.
- Do not merge conclusions during specialist analysis.
- Write one output file per specialist before cross-review.
- Keep cross-review and final synthesis separate from specialist work.

## Source Use

If the task depends on current facts, use available browsing or source access. If source access is unavailable, state the limitation in specialist outputs and final synthesis.
