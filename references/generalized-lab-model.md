# Generalized Agent Laboratory Model

This skill generalizes the Agent Laboratory workflow to every structured use case.

Agent Laboratory is an autonomous research workflow built around literature review, experimentation, and report writing. It also uses plan formulation, data preparation, experiment execution, and comprehensive report generation. This skill keeps that structure but replaces science-specific terms with domain-neutral equivalents.

Source model:

- Agent Laboratory website: https://agentlaboratory.github.io/
- Agent Laboratory code: https://github.com/SamuelSchmidgall/AgentLaboratory
- Agent Laboratory paper: https://arxiv.org/abs/2501.04227

## Core Principles To Preserve

- The human is the pilot. The agent laboratory assists with structured work, evidence gathering, execution, documentation, and review; it does not replace user judgment.
- Adapt to available resources. If browsing, datasets, code execution, paid APIs, private systems, GPUs, or other resources are unavailable, record the limitation in `work/00-lab-notes.md` and continue with bounded assumptions when safe.
- Use specialized agents. Each agent owns a narrow lab function and writes its own output before review or synthesis.
- Iterate within limits. Execution agents may repair failed non-destructive attempts, but repeated failure must be recorded rather than hidden.
- Produce artifacts. The value of the workflow is the file trail: notes, plans, specialist outputs, review notes, stage-gate decision, and final deliverable.

## Universal Phase Mapping

| Agent Laboratory Phase | Universal Skill Phase | Purpose |
| --- | --- | --- |
| Literature Review | Evidence And Context Review | Collect, inspect, and summarize relevant background, sources, constraints, examples, prior work, and known unknowns. |
| Plan Formulation | Plan Formulation | Turn the brief and evidence into a concrete investigation, experiment, strategy, or implementation plan. |
| Data Preparation | Resource Preparation | Identify datasets, documents, code, tools, assumptions, scenarios, benchmarks, user inputs, or other working materials needed for execution. |
| Running Experiments | Execution Or Investigation | Run the planned analysis, prototype, experiment, benchmark, comparison, design study, market scan, risk assessment, or feasibility work. |
| Results Interpretation | Results Analysis | Interpret outputs, compare alternatives, identify trade-offs, and separate evidence from inference. |
| Report Writing | Final Synthesis | Produce the requested deliverable only after review gates approve the intermediate work. |

## Use-Case Translation

- Scientific research: literature review, hypothesis, experiment design, execution, results, paper-style report.
- Product strategy: market and user evidence, MVP hypotheses, roadmap options, trade-off analysis, strategy memo.
- Business planning: market context, assumptions, scenarios, economics, risks, business plan.
- Technical feasibility: docs and code review, architecture plan, prototype or benchmark, risk analysis, feasibility report.
- UX research: user context, research plan, journey or usability analysis, findings, design recommendations.
- Security and privacy: threat context, assessment plan, control review, risk analysis, mitigation report.
- Legal or compliance: source review, issue framing, risk analysis, informational memo with required human review.
- Operations: current-state review, process plan, resource and dependency analysis, rollout plan.

## Operating Principle

Do not treat all tasks as a simple report-writing job. Run the laboratory loop:

1. Understand the brief.
2. Review evidence.
3. Formulate the plan.
4. Prepare resources.
5. Execute or investigate.
6. Analyze results.
7. Cross-review.
8. Gate quality.
9. Write the final deliverable.

When an environment supports subagents, use them as the laboratory staff. When it does not, simulate staff as isolated passes with separate output files.

## Scale To The Brief

The laboratory loop is a maximum, not a fixed cost. Match its weight to the brief so a small question does not trigger a full multi-wave lab.

- Trivial brief: a single inline orchestrator pass, no subagents. Capture evidence, assumptions, and risks in `work/00-lab-notes.md`, do a short stage-gate self-check in `work/05-stage-gate-review.md`, then write `work/06-final-output.md`. Intermediate specialist, collaboration, and cross-review files are optional here. The stage-gate invariant still applies: no `06-final-output.md` until `05-stage-gate-review.md` is `Approved`.
- Small or narrow brief: one or two specialists, a single wave, collaboration folded into the orchestrator's notes, and one quick pass each for cross-review, stage-gate, and final synthesis.
- Medium brief: a few specialists across one or two waves with a light team-collaboration step.
- Large or regulated brief: the full phase sequence, multiple waves, explicit team collaboration, and all relevant review and domain roles.

Mandatory minimum at every size: evidence/context review, plan formulation, execution or investigation, results analysis, risk and assumptions coverage, and the stage-gate quality gate before final synthesis. Add any other role, wave, or revision round only when it materially changes the deliverable. When in doubt, prefer fewer specialists with sharper scopes over many overlapping ones.

## Execution Repair Limit

When the plan includes execution, code inspection, prototype checks, data analysis, or benchmark-style work:

- Try to diagnose and repair failed non-destructive attempts.
- Allow up to three focused repair attempts for the same failure class.
- If the same issue remains after three attempts, stop that execution path, document the failure, and move the issue to review or user clarification.
- Never conceal failed attempts from cross-review or final synthesis.
