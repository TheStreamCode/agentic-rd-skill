---
name: agentic-rd-skill
description: Run a universal Agent Laboratory style workflow for any structured research, product, business, technical, strategy, feasibility, investigation, planning, or analysis deliverable. Use when the user wants an autonomous multi-agent process with evidence review, plan formulation, execution or investigation, results analysis, review gates, and final synthesis.
license: MIT
---

# Agentic R&D Workflow

Use this self-contained skill package to automate a Markdown-first, multi-agent laboratory workflow inside the current workspace.

This is a general-purpose adaptation of the Agent Laboratory pattern: independent evidence review, collaborative plan formulation, task execution or investigation, results analysis, quality review, and final report writing. It is not limited to scientific research; apply the same lab workflow to product, business, technical, strategy, legal, compliance, security, UX, market, and operational use cases.

Designed for skill-compatible coding agents with filesystem access. Subagent support is optional; use isolated simulated passes when real subagents are unavailable.

## Package Contents

- `SKILL.md`: activation rules and core operating instructions.
- `references/generalized-lab-model.md`: universal Agent Laboratory model and use-case mapping.
- `references/workflow.md`: full phase sequence and approval gate.
- `references/agent-roles.md`: specialist role selection guidance.
- `references/quality-rules.md`: evidence, uncertainty, review, and safety standards.
- `references/implementation-notes.md`: install, scaffold, subagent, and file-handling notes.
- `assets/templates/`: Markdown templates for all workflow files.
- `scripts/init-rd-workflow.mjs`: optional scaffold script.
- `scripts/validate-skill.mjs`: repository validation for the public skill package.

## First Action

1. Look for `project-brief.md` in the current workspace.
2. If it exists, read it completely before any other workflow step.
3. If it does not exist and the user gave enough context, create it with `assets/templates/project-brief.md`.
4. If essential context is missing, ask only the minimum blocking questions.
5. After the brief exists, continue without asking for permission between normal workflow phases.

You may run `scripts/init-rd-workflow.mjs` to scaffold `project-brief.md` and the required `work/` files. The script must not create `work/05-final-output.md`.

## Required Outputs

Create and use this structure in the active workspace:

```text
work/
├── 00-lab-notes.md
├── 01-orchestration-plan.md
├── 02-specialist-outputs/
├── 03-cross-review-notes.md
├── 04-stage-gate-review.md
└── 05-final-output.md
```

Do not create or write `work/05-final-output.md` until `work/04-stage-gate-review.md` says `Approved`.

## Workflow

1. Read `references/workflow.md` for the canonical phase sequence.
2. Read `references/generalized-lab-model.md` to map the user's use case onto the laboratory phases.
3. Read `references/agent-roles.md` before selecting specialists.
4. Read `references/quality-rules.md` before cross-review, stage-gate review, and final synthesis.
5. Use `references/implementation-notes.md` for script use, subagent behavior, and file-handling details.
6. Use templates from `assets/templates/` for generated workflow files.

## Execution Rules

- Select the fewest specialist roles that cover the brief well.
- Always include evidence/context review, plan formulation, execution or investigation, results analysis, and risk/assumptions coverage.
- Use real subagents when the coding-agent environment supports them and the user has allowed subagent work.
- Otherwise, simulate specialists as isolated passes. Each pass must read only the brief, orchestration plan, and its assigned scope before writing its own file.
- Never collapse specialist analysis, cross-review, stage-gate review, and final synthesis into one response.
- Parallelize independent specialist work when possible, but keep dependency gates sequential: review before plan, plan before execution, execution before results analysis, review before final report.
- Require citations or source notes for factual claims when sources are available.
- Mark unsupported claims as assumptions or inferences.
- Preserve uncertainty and regulated-domain review boundaries.

## Stop Conditions

Stop and ask the user only when:

- The subject or goal is not identifiable.
- The desired output cannot be inferred.
- Key constraints conflict.
- Required external data, credentials, private systems, paid tools, or unavailable network access block the work.
- Legal, medical, financial, compliance, security, or safety-critical advice cannot be kept within a safe informational boundary.

## Completion

When the workflow completes, tell the user which files were created and whether the stage gate approved final synthesis. Keep the completion message concise.
