# Agent Roles Reference

Select the fewest roles that cover the brief well. Too many specialists create duplication and weak synthesis.

The default mental model is an Agent Laboratory adapted to the user's domain. Keep the lab functions present even when role names change.

## Always Present

- Master Orchestrator: reads the brief, classifies the project, selects roles, and writes the orchestration plan.
- Evidence And Context Review Agent: establishes background, definitions, constraints, current state, prior work, source context, and known unknowns.
- Plan Formulation Agent: turns the brief and evidence review into the concrete investigation, experiment, analysis, or implementation plan.
- Resource Preparation Agent: identifies required data, documents, code, sources, tools, assumptions, scenarios, or benchmarks.
- Execution Or Investigation Agent: carries out the planned work inside the allowed environment.
- Results Analysis Agent: interprets execution outputs and separates evidence from inference.
- Risk and Assumptions Agent: identifies assumptions, uncertainty, failure modes, safety concerns, and review boundaries.
- Cross-Review Agent: compares specialist outputs and requests targeted revisions.
- Stage Gate Reviewer: blocks progression unless the package is strong enough for synthesis.
- Final Synthesizer: writes the final deliverable after approval.

## Optional Specialists

- Market Research Agent: market size, trends, customer segments, demand, category dynamics.
- Competitor Analysis Agent: alternatives, positioning, differentiation, substitution risks.
- Product Strategy Agent: value proposition, MVP scope, roadmap, user value, prioritization.
- Technical Feasibility Agent: architecture, implementation complexity, integrations, build risks.
- Business Model Agent: pricing, revenue model, cost structure, unit economics.
- Go-To-Market Agent: acquisition channels, positioning, messaging, launch sequence.
- Legal and Compliance Analysis Agent: laws, regulatory exposure, policy constraints, review needs.
- Scientific Literature Agent: papers, prior work, methods, evidence strength.
- Data and Experiment Design Agent: datasets, metrics, study design, evaluation plan.
- UX and User Research Agent: user needs, workflows, personas, usability risks.
- Security and Privacy Agent: threat model, data handling, privacy risks, control recommendations.
- Operations and Implementation Agent: resourcing, dependencies, rollout, operating model.

## Selection Rules

- Include a role only when its scope materially changes the final deliverable.
- Merge nearby concerns into one role when the brief is narrow.
- Split roles when different evidence bases or review standards are needed.
- For regulated or sensitive domains, include the relevant review role and state human review requirements.
- Avoid assigning final synthesis responsibilities to specialists.

## Role Mapping Examples

- Scientific task: Evidence And Context Review, Plan Formulation, Resource Preparation, Execution Or Investigation, Results Analysis, Scientific Literature, Risk and Assumptions.
- Product task: Evidence And Context Review, Product Strategy, UX and User Research, Market Research, Results Analysis, Risk and Assumptions.
- Technical task: Evidence And Context Review, Technical Feasibility, Execution Or Investigation, Security and Privacy if relevant, Results Analysis.
- Business task: Evidence And Context Review, Market Research, Competitor Analysis, Business Model, Go-To-Market, Results Analysis.
- Regulated task: Evidence And Context Review, Legal and Compliance or Security and Privacy, Risk and Assumptions, Results Analysis, explicit human review.
