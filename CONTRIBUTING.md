# Contributing

Contributions should keep this repository focused on the skill package.

## Guidelines

- Keep `SKILL.md` concise and action-oriented.
- Put detailed workflow guidance in `references/`.
- Put reusable Markdown formats in `assets/templates/`.
- Put deterministic helper logic in `scripts/`.
- Do not reintroduce the old standalone prompt-library directories.
- Run validation before opening a pull request:

```bash
npm test
```

## Pull Requests

Pull requests should explain:

- what workflow behavior changed
- which files were updated
- how the change was validated
- whether any safety or human-review guidance changed
