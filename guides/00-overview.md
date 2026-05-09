# Overview

This library defines a Markdown-first workflow for AI-assisted research and development.

The user provides a project brief. The Master Orchestrator selects specialist agents. Specialists work in parallel, review each other's outputs, and revise their work. A Stage Gate Reviewer blocks or approves progression. A Final Synthesizer then produces the final deliverable.

## Why This Workflow Exists

Single-agent outputs often fail because they compress research, analysis, review, and synthesis into one pass. This library separates those responsibilities.

The goal is not to make AI infallible. The goal is to make AI-assisted work more structured, auditable, and useful.

## Core Pattern

```text
Brief -> Orchestration -> Specialist Analysis -> Cross-Review -> Gate Review -> Final Synthesis
```

## Best Practices

- Start with a specific project brief.
- Keep each agent's scope narrow.
- Require intermediate files.
- Review before synthesis.
- Make uncertainty visible.
- Use human review for sensitive domains.
