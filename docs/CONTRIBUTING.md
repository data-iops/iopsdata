# Contributing to iOpsData

Thank you for your interest in contributing! We welcome issues, feature requests, and pull requests from the community.

## Code of Conduct

Please read and follow our [Code of Conduct](./CODE_OF_CONDUCT.md).

## How to Report Bugs

1. Search existing issues to avoid duplicates.
2. Use the **Bug report** issue template.
3. Include environment details and logs.

## How to Suggest Features

1. Use the **Feature request** template.
2. Explain the problem and desired outcome.
3. Include examples, mockups, or user stories.

## Development Setup

Follow the [Installation Guide](./INSTALLATION.md) to set up locally.

## Code Style

- **Python:** `ruff` for linting, `pytest` for tests.
- **TypeScript:** `eslint` for linting.
- Use type hints and clear naming.

## Commit Message Format

We use **Conventional Commits**:

```
feat: add lineage endpoint
fix: handle missing FERNET_KEY
docs: update deployment guide
```

## Pull Request Process

1. Fork the repo and create a feature branch.
2. Ensure tests and linting pass:

```bash
./scripts/test.sh
```

3. Open a PR using the template.
4. Describe the change clearly and link related issues.

## Review Process

- Maintainers will review within a few days.
- Changes may require updates or additional tests.

## Release Process

- Releases are tagged using semantic versioning.
- Changelogs are updated under `/docs/CHANGELOG.md`.

Thanks for helping us build the Cursor for Data Professionals!
