# Release runbook

This repository publishes `nordic-payment-references` to npm from GitHub Actions by using npm Trusted Publishing. No npm token is stored in GitHub.

## One-time configuration

The npm package's trusted publisher must have these values:

- Provider: GitHub Actions
- Organization or user: `abaidurrehman`
- Repository: `nordic-payment-references`
- Workflow filename: `publish.yml`
- Environment: leave blank
- Permission: allow `npm publish`

The package should also grant the npm team `invoicecraftly:developers` read-write access.

The publishing contract lives in [`.github/workflows/publish.yml`](.github/workflows/publish.yml). It requires a Git tag named `v<package version>`, runs the tests and package dry run, and then publishes through OpenID Connect (OIDC).

## Publish a release

Start from a clean, current `main` branch:

```powershell
git switch main
git pull --ff-only origin main
git status --short
npm test
npm run pack:check
```

Make and commit the intended source, test, README, and changelog changes before preparing the version. Then choose exactly one semantic-version increment:

```powershell
npm version patch --no-git-tag-version
# Or: npm version minor --no-git-tag-version
# Or: npm version major --no-git-tag-version
```

Update `CHANGELOG.md` for the new version, then validate and create the release commit and annotated tag:

```powershell
npm test
npm run pack:check
$releaseVersion = node -p "require('./package.json').version"
git add package.json CHANGELOG.md
git diff --cached --check
git commit -m "chore: release v$releaseVersion"
git tag -a "v$releaseVersion" -m "v$releaseVersion"
git push origin main
git push origin "v$releaseVersion"
```

Pushing the tag starts the `Publish package` workflow. Do not run `npm publish` locally for a normal release.

## Verify the release

Wait for the tag workflow to finish successfully:

```powershell
$releaseVersion = node -p "require('./package.json').version"
gh run list --repo abaidurrehman/nordic-payment-references --workflow publish.yml --limit 5
$runId = gh run list --repo abaidurrehman/nordic-payment-references --workflow publish.yml --limit 1 --json databaseId --jq '.[0].databaseId'
gh run watch $runId --repo abaidurrehman/nordic-payment-references --exit-status
npm view nordic-payment-references version
npm view "nordic-payment-references@$releaseVersion" dist --json
```

Confirm that npm reports `$releaseVersion`. Then create the GitHub Release:

```powershell
gh release create "v$releaseVersion" --repo abaidurrehman/nordic-payment-references --verify-tag --generate-notes --title "v$releaseVersion"
```

Finally, install the package in a temporary consumer project and import one exported function when the release contains runtime or packaging changes.

## If publishing fails

1. Open the failed GitHub Actions run and identify whether it failed before or during `npm publish`.
2. Check npm before retrying: `npm view nordic-payment-references versions --json`.
3. If the version exists on npm, it is immutable. Fix the problem and publish a new patch version; never move or reuse the published tag.
4. If Trusted Publishing rejects the request, confirm the npm publisher values exactly match the repository and `publish.yml`, and confirm the workflow still has `id-token: write`.
5. If the tag/version guard fails, create a new version whose `package.json` version exactly matches its `v<version>` tag.

Do not add an `NPM_TOKEN` unless the project intentionally abandons Trusted Publishing.

## Current baseline

- First npm version: `0.1.0`
- First release tag: `v0.1.0`
- Automated trusted publishing added after `v0.1.0`; the first end-to-end OIDC proof will be the next versioned release.
