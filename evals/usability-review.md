# Utility And UX Review

Historical snapshot: 2026-07-18, v1 working tree on Windows 11. Values below are retained as dated evidence and are not current package metrics. See [`dogfood-v1.0.0.md`](dogfood-v1.0.0.md) and run `npm run benchmark` for current evidence. This is a structured maintainer evaluation, not an independent user study, and it does not establish model-quality, token-cost, or business-outcome improvements.

## Evaluation Method

- Exercised initialization, resume, readable phase aliases, lazy artifact creation, ordered transitions, revision limits, stage-gate enforcement, stale-final recovery, and final validation in isolated workspaces.
- Ran host discovery or activation checks on Codex, Claude Code, GitHub Copilot CLI, and OpenCode. Gemini CLI remained documentation-only because no local binary was available.
- Benchmarked the dependency-free CLI against a completed standard-profile workspace containing four evidence artifacts, four execution artifacts, two result artifacts, and approximately 126 KiB of artifact data.
- Reviewed realistic task classes against five value signals: evidence diversity, specialist diversity, durable trace needs, decision risk or uncertainty, and cross-review value.
- Dogfooded the workflow on this repository's own v1 modernization: the task combined reference comparison, architecture, CLI design, portability, safety, testing, CI, documentation, and release-readiness concerns. This is a real high-fit case, but it is not an independent comparison because the maintainer and evaluator are the same workstream.

## Real-Case Utility

| Case | Fit | Recommended mode | Why |
| --- | --- | --- | --- |
| Full repository architecture or modernization review | High | `standard` | Benefits from code evidence, architecture and operations views, explicit trade-offs, and an implementation-ready synthesis. |
| Product or technical feasibility decision | High | `compact` or `standard` | Separating evidence from inference and preserving rejected options improves decision quality and handoff. |
| Multi-source incident investigation | Medium to high | `compact` when urgent | The evidence log and failed-attempt record are useful, but a full multi-wave process can slow immediate containment. |
| Regulated or safety-sensitive assessment | Process value high; subject-matter authority limited | `extended` with qualified review | The workflow strengthens traceability and review gates but cannot replace a qualified professional. |
| Routine bug fix, small refactor, or simple factual answer | Low or negative | Do not activate | The artifact and gate overhead costs more than it contributes. |

The main utility boundary is therefore task selection, not maximum orchestration. The v1 activation rule requires at least two value signals unless the user explicitly requests the skill.

## UX Findings

| Journey stage | Result | Evidence and remaining trade-off |
| --- | --- | --- |
| Discovery and installation | Good | Standard `skills/agentic-rd-skill/` package, self-contained license, and verified discovery on several hosts. Host invocation and permissions still differ. |
| Starting a run | Good | One dependency-free command creates a safe resumable workspace. The brief is intentionally detailed and still requires agent/user effort to complete. |
| Moving through phases | Good after v1 changes | `in_progress` lazily creates the first template; readable `cross-review` and `stage-gate` aliases remove internal camel-case friction. |
| Knowing what to do next | Good | Text status reports active state, revision budget, stale-output state, and a next action. JSON remains stable for automation. |
| Recovering from revision | Strong | Later statuses are invalidated, user artifacts are preserved, and an existing final becomes explicitly stale instead of being overwritten or silently reused. |
| Final approval | Strong but deliberate | A numeric five-dimension gate blocks premature synthesis. The extra step is justified only for substantive work. |
| Compact-profile efficiency | Acceptable with a narrow activation rule | It reduces agents and waves but retains the full evidence trail. For ordinary coding tasks the correct UX is non-activation, not a smaller laboratory. |

## Local Performance Snapshot

Environment: Node.js 24.18.0, Windows x64, AMD Ryzen 9 7900X, 24 logical CPUs, 31.1 GiB RAM. Each command ran in a fresh Node.js process with 15 samples; `status` and `validate` received one warm-up.

| Metric | Result | Regression budget |
| --- | ---: | ---: |
| Installable package | 18 files, 57,507 bytes | at most 262,144 bytes |
| `init` p50 / p95 | 57.18 / 75.13 ms | p95 at most 750 ms |
| `status` p50 / p95 | 48.42 / 69.62 ms | p95 at most 500 ms |
| `validate` p50 / p95 | 52.76 / 75.06 ms | p95 at most 750 ms |

These figures validate that local workflow bookkeeping is negligible relative to model work on this machine. They do not measure end-to-end research latency, model tokens, source quality, or comparison with Agent Laboratory.

Compatibility runs used the same workload and 15-sample method:

| Runtime | `init` p95 | `status` p95 | `validate` p95 | Result |
| --- | ---: | ---: | ---: | --- |
| Node.js 20.20.2 | 71.21 ms | 64.25 ms | 69.21 ms | Passed |
| Node.js 22.23.1 | 57.50 ms | 54.39 ms | 68.03 ms | Passed |
| Node.js 24.18.0 | 75.13 ms | 69.62 ms | 75.06 ms | Passed |

## Remaining Validation Needed

- Run blinded, repeated with-skill versus without-skill evaluations on the same substantive tasks and models.
- Collect user completion rate, clarification count, time to approved deliverable, revision count, token or cost data when exposed, and rubric-scored output quality.
- Add Gemini CLI activation evidence when the binary is available.
- Repeat benchmarks on Linux and macOS CI hardware before treating current timing budgets as cross-platform baselines.
