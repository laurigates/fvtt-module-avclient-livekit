# GitHub Actions Workflows

## Active Workflows

### `ci.yml` - Continuous Integration
- Runs on push/PR to main and develop branches
- Linting, building, security audits, and package integrity checks
- Multi-node version testing (16, 18, 20)

### `release-please.yml` - Automated Releases
- Runs on push to main branch
- Uses release-please for semantic versioning and changelog generation
- Automatically creates releases based on conventional commits
- Builds and uploads FoundryVTT module packages

## Disabled Workflows

### `release-fvtt-module.yml.disabled` - Legacy Manual Release
- Previous manual release workflow based on module.json version changes
- Disabled in favor of release-please automation
- Kept for reference and potential rollback

## Release Process

1. **Development**: Work on feature branches, create PRs to main
2. **Conventional Commits**: Use conventional commit format (feat:, fix:, etc.)
3. **Merge to Main**: When PR is merged, release-please analyzes commits
4. **Release PR**: Release-please creates a PR with version bump and changelog
5. **Auto Release**: When release PR is merged, GitHub release is created automatically
6. **Module Package**: ZIP package is built and attached to the release