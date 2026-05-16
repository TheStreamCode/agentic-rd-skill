# Agentic R&D Skill

A universal Agent Skill for running file-driven, multi-agent research and development workflows. It turns a project brief into structured specialist analysis, cross-review notes, stage-gate approval, and a final evidence-aware synthesis.

## What This Is

This repository is a self-contained skill package. It is designed for coding agents that support skills, local files, and optional subagents.

The workflow helps an agent produce structured deliverables such as:

- research reports
- product strategy documents
- business analysis
- technical feasibility studies
- market and competitor analysis
- implementation or next-step plans

## Repository Layout

```text
.
├── SKILL.md
├── assets/
│   └── templates/
├── references/
└── scripts/
    ├── init-rd-workflow.mjs
    └── validate-skill.mjs
```

`SKILL.md` is the entrypoint. The references and templates are loaded only when needed.

## Install

Copy this repository folder into the skill directory used by your coding agent, or install it through your agent's supported skill installation mechanism.

For a local smoke test:

```bash
npm test
```

## Use

Ask your coding agent to use the skill for a project brief or planning request:

```text
Use the agentic-rd-skill skill to produce a technical feasibility study for this project idea...
```

The skill creates this workspace structure:

```text
work/
├── 01-orchestration-plan.md
├── 02-specialist-outputs/
├── 03-cross-review-notes.md
├── 04-stage-gate-review.md
└── 05-final-output.md
```

`work/05-final-output.md` is created only after the stage gate is approved.

## Scaffold Script

You can pre-create the required workflow files:

```bash
node scripts/init-rd-workflow.mjs .
```

The script does not overwrite existing files unless `--force` is passed, and it never creates `work/05-final-output.md`.

## Safety

This skill structures AI-assisted research and planning. It does not replace qualified human review. Legal, medical, financial, compliance, security, employment, credit, insurance, and safety-critical outputs require appropriate human review before use.

## License

MIT. See [LICENSE](LICENSE).
