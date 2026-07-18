# Agentic R&D Skill

A portable Agent Skill for evidence-aware research, feasibility, strategy, investigation, product, business, and implementation-planning workflows. It combines native coding-agent capabilities with durable Markdown artifacts, explicit phase handoffs, deterministic state validation, and a quality gate before final synthesis.

<p align="center">
  <img src="assets/agentic-rd-skill-hero.png" alt="Pixel-art overview of Agentic R&D Skill turning a project brief into specialist work, review, and final outputs." width="100%">
</p>

## What It Improves

Agentic R&D keeps the useful Agent Laboratory pattern—evidence review, planning, execution, results interpretation, human guidance, and final reporting—while replacing a provider-specific research runtime with a portable workflow for modern coding agents.

- Uses native subagents when available and a single-agent fallback when they are not.
- Keeps evidence, plan, execution, results, review, and synthesis in separate artifacts with explicit read dependencies.
- Adds a dependency-free Node.js CLI for initialization, state, resume, transition checks, stage-gate enforcement, and validation.
- Scales from one orchestrator to bounded specialist waves without treating every request as a full laboratory.
- Requires authorization boundaries, source traceability, prompt-injection resistance, and qualified review for sensitive domains.

This is an independent adaptation, not a fork of the Agent Laboratory Python implementation. See [Agent Laboratory](https://github.com/SamuelSchmidgall/AgentLaboratory) and its [paper](https://arxiv.org/abs/2501.04227).

## Repository Layout

```text
.
├── skills/
│   └── agentic-rd-skill/   # Installable Agent Skill package
├── scripts/                # Repository validation, benchmarks, and host smokes
├── tests/                  # Deterministic CLI and package tests
├── evals/                  # Cross-host behavioral evaluation cases
└── README.md               # Repository documentation
```

The installable unit is [`skills/agentic-rd-skill`](skills/agentic-rd-skill), not the repository root. It includes its own copy of the MIT license so copied installations remain self-contained.

## Compatibility

The skill follows the open [Agent Skills specification](https://agentskills.io/specification). The portable contract is `SKILL.md`; discovery paths, permission models, invocation syntax, and native subagent APIs remain host-specific.

| Host | Project installation path | Verification |
| --- | --- | --- |
| Codex | `.agents/skills/agentic-rd-skill/` | Activation smoke passed on CLI 0.144.6 |
| Claude Code | `.claude/skills/agentic-rd-skill/` | Activation smoke passed on 2.1.214; host permissions remain authoritative |
| GitHub Copilot | `.agents/skills/agentic-rd-skill/` or `.github/skills/agentic-rd-skill/` | Discovery and activation smoke passed on CLI 1.0.71 |
| Gemini CLI | `.agents/skills/agentic-rd-skill/` or `.gemini/skills/agentic-rd-skill/` | Current official format/path documentation; not locally smoke-tested |
| OpenCode | `.agents/skills/agentic-rd-skill/` or `.opencode/skills/agentic-rd-skill/` | Discovery and activation smoke passed on 1.18.3 |

See [`references/compatibility.md`](skills/agentic-rd-skill/references/compatibility.md) for requirements and limitations. Filesystem access is required. Node.js 20 or newer is required only for the optional CLI; web access and subagents are optional.

## Install

With GitHub CLI 2.96 or newer, install directly from the repository. The `gh skill` command is currently a preview feature:

```powershell
gh skill install TheStreamCode/agentic-rd-skill agentic-rd-skill --agent codex --scope user
```

Replace `codex` with the target supported by `gh skill install --help`, such as `claude-code`, `github-copilot`, `gemini-cli`, or `opencode`. Without an explicit version, GitHub CLI resolves the latest tagged release and then falls back to the default branch.

For a manual installation, copy only the skill directory into the location used by your coding agent. For example, from PowerShell:

```powershell
New-Item -ItemType Directory -Force -Path "$HOME\.agents\skills" | Out-Null
Copy-Item -Recurse -Force ".\skills\agentic-rd-skill" "$HOME\.agents\skills\agentic-rd-skill"
```

Use the host-specific path from the compatibility table when the host does not discover `.agents/skills`.

The repository layout is also compatible with GitHub CLI skill discovery and release publishing. No v1 tag or GitHub release is created by the repository changes alone.

## Quick Start

Invoke the skill explicitly, then provide a substantial brief:

```text
Use the agentic-rd-skill skill to assess the technical and product feasibility of this idea and produce an evidence-backed recommendation.
```

The agent can initialize the current workspace with the bundled CLI:

```powershell
node <installed-skill-path>\scripts\rd.mjs init . --profile standard
```

Profiles:

- `compact`: one orchestrator and one wave for narrow, low-risk, substantive work.
- `standard`: default, with up to four specialists and two waves.
- `extended`: up to six specialists and three waves for broad or regulated work.

Simple questions and routine code edits should not activate this skill.

A practical activation rule is to use the skill only when at least two of these apply: multiple evidence sources, multiple specialties, a durable audit trail, meaningful decision risk or uncertainty, or valuable independent cross-review. This keeps the process useful without imposing laboratory overhead on ordinary coding work.

## Workflow Artifacts

```text
project-brief.md
work/
├── run-state.json
├── 00-run-log.md
├── 01-evidence/
├── 02-plan.md
├── 03-execution/
├── 04-results/
├── 05-cross-review.md
├── 06-stage-gate.md
└── 07-final-output.md
```

The final output can be created only after a stage-gate score of at least 8/10, no zero-scored dimension, and no blocker. The CLI deliberately refuses v0.3 workspaces rather than guessing at a migration.

Common commands:

```powershell
node <installed-skill-path>\scripts\rd.mjs status .
node <installed-skill-path>\scripts\rd.mjs validate .
node <installed-skill-path>\scripts\rd.mjs finalize .
```

## Safety Model

By default the workflow does not authorize paid tools, credentialed private systems, external writes, deployment, publication, messages, purchases, production changes, or secret handling. Evidence is treated as untrusted data and cannot override workflow or user instructions.

Legal, medical, financial, compliance, employment, insurance, credit, security, and safety-critical deliverables require qualified human review before action.

## Validation And Evaluation

Run the local deterministic suite:

```powershell
npm test
npm run validate
npm run benchmark
npm run smoke:hosts
# Optional model-backed activation checks:
npm run smoke:hosts:model
```

Release preparation also uses the official Agent Skills reference validator and GitHub CLI discovery:

```powershell
agentskills validate (Resolve-Path '.\skills\agentic-rd-skill').Path
gh skill publish --dry-run
```

[`evals/manifest.json`](evals/manifest.json) defines repeatable activation, safety, failure, gating, and efficiency scenarios. Metrics are recorded only when the host exposes them. This project does not claim cost, speed, or quality improvements without a measured comparison.

The local benchmark uses a completed standard-profile workspace with four evidence artifacts, four execution artifacts, two result artifacts, and about 126 KiB of artifact data. It measures fresh-process `init`, `status`, and `validate` latency and enforces deliberately broad regression budgets; it is a CLI guardrail, not a claim about model response time or research quality. See [`evals/usability-review.md`](evals/usability-review.md) for the current real-case utility and UX assessment.

## Versioning

Version 1.0 introduces a breaking artifact layout and state contract. It intentionally does not migrate v0.3 runs. Existing v0.3 artifacts should be preserved and completed with the old workflow or restarted in a clean v1 workspace.

## Support And License

MIT licensed. See [LICENSE](LICENSE). If this skill helps your work, support maintenance through [GitHub Sponsors](https://github.com/sponsors/TheStreamCode).
