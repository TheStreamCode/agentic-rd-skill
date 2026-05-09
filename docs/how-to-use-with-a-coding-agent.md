# How To Use With A Coding Agent

This guide explains how to use Agentic R&D Prompt Library inside a coding-agent environment such as OpenCode, Claude Code, Cursor, Codex CLI, or another file-aware AI assistant.

The recommended workflow uses one file: `AGENTS.md`. Copy that file into the project where the work should happen, then ask the agent to read it and run the workflow.

You do not need to clone this whole repository into every project. The full repository is useful for development, examples, templates, validation, and documentation. The operational workflow is self-contained in `AGENTS.md`.

## When To Use This Workflow

Use this workflow when you want an AI agent to produce a structured research, product, business, technical, strategy, feasibility, or planning deliverable from a project brief or project idea.

Good use cases include:

- Researching a new SaaS opportunity
- Comparing competitors and market positioning
- Defining an MVP and product strategy
- Producing a technical feasibility report
- Creating a go-to-market plan
- Structuring a complex problem-solving analysis
- Preparing a research plan or literature-driven report

## Step 1: Copy The Operating File

Copy only this file into the target project:

```text
AGENTS.md
```

Place it at the root of the project where the generated `work/` folder should be created.

Do not ask the coding agent to use this whole repository as its working context unless you are improving the prompt library itself.

## Step 2: Provide The Project Brief

Use either option:

- Create `project-brief.md` in the target project.
- Describe the project idea directly in your first message to the agent.

The brief should identify the subject, goal, desired output, audience, constraints, success criteria, and any human-review requirements.

If `project-brief.md` is missing but your first message has enough context, `AGENTS.md` instructs the agent to create the brief and continue automatically.

## Step 3: Start The Workflow

Use this instruction:

```text
Read AGENTS.md and run the workflow for this project.
```

If you are starting from a project idea instead of an existing brief, use:

```text
Read AGENTS.md and run the workflow for this idea: <describe the project idea here>
```

After this first prompt, the agent should continue without asking permission between normal workflow phases.

## Step 4: Let The Agent Produce Intermediate Outputs

The workflow should produce:

```text
work/
├── 01-orchestration-plan.md
├── 02-specialist-outputs/
├── 03-cross-review-notes.md
├── 04-stage-gate-review.md
└── 05-final-output.md
```

The agent must not jump directly to `work/05-final-output.md`, and should not create that file as a placeholder before stage-gate approval.

## Subagent Behavior

`AGENTS.md` is universal and does not require a specific coding-agent product.

If the environment supports real subagents, the agent should delegate each specialist role to a separate subagent.

If the environment does not support real subagents, the agent should simulate subagents by running each specialist role as a separate isolated pass and writing each output to a separate file.

In both cases, the workflow stays the same: specialist analysis first, cross-review second, stage-gate review third, final synthesis only after approval.

## Step 5: Review The Stage Gate

Before accepting the final output, inspect:

```text
work/04-stage-gate-review.md
```

The decision should be `Approved` before `work/05-final-output.md` is written or finalized.

If the decision is `Needs Revision` or `Blocked`, the agent should follow the required fixes in the stage-gate review.

## Minimal One-Prompt Usage

If `AGENTS.md` is already in the target project, use:

```text
Read AGENTS.md and run the workflow. If project-brief.md is missing, create it from this request and continue automatically unless essential context is missing: <project idea>
```

## Common Mistakes

- Cloning or loading the full prompt-library repository into the target project.
- Asking the agent to write the final report immediately.
- Providing a vague project brief with no goal or desired output.
- Skipping specialist outputs.
- Skipping cross-review.
- Ignoring the stage-gate decision.
- Treating generated legal, medical, financial, compliance, security, or safety-sensitive outputs as qualified professional advice.

## For Library Maintainers

The full repository still includes modular files for maintenance and reference:

- `prompts/master-orchestrator.md`
- `prompts/specialist-agent.md`
- `prompts/cross-review-agent.md`
- `prompts/stage-gate-reviewer.md`
- `prompts/final-synthesizer.md`
- `templates/project-brief.md`
- `templates/specialist-output.md`
- `templates/final-output.md`

Run the validation suite with:

```bash
npm test
```

This validates the prompt library structure, documentation links, metadata, and quality checks. It does not validate the factual accuracy of generated project outputs.
