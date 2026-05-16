# Agentic R&D Skill

A universal Agent Skill for running Agent Laboratory style workflows across research, product, business, technical, strategy, feasibility, investigation, and planning use cases. It turns a project brief into evidence review, plan formulation, execution or investigation, results analysis, cross-review, stage-gate approval, and final synthesis.

## What This Is

This repository is a self-contained skill package. It is designed for coding agents that support skills, local files, and parallel subagents.

The workflow generalizes the [Agent Laboratory](https://agentlaboratory.github.io/) pattern beyond scientific research: literature review becomes evidence/context review, experimentation becomes execution or investigation, and report writing becomes final synthesis. The user remains the pilot; the skill provides structured autonomous assistance.

Unlike the original Agent Laboratory era, this skill assumes modern coding agents may have native subagents. When available, the orchestrator should spawn independent specialists in parallel waves and only wait at dependency gates.

The subagents are intended to act as a collaborating team. They produce independent specialist outputs, exchange questions and handoffs, reconcile shared assumptions in a team collaboration file, and then pass the package through cross-review and stage-gate approval.

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
├── 00-lab-notes.md
├── 01-orchestration-plan.md
├── 02-specialist-outputs/
├── 03-team-collaboration.md
├── 04-cross-review-notes.md
├── 05-stage-gate-review.md
└── 06-final-output.md
```

`work/06-final-output.md` is created only after the stage gate is approved.

## Scaffold Script

You can pre-create the required workflow files:

```bash
node scripts/init-rd-workflow.mjs .
```

The script does not overwrite existing files unless `--force` is passed, and it never creates `work/06-final-output.md`.

## Safety

This skill structures AI-assisted research and planning. It does not replace qualified human review. Legal, medical, financial, compliance, security, employment, credit, insurance, and safety-critical outputs require appropriate human review before use.

## Inspiration

This skill is inspired by Agent Laboratory by Samuel Schmidgall and collaborators, especially its phased workflow for literature review, experimentation, and report writing. This repository is not a fork of Agent Laboratory and does not reproduce its Python implementation; it adapts the workflow pattern into a portable skill for broader coding-agent use cases.

## License

MIT. See [LICENSE](LICENSE).
