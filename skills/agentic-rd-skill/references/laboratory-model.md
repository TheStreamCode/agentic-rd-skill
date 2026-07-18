# Generalized Laboratory Model

Agent Laboratory's scientific phases map to a domain-neutral workflow:

| Original function | Agentic R&D function |
| --- | --- |
| Literature review | Evidence and context review |
| Plan formulation | Evidence-dependent plan |
| Data preparation | Resource preparation inside the plan/execution boundary |
| Experiments | Bounded execution or investigation |
| Results interpretation | Results analysis |
| Report writing | Reviewed final synthesis |

Preserve the original pattern's useful properties: the human remains the pilot, specialists own narrow work, phases have checkpoints, failures remain visible, and results are reviewed before synthesis.

Modernize the mechanism rather than copying the original runtime: use the coding agent's native tools and subagents, portable Markdown artifacts, provider-neutral instructions, explicit authorization boundaries, and a small deterministic state validator instead of hardcoded model backends or serialized Python agent objects.
