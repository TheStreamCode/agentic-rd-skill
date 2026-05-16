---
name: agentic-rd-skill
description: Run a universal file-driven agentic research and development workflow for structured research, product strategy, business analysis, technical feasibility, planning, market research, competitor analysis, risk review, and final synthesis. Use when the user asks for a structured deliverable or to run an agentic R&D workflow.
license: MIT
---

# Agentic R&D Workflow

Use this self-contained skill package to automate a Markdown-first, multi-agent research and planning workflow inside the current workspace.

Designed for skill-compatible coding agents with filesystem access. Subagent support is optional; use isolated simulated passes when real subagents are unavailable.

## Package Contents

- `SKILL.md`: activation rules and core operating instructions.
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
├── 01-orchestration-plan.md
├── 02-specialist-outputs/
├── 03-cross-review-notes.md
├── 04-stage-gate-review.md
└── 05-final-output.md
```

Do not create or write `work/05-final-output.md` until `work/04-stage-gate-review.md` says `Approved`.

## Workflow

1. Read `references/workflow.md` for the canonical phase sequence.
2. Read `references/agent-roles.md` before selecting specialists.
3. Read `references/quality-rules.md` before cross-review, stage-gate review, and final synthesis.
4. Use `references/implementation-notes.md` for script use, subagent behavior, and file-handling details.
5. Use templates from `assets/templates/` for generated workflow files.

## Execution Rules

- Select the fewest specialist roles that cover the brief well.
- Always include Research Context and Risk and Assumptions specialist work.
- Use real subagents when the coding-agent environment supports them and the user has allowed subagent work.
- Otherwise, simulate specialists as isolated passes. Each pass must read only the brief, orchestration plan, and its assigned scope before writing its own file.
- Never collapse specialist analysis, cross-review, stage-gate review, and final synthesis into one response.
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
