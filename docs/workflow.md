# Workflow

The workflow is designed for file-driven agent work.

## Phase 1: Brief Intake

The user provides `project-brief.md`. The Master Orchestrator reads it and identifies the project type, constraints, desired output, and required specialist perspectives.

## Phase 2: Orchestration

The Master Orchestrator writes an orchestration plan. This plan defines the selected agents, their scopes, expected outputs, stop conditions, and final deliverable requirements.

## Phase 3: Parallel Specialist Analysis

Specialist agents work independently and produce structured outputs.

## Phase 4: Cross-Review

Specialists review each other's work. The Cross-Review Agent identifies agreements, conflicts, missing information, and required revisions.

## Phase 5: Stage Gate Review

The Stage Gate Reviewer evaluates whether the package is strong enough to proceed. If not, the workflow returns to specialist revision.

## Phase 6: Final Synthesis

The Final Synthesizer writes the final deliverable from approved inputs only.
