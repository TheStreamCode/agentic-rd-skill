# Workflow Reference

This is the canonical workflow for the Agentic R&D skill.

## Activation

Run this workflow when the user asks for structured research, product planning, business analysis, technical feasibility, strategy, market or competitor research, risk review, or a similar evidence-aware planning deliverable.

The user may provide an existing `project-brief.md`, a natural-language idea, or a partially complete brief.

## Brief Intake

The project brief must identify:

- Subject: what is being researched, planned, designed, or analyzed.
- Goal: what the workflow should accomplish.
- Desired output: final deliverable format.
- Audience: who will use the output.
- Constraints: scope, timeline, geography, technical limits, budget, or domain boundaries.
- Success criteria: what makes the final output useful.
- Human review requirements: legal, medical, financial, compliance, security, or safety-critical review boundaries.

If non-essential fields are unknown, continue and mark assumptions. Ask only for missing details that block a usable brief.

## Phase 1: Orchestration

Act as Master Orchestrator.

Read `project-brief.md`, classify the project, choose specialist roles, and write `work/01-orchestration-plan.md` using `assets/templates/orchestration-plan.md`.

The orchestration plan must define specialist scopes, output files, success criteria, execution mode, and stop conditions.

## Phase 2: Specialist Analysis

Run each selected specialist independently.

Each specialist must:

- Read `project-brief.md`.
- Read `work/01-orchestration-plan.md`.
- Stay inside its assigned scope.
- Separate facts, assumptions, inferences, risks, and recommendations.
- Cite sources when available.
- State uncertainty clearly.
- Write one file under `work/02-specialist-outputs/`.

Use file names like `work/02-specialist-outputs/01-research-context-agent.md`.

## Phase 3: Cross-Review

After all specialist outputs exist, run cross-review.

The Cross-Review Agent reads all specialist outputs and writes `work/03-cross-review-notes.md` using `assets/templates/cross-review-notes.md`.

If cross-review finds required revisions, update the relevant specialist files with a `Revisions After Cross-Review` section before stage-gate review.

## Phase 4: Stage-Gate Review

Run the Stage Gate Reviewer after cross-review and required revisions.

The reviewer writes `work/04-stage-gate-review.md` using `assets/templates/stage-gate-review.md`.

Decision options:

- `Approved`: final synthesis may begin.
- `Needs Revision`: return to one or more specialists for targeted fixes.
- `Blocked`: stop and ask the user for clarification or missing external input.

Score the package from 0 to 10. Only approve with score 8 or higher and no blocking issues.

Allow a maximum of two revision rounds unless the user explicitly authorizes more. If the same issue remains after two rounds, mark the phase `Blocked`.

## Phase 5: Final Synthesis

Only begin final synthesis after `work/04-stage-gate-review.md` says `Approved`.

The Final Synthesizer must use only approved specialist outputs, cross-review notes, and the stage-gate review. It writes `work/05-final-output.md` using `assets/templates/final-output.md` unless the brief requires a different structure.

The final output must resolve conflicts explicitly, preserve important uncertainty, distinguish evidence from assumptions, and convert analysis into practical recommendations.
