# Quality Rules Reference

Use these rules for every workflow phase.

## Evidence And Uncertainty

- Cite sources when available.
- Separate evidence, assumptions, inferences, risks, and recommendations.
- Do not invent sources, statistics, benchmarks, or case studies.
- Label unverified claims clearly.
- State what could not be verified.
- Keep recommendations traceable to findings.

## Specialist Quality

Each specialist output must:

- Answer its assigned scope.
- Avoid solving unrelated scopes unless there is a direct dependency.
- Include useful inputs for final synthesis.
- Raise questions for other agents when dependencies exist.
- Add `Revisions After Cross-Review` when revisions are requested.

## Cross-Review Quality

Cross-review must identify:

- Agreements across specialist outputs.
- Conflicts or inconsistent assumptions.
- Missing evidence or weak reasoning.
- Duplicated claims.
- Required revisions with owners and reasons.
- Guidance for final synthesis.

Cross-review does not approve the workflow. Approval is the Stage Gate Reviewer's job.

## Stage-Gate Quality

The Stage Gate Reviewer evaluates alignment with the brief, coverage, evidence quality, assumption clarity, conflict resolution, risk identification, completeness, safety, and readiness for synthesis.

Scores:

- 0-3: not usable.
- 4-5: major revisions required.
- 6-7: usable but needs targeted revision.
- 8-9: strong enough to proceed.
- 10: excellent and ready for synthesis.

Only approve with score 8 or higher and no blocking issues.

## Final Synthesis Quality

The final synthesis must:

- Use only approved specialist outputs, cross-review notes, and stage-gate review.
- Resolve or explain conflicts.
- Remove duplication.
- Preserve important uncertainty.
- Distinguish evidence from assumptions.
- Convert analysis into practical recommendations.
- Include risks, limitations, open questions, and human review requirements.

## Regulated And Sensitive Domains

Treat legal, medical, financial, compliance, security, employment, insurance, credit, and safety-critical outputs as informational. Require qualified human review before decisions or action.
