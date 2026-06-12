# Workflow Reference

This is the canonical workflow for the Agentic R&D skill. It generalizes the Agent Laboratory pattern beyond scientific research.

## Activation

Run this workflow when the user asks for structured research, product planning, business analysis, technical feasibility, strategy, market or competitor research, risk review, investigation, experimentation, or a similar evidence-aware deliverable.

The user may provide an existing `project-brief.md`, a natural-language idea, or a partially complete brief.

## Phase To Output Map

The numbered laboratory phases below do not each get their own file. Evidence review, plan formulation, execution, and results analysis are produced as one file per specialist inside `work/02-specialist-outputs/`. The remaining phases each own a single file.

| Phase | Output path |
| --- | --- |
| Phase 0 Lab Setup | `work/00-lab-notes.md` |
| Phase 1 Orchestration | `work/01-orchestration-plan.md` |
| Phases 2-6 Evidence, Plan, Execution, Results, Specialist Outputs | `work/02-specialist-outputs/NN-<role>.md` (one per specialist) |
| Phase 7 Team Collaboration | `work/03-team-collaboration.md` (consolidated by the orchestrator) |
| Phase 8 Cross-Review | `work/04-cross-review-notes.md` |
| Phase 9 Stage-Gate Review | `work/05-stage-gate-review.md` |
| Phase 10 Final Synthesis | `work/06-final-output.md` |

Phase 6 (Specialist Outputs) is the phase in which the Phase 2-5 lab work is materialized as specialist files; it is not a separate stage that runs after results analysis.

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

## Phase 0: Lab Setup

Create `work/00-lab-notes.md` from `assets/templates/lab-notes.md`.

Use this file to capture user notes, constraints, resources, available tools, source-access limitations, language preferences, human review requirements, and checkpoint notes. Keep it updated when important constraints or blockers appear.

Treat the user as the pilot. The workflow may proceed autonomously between normal phases, but it must stop when the user's judgment, private input, credentials, paid tools, or regulated-domain approval is required.

## Phase 1: Orchestration

Act as Master Orchestrator.

Read `project-brief.md`, classify the project, choose specialist roles, and write `work/01-orchestration-plan.md` using `assets/templates/orchestration-plan.md`.

The orchestration plan must map the brief to the generalized Agent Laboratory phases: Evidence And Context Review, Plan Formulation, Resource Preparation, Execution Or Investigation, Results Analysis, Cross-Review, Stage-Gate Review, and Final Synthesis.

## Parallel Subagent Waves

Use real parallel subagents as the normal execution model when the environment supports them.

Organize work into waves:

1. Evidence wave: independent context, source, market, technical, user, risk, or domain reviewers.
2. Planning wave: plan formulation plus domain-specific plan critiques when they depend only on evidence outputs.
3. Preparation wave: independent resource, data, document, code, scenario, or benchmark preparation.
4. Execution wave: disjoint experiments, investigations, comparisons, analyses, or implementation-planning slices.
5. Results wave: independent interpretation by domain, evidence slice, or scenario.

Spawn every independent agent in a wave before waiting. Wait at phase gates where downstream work depends on the completed wave.

Cross-review, stage-gate review, and final synthesis remain sequential quality gates.

## Phase 2: Evidence And Context Review

Run evidence/context specialists independently. This is the universal equivalent of Agent Laboratory's literature review.

Relevant sources may include academic papers, web sources, code, documentation, internal files, market data, competitor pages, benchmarks, policies, user notes, or other domain materials.

## Phase 3: Plan Formulation

After evidence/context review, create a focused plan for the work to execute.

The plan must state:

- What will be investigated, tested, compared, designed, or modeled.
- What resources or inputs are needed.
- What success criteria and evaluation standards will be used.
- What cannot be verified with available tools.

## Phase 4: Resource Preparation And Execution

Prepare the required resources and run the planned investigation.

Depending on the brief, execution may mean experiments, code inspection, market comparison, architecture analysis, scenario modeling, user-research synthesis, risk assessment, compliance mapping, prototype review, or implementation planning.

Do not run destructive actions, paid tools, private systems, or credentialed external operations unless the user has clearly authorized them.

For repeated execution failures, use the repair limit from `references/generalized-lab-model.md`.

## Phase 5: Results Analysis

Analyze execution outputs before cross-review.

Separate:

- Observed evidence.
- Inferences.
- Assumptions.
- Failed or inconclusive attempts.
- Trade-offs.
- Recommendations.

## Phase 6: Specialist Outputs

Run each selected specialist independently.

Each specialist must:

- Read `project-brief.md`.
- Read `work/01-orchestration-plan.md`.
- Stay inside its assigned scope.
- Separate facts, assumptions, inferences, risks, and recommendations.
- Cite sources when available.
- State uncertainty clearly.
- Write one file under `work/02-specialist-outputs/` (its own file only).
- Return collaboration notes (questions, dependencies, disagreements, handoffs) to the orchestrator in its result, rather than editing any shared file.

Use file names like `work/02-specialist-outputs/01-research-context-agent.md`.

## Phase 7: Team Collaboration Phase

After specialist outputs exist, the orchestrator consolidates the collaboration notes returned by each subagent into `work/03-team-collaboration.md` using `assets/templates/team-collaboration.md`. Only the orchestrator writes this file, so parallel subagents never contend for it.

The team collaboration phase must:

- List active team members and owned files.
- Capture agent-to-agent questions and answers.
- Record dependencies and handoffs.
- Reconcile shared assumptions where possible.
- Preserve disagreements and minority views.
- Identify what cross-review should inspect.

This phase is collaborative but not the same as cross-review. Collaboration lets the team exchange information; cross-review evaluates quality, conflicts, and readiness.

## Phase 8: Cross-Review

After all specialist outputs exist, run cross-review.

The Cross-Review Agent reads all specialist outputs plus `work/03-team-collaboration.md` and writes `work/04-cross-review-notes.md` using `assets/templates/cross-review-notes.md`.

If cross-review finds required revisions, update the relevant specialist files with a `Revisions After Cross-Review` section before stage-gate review.

## Phase 9: Stage-Gate Review

Run the Stage Gate Reviewer after cross-review and required revisions.

The reviewer writes `work/05-stage-gate-review.md` using `assets/templates/stage-gate-review.md`.

Decision options:

- `Approved`: final synthesis may begin.
- `Needs Revision`: return to one or more specialists for targeted fixes.
- `Blocked`: stop and ask the user for clarification or missing external input.

Score the package from 0 to 10. Only approve with score 8 or higher and no blocking issues.

Allow a maximum of two revision rounds unless the user explicitly authorizes more. If the same issue remains after two rounds, mark the phase `Blocked`.

## Phase 10: Final Synthesis

Only begin final synthesis after `work/05-stage-gate-review.md` says `Approved`.

The Final Synthesizer must use only approved specialist outputs, team collaboration notes, cross-review notes, and the stage-gate review. It writes `work/06-final-output.md` using `assets/templates/final-output.md` unless the brief requires a different structure.

The final output must resolve conflicts explicitly, preserve important uncertainty, distinguish evidence from assumptions, and convert analysis into practical recommendations.
