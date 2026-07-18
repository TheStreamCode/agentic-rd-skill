# Compact Example Run

Request: assess whether an existing notes application can add offline sync within one quarter without a new backend service.

1. Initialize with the `compact` profile.
2. Fill the brief with the current React/Postgres stack, one-quarter constraint, engineering-lead audience, and final-only human review.
3. Write `01-evidence/01-orchestrator.md` comparing server-authoritative last-write-wins and CRDT approaches, with sources and assumptions.
4. Reconcile the main assumption in the run log: concurrent edits are occasional.
5. Write `02-plan.md` with a bounded feasibility investigation and acceptance criteria.
6. Write `03-execution/01-orchestrator.md` with architecture inspection and effort evidence.
7. Write `04-results/01-orchestrator.md`, separating observed integration constraints from inferred effort.
8. Cross-review flags the unmeasured effort estimate; revise the results to label it as an inference.
9. Stage gate scores 8/10 with no blocker and approves.
10. Final synthesis recommends last-write-wins via IndexedDB and the existing API, records conflict UX as a risk, and proposes a one-week spike.

The example is intentionally synthetic. A real run must cite sources actually consulted and record checks actually performed.
