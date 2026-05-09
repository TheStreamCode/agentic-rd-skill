# How To Use With A Coding Agent

This guide explains how to use Agentic R&D Prompt Library inside a coding-agent environment such as Cursor, Claude Code, OpenCode, Codex CLI, or another file-aware AI coding assistant.

The library is not a standalone application. It is a structured set of prompts, guides, and templates that a coding agent can read and follow while working inside a repository or local folder.

## When To Use This Workflow

Use this workflow when you want an AI agent to produce a structured research, product, business, technical, or problem-solving deliverable from a project brief.

Good use cases include:

- Researching a new SaaS opportunity
- Comparing competitors and market positioning
- Defining an MVP and product strategy
- Producing a technical feasibility report
- Creating a go-to-market plan
- Structuring a complex problem-solving analysis
- Preparing a research plan or literature-driven report

## Step 1: Clone The Repository

```bash
git clone https://github.com/TheStreamCode/agentic-rd-prompt-library.git
cd agentic-rd-prompt-library
```

Open the cloned folder in your coding-agent tool.

## Step 2: Create A Project Brief

Copy the project brief template:

```bash
cp templates/project-brief.md project-brief.md
```

On Windows PowerShell, use:

```powershell
Copy-Item templates/project-brief.md project-brief.md
```

Fill in `project-brief.md` with the subject, goal, desired output, audience, constraints, scope boundaries, success criteria, preferred tone, and human-review requirements.

## Step 3: Give The Coding Agent Its Operating Instruction

Paste this instruction into your coding agent:

```text
Use this repository as your operating guide.

Read project-brief.md first.
Then follow prompts/master-orchestrator.md.
Use the relevant guides in guides/ and templates in templates/.

Create a work/ folder with:
- 01-orchestration-plan.md
- 02-specialist-outputs/
- 03-cross-review-notes.md
- 04-stage-gate-review.md
- 05-final-output.md

Do not write the final output until the Stage Gate Reviewer approves progression.
Keep assumptions, risks, conflicts, and human-review requirements explicit.
```

## Step 4: Let The Agent Create Intermediate Outputs

The agent should not jump directly to the final report.

It should first create:

```text
work/
├── 01-orchestration-plan.md
├── 02-specialist-outputs/
├── 03-cross-review-notes.md
├── 04-stage-gate-review.md
└── 05-final-output.md
```

The `work/` folder is ignored by Git by default because it contains project-specific generated output.

## Step 5: Review The Stage Gate

Before accepting the final output, inspect:

```text
work/04-stage-gate-review.md
```

The stage gate should say `Approved` before the agent writes or finalizes `work/05-final-output.md`.

If the decision is `Needs Revision` or `Blocked`, ask the agent to fix the required issues before continuing.

## Step 6: Validate The Library

Run the validation suite:

```bash
npm test
```

This validates the prompt library structure, documentation links, metadata, and quality checks. It does not validate the factual accuracy of generated project outputs.

## Recommended Agent Behavior

Ask the coding agent to:

- Read files before making assumptions.
- Keep specialist outputs separate.
- Perform cross-review before final synthesis.
- Use the Stage Gate Reviewer as a blocking quality gate.
- Cite sources when making factual claims.
- Label uncertainty clearly.
- Avoid presenting legal, medical, financial, compliance, security, or safety-sensitive outputs as professional advice.

## Example Brief Subject

```text
Research a new SaaS product for AI-powered legal assistants focused on contract review for small and medium-sized businesses in the US and EU.
```

For a complete example, see `examples/legal-ai-saas.md`.

## Common Mistakes

- Asking the agent to write the final report immediately.
- Providing a vague project brief.
- Skipping specialist outputs.
- Skipping cross-review.
- Ignoring the stage-gate decision.
- Treating generated legal, medical, financial, or compliance content as qualified professional advice.

## Minimal One-Prompt Usage

If you want the shortest possible instruction, use this:

```text
Read project-brief.md and use this repository as your operating guide. Follow prompts/master-orchestrator.md, use the guides and templates, create the work/ outputs, run cross-review and stage-gate review, then produce the final output only after approval.
```
