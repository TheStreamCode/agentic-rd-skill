---
name: agentic-rd-skill
description: This skill should be used when the user wants an autonomous, multi-agent Agent Laboratory style workflow to produce a structured research, product, business, technical, strategy, feasibility, investigation, planning, or analysis deliverable. Trigger on requests such as "run a feasibility study", "do a market and competitor analysis", "research and plan this idea", "write a strategy memo", or any project brief that needs evidence review, plan formulation, execution or investigation, results analysis, cross-review and stage-gate gates, and a final synthesis.
license: MIT
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, Task, WebSearch, WebFetch, TodoWrite
---

# Agentic R&D Workflow

Use this self-contained skill package to automate a Markdown-first, multi-agent laboratory workflow inside the current workspace.

This is a general-purpose adaptation of the Agent Laboratory pattern: independent evidence review, collaborative plan formulation, task execution or investigation, results analysis, quality review, and final report writing. It is not limited to scientific research; apply the same lab workflow to product, business, technical, strategy, legal, compliance, security, UX, market, and operational use cases.

Designed for skill-compatible coding agents with filesystem access. Prefer real parallel subagents whenever the environment supports them; use isolated simulated passes only when real subagents are unavailable.

## Package Contents

- `SKILL.md`: activation rules and core operating instructions.
- `references/generalized-lab-model.md`: universal Agent Laboratory model and use-case mapping.
- `references/workflow.md`: full phase sequence and approval gate.
- `references/agent-roles.md`: specialist role selection guidance.
- `references/quality-rules.md`: evidence, uncertainty, review, and safety standards.
- `references/implementation-notes.md`: install, scaffold, subagent, and file-handling notes.
- `references/example-run.md`: a compact end-to-end example showing the expected file trail and output quality.
- `assets/templates/`: Markdown templates for all workflow files.
- `scripts/init-rd-workflow.mjs`: optional scaffold script.
- `scripts/validate-skill.mjs`: repository validation for the public skill package.

## First Action

1. Look for `project-brief.md` in the current workspace.
2. If it exists, read it completely before any other workflow step.
3. If it does not exist and the user gave enough context, create it with `assets/templates/project-brief.md`.
4. If essential context is missing, ask only the minimum blocking questions.
5. After the brief exists, continue without asking for permission between normal workflow phases.

Run `scripts/init-rd-workflow.mjs` to scaffold `project-brief.md` and the required `work/` files. The script must not create `work/06-final-output.md`.

## Required Outputs

Create and use this structure in the active workspace:

```text
work/
├── 00-lab-notes.md
├── 01-orchestration-plan.md
├── 02-specialist-outputs/
├── 03-team-collaboration.md
├── 04-cross-review-notes.md
├── 05-stage-gate-review.md
└── 06-final-output.md
```

Each workflow phase maps to a specific output path. The numbered laboratory phases (evidence review, plan formulation, execution, results analysis) are not separate files: they are materialized as one file per specialist inside `work/02-specialist-outputs/`.

| Phase | Output path |
| --- | --- |
| Lab setup | `work/00-lab-notes.md` |
| Orchestration | `work/01-orchestration-plan.md` |
| Evidence review, plan, execution, results (one file per specialist) | `work/02-specialist-outputs/NN-<role>.md` |
| Team collaboration (consolidated by the orchestrator) | `work/03-team-collaboration.md` |
| Cross-review | `work/04-cross-review-notes.md` |
| Stage-gate review | `work/05-stage-gate-review.md` |
| Final synthesis | `work/06-final-output.md` |

Do not create or write `work/06-final-output.md` until `work/05-stage-gate-review.md` says `Approved`.

## Workflow

1. Read `references/workflow.md` for the canonical phase sequence.
2. Read `references/generalized-lab-model.md` to map the user's use case onto the laboratory phases.
3. Read `references/agent-roles.md` before selecting specialists.
4. Read `references/quality-rules.md` before cross-review, stage-gate review, and final synthesis.
5. Use `references/implementation-notes.md` for script use, subagent behavior, and file-handling details.
6. Use templates from `assets/templates/` for generated workflow files.
7. Consult `references/example-run.md` for a worked end-to-end example when unsure about expected output quality.

## Scale To The Brief

Match workflow weight to the brief. Do not run a full multi-wave laboratory for a small question.

- Small or narrow brief: use one or two specialists, run a single wave, and fold collaboration into the orchestrator's notes instead of a separate exchange. Keep cross-review, stage-gate, and final synthesis as a single quick pass each.
- Medium brief: use a few specialists across one or two waves with a light team-collaboration step.
- Large or regulated brief: use the full phase sequence, multiple waves, explicit team collaboration, and the relevant review roles.

Always keep the mandatory minimum regardless of size: evidence/context review, plan formulation, execution or investigation, results analysis, risk/assumptions coverage, and the stage-gate quality gate before final synthesis. Everything else is optional and added only when it materially changes the deliverable. See `references/generalized-lab-model.md` for the scaling detail.

## Execution Rules

- Select the fewest specialist roles that cover the brief well.
- Always include evidence/context review, plan formulation, execution or investigation, results analysis, and risk/assumptions coverage.
- Prefer real parallel subagents. They are the primary execution model for this skill, not an optional enhancement.
- In each phase, spawn all independent specialists before waiting for results. Do not run independent specialists one at a time when parallel subagents are available.
- Otherwise, simulate specialists as isolated passes. Each pass must read only the brief, orchestration plan, and its assigned scope before writing its own file.
- Never collapse specialist analysis, cross-review, stage-gate review, and final synthesis into one response.
- Parallelize independent specialist work, but keep dependency gates sequential: review before plan, plan before execution, execution before results analysis, review before final report.
- Require citations or source notes for factual claims when sources are available.
- Mark unsupported claims as assumptions or inferences.
- Preserve uncertainty and regulated-domain review boundaries.

## Collaborative Team Protocol

- Treat subagents as a collaborating team, not disconnected report writers.
- The Master Orchestrator defines team roles, ownership, dependencies, and collaboration rules in `work/01-orchestration-plan.md`.
- Each subagent writes only its own specialist output file, and returns its questions, dependencies, disagreements, and handoff notes to the orchestrator (in its result, not by editing a shared file).
- The orchestrator consolidates those returned notes into `work/03-team-collaboration.md`. Never have multiple subagents write the same file concurrently.
- The team must reconcile shared assumptions before cross-review.
- Cross-review evaluates both specialist outputs and the team collaboration record.
- Final synthesis must reflect resolved agreements, unresolved disagreements, and important minority views.

## Stop Conditions

Stop and ask the user only when:

- The subject or goal is not identifiable.
- The desired output cannot be inferred.
- Key constraints conflict.
- Required external data, credentials, private systems, paid tools, or unavailable network access block the work.
- Legal, medical, financial, compliance, security, or safety-critical advice cannot be kept within a safe informational boundary.

## Completion

When the workflow completes, tell the user which files were created and whether the stage gate approved final synthesis. Keep the completion message concise.
