# Example Run

A compact, end-to-end walkthrough of one workflow run. The content is synthetic and abbreviated to show the expected file trail, the separation of evidence from assumptions, and the review gates. Real runs are longer and cite real sources.

Brief used for this example: a small technical-feasibility question, which scales to a light run (two specialists, one wave). See "Scale To The Brief" in `generalized-lab-model.md`.

## project-brief.md

- Subject: Feasibility of adding offline sync to an existing notes web app.
- Goal: Decide whether offline-first sync is viable for a 3-engineer team in one quarter.
- Desired output: Short feasibility memo with a go / no-go recommendation.
- Audience: Engineering lead.
- Constraints: Existing React + Postgres stack; no new backend service this quarter.
- Success criteria: Clear recommendation, main risks, and a rough implementation shape.
- Human review requirements: None (no regulated domain).

## work/01-orchestration-plan.md (excerpt)

- Primary type: Technical feasibility.
- Execution mode: Real subagents available: yes. Single evidence+feasibility wave.
- Selected specialists:

| Agent | Scope | Output File |
| --- | --- | --- |
| Evidence And Context Review | Current stack, offline-sync approaches (CRDT vs last-write-wins), library options | `work/02-specialist-outputs/01-evidence-context.md` |
| Technical Feasibility | Effort, integration risk, fit with the one-quarter / no-new-service constraint | `work/02-specialist-outputs/02-technical-feasibility.md` |

Results analysis and risk coverage are folded into the feasibility specialist for this small brief; cross-review, stage-gate, and synthesis run as single passes.

## work/02-specialist-outputs/01-evidence-context.md (excerpt)

- Laboratory Phase: Evidence Review.
- Key findings:
  - Two dominant offline-sync models: CRDT-based (e.g., Yjs/Automerge) and server-authoritative last-write-wins.
  - CRDTs handle concurrent edits without a central merge authority but add client complexity and storage overhead.
- Evidence and sources: Library docs and project READMEs for Yjs and Automerge (consulted at run time).
- Assumptions: Notes are small text documents; concurrent multi-device edits are occasional, not constant.
- Risks and uncertainties: CRDT storage growth over time is unverified for this data shape.
- Questions for other agents: Does the no-new-service constraint rule out a sync server, or only a *separate* service?

## work/02-specialist-outputs/02-technical-feasibility.md (excerpt)

- Laboratory Phase: Execution / Results Analysis / Risk Review.
- Key findings:
  - Last-write-wins on top of the existing API is achievable in a quarter; CRDT sync is not, given the constraint.
  - IndexedDB + a sync queue reuses the current Postgres API and adds no new service.
- Observed evidence vs inference: Effort estimate is an inference from comparable migrations, not a measured benchmark.
- Recommendation: Ship last-write-wins offline mode this quarter; defer CRDTs.
- Risks: Conflict UX for simultaneous edits; needs an explicit conflict-resolution rule.

## work/03-team-collaboration.md (excerpt, consolidated by the orchestrator)

- The evidence agent's question (does the constraint forbid a sync server?) was answered by the feasibility agent: the chosen approach adds no service, so the question is moot for the recommended path.
- Shared assumption reconciled: edits are occasional, which is what makes last-write-wins acceptable.
- Preserved minority view: if real-time collaborative editing becomes a goal, CRDTs should be revisited.

## work/04-cross-review-notes.md (excerpt)

- Agreement: both specialists converge on last-write-wins for this quarter.
- Weak reasoning flagged: effort estimate lacks a basis; require the feasibility file to label it an inference. (Revision applied.)
- Guidance for synthesis: state the conflict-resolution rule as an open design task.

## work/05-stage-gate-review.md (excerpt)

- Alignment with brief: strong. Evidence quality: adequate for a feasibility memo.
- Score: 8 / 10. No blocking issues.
- Decision: Approved.

## work/06-final-output.md (excerpt)

- Recommendation: Go, with a reduced scope. Implement last-write-wins offline mode using IndexedDB and a sync queue on the existing API.
- Why: Fits the one-quarter, no-new-service constraint; CRDTs do not.
- Main risks: Conflict UX; storage growth (unverified). Open design task: define the conflict-resolution rule before build.
- Evidence vs assumption: The effort estimate is an inference, not a benchmark; validate with a one-week spike.
