# Safety And Limitations

This library structures AI-assisted research and planning. It does not guarantee correctness, completeness, legality, safety, or business success.

## Known Limitations

- AI agents may hallucinate sources or facts.
- Agents may overstate confidence.
- Cross-review can reduce errors but cannot eliminate them.
- Stage-gate review is a quality-control prompt, not a formal audit.
- Outputs may be outdated if the agent does not use current sources.

## Regulated And Sensitive Domains

Use qualified human review for:

- Legal matters
- Medical or health-related topics
- Financial advice or investment decisions
- Cybersecurity and safety-critical systems
- Regulatory compliance
- Employment, insurance, credit, or other high-impact decisions

## Recommended Safety Practices

- Require citations for factual claims.
- Require assumptions to be explicit.
- Require confidence levels for uncertain claims.
- Ask the agent to identify what it could not verify.
- Keep final recommendations separate from evidence.
- Do not use generated outputs as professional advice without review.
