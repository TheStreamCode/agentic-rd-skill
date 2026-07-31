# Release Checklist

Use this checklist for every stable release. A passing local suite does not authorize publication; the maintainer must explicitly approve the tag and release.

## Prepare

1. Start from a clean `main` checkout synchronized with `origin/main`.
2. Align the intended version in `package.json`, `CITATION.cff`, `skills/agentic-rd-skill/SKILL.md`, README badge, and `CHANGELOG.md`.
3. Review public host/version evidence separately from deterministic CLI evidence. Date every activation snapshot and keep untested hosts labeled as documentation-only.
4. Run:

   ```powershell
   npm run check
   npm run smoke:hosts
   gh skill publish --dry-run
   ```

   `smoke:hosts` must execute at least one eligible host check. With zero checks, the underlying runner exits 3 and reports `inconclusive`; npm may expose that child exit as a generic non-zero status. This is not a pass. Run model-backed smokes only with explicit budget and credential authorization.

5. Validate the installable package with the hash-pinned official reference validator from `requirements-validation.txt`.
6. Install the intended tag into a disposable directory, run the installed `rd.mjs --help`, initialize a disposable workflow, compare the payload, and remove only the verified temporary root.

## Publish

1. Confirm the repository's GitHub immutable-releases setting is enabled before creating the release. Tag-protection rules and immutable releases are complementary controls.
2. Create the signed or annotated version tag from the reviewed commit and publish the release without mutable generated assets unless they are reproducible and attested.
3. Verify the live tag, release, CI, and CodeQL all resolve to the reviewed commit.
4. Verify GitHub reports the release as immutable:

   ```powershell
   gh api "repos/TheStreamCode/agentic-rd-skill/releases/tags/vX.Y.Z" --jq .immutable
   ```

   Do not call the release immutable unless this returns `true`.

## Post-Release

1. Repeat pinned and unpinned `gh skill install` smokes and record the resolved tag/commit.
2. Confirm direct repository installation even if catalog search indexing is delayed.
3. Update dated evaluation evidence only from checks actually rerun; never copy prior benchmark or host results forward as current.
