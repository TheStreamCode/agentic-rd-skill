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

The script creates missing workflow files from bundled templates. It does not overwrite existing files unless `--force` is passed. It never creates `work/06-final-output.md`.

## File Handling

- Treat `project-brief.md` and `work/` files as workflow state.
- Read current files before updating them.
- Preserve existing user content unless the user asks to replace it or `--force` is appropriate.
- Keep specialist outputs separate until cross-review.
- Do not write final synthesis content into any earlier phase file.

## Parallel Subagent Policy

Parallel subagents are the default execution model for this skill.

Spawn all independent specialists in the same orchestration wave before waiting for any one result. Wait only when the next phase depends on the whole wave or on a specific blocking output.

Use dependency gates, not sequential habits:

- Evidence and context review agents can run in parallel.
- Optional domain specialists can run in parallel when they depend only on the brief and orchestration plan.
- Resource preparation agents can run in parallel after plan formulation when their resources are independent.
- Execution or investigation agents can run in parallel when they own disjoint files, sources, scenarios, experiments, comparisons, or analysis slices.
- Results analysis agents can run in parallel by domain or evidence slice after execution outputs exist.
- Cross-review, stage-gate review, and final synthesis are sequential gates.

Because parallel specialists work in isolation, two of them may independently surface the same finding. This redundancy is expected, not a defect. Cross-review must flag the overlap and final synthesis must deduplicate it into a single claim.

If real subagents are unavailable, record that limitation in `work/00-lab-notes.md` and use simulated specialist passes.

## Team Collaboration Protocol

Subagents should behave like a working team with shared state and handoffs, not like isolated one-shot prompts.

Use `work/03-team-collaboration.md` as the team coordination artifact. It should capture:

- Team roster and role ownership.
- Dependencies between agents.
- Questions from one agent to another.
- Agreements reached by the team.
- Disagreements and minority views.
- Handoffs needed for the next phase.
- Shared assumptions that must be carried into cross-review.

Collaboration happens after a wave produces initial outputs and before formal cross-review. The orchestrator consolidates the team record, but it must preserve meaningful disagreements rather than forcing premature consensus.

`work/03-team-collaboration.md` has a single writer: the orchestrator. Each subagent writes only its own specialist file and returns its collaboration notes (questions, dependencies, disagreements, handoffs) in its result. The orchestrator merges those returned notes into the collaboration file. This avoids the concurrent-write hazard described under "Real Subagents". When simulating, perform the same consolidation step as a distinct pass.

With one-shot parallel subagents, agent-to-agent questions are not answered live: an agent cannot see another agent's output mid-run. Collaboration is therefore a post-wave reconciliation by the orchestrator, which answers each question from the relevant specialist output or marks it open for cross-review. If a question genuinely blocks a specialist, run a dependent follow-up wave rather than expecting a synchronous exchange.

## Real Subagents

Use real subagents when the environment supports them. Give each subagent:

- The project brief.
- The orchestration plan.
- Its assigned role and scope.
- The exact output file it owns.
- Instructions to return collaboration notes in its result rather than write any shared file.

Do not ask multiple subagents to edit the same file. Shared files such as `work/03-team-collaboration.md` are written only by the orchestrator.

The orchestrator should continue useful local work while subagents run. Avoid waiting immediately after spawning unless the next action is blocked.

## Simulated Specialist Passes

If real subagents are unavailable, simulate specialists as separate passes. This is a fallback, not the preferred path:

- Start each pass from the brief, orchestration plan, role, and scope.
- Do not merge conclusions during specialist analysis.
- Write one output file per specialist before cross-review.
- Keep cross-review and final synthesis separate from specialist work.

## Source Use

If the task depends on current facts, use available browsing or source access. If source access is unavailable, state the limitation in specialist outputs and final synthesis.
