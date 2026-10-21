## Summary

<!-- What problem does this change solve? -->

## Change

<!-- What did you change, and why this approach? -->

## Verification

<!-- Commands run and their results. -->

- [ ] `npm run check` passes
- [ ] `agentskills validate <absolute-skill-path>` when the installable package changed
- [ ] `gh skill publish --dry-run` when package or release metadata changed
- [ ] Host smoke result recorded as passed, failed, inconclusive, or not run; zero executed checks are not called a pass
- [ ] Documentation, changelog, and evaluation cases are updated when public behavior changes

## Checklist

- [ ] Focused change, one problem per pull request
- [ ] Compatibility, safety, and workflow-version impact described
- [ ] Dated evidence or migration requirement recorded when behavior changed
- [ ] The change follows `AGENTS.md`, including its documentation synchronization and release boundaries
- [ ] Required CI checks pass
