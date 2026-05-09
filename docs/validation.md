# Validation

This repository includes a lightweight validation script for the prompt library.

## Command

```bash
npm test
```

## What It Checks

- Required repository files and directories exist.
- Markdown files start with a level-1 heading.
- Relative Markdown links resolve to existing files.
- Critical prompts and templates are referenced.
- Author, license, citation, and package metadata are consistent.
- Common unresolved placeholders and secret-like strings are absent.
- GitHub Actions validation is configured.

## Continuous Integration

The `Validate` GitHub Actions workflow runs `npm test` on pushes to `main` and on pull requests.
