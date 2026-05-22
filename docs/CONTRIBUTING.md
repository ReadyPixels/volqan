# Contributing to Volqan

Thanks for contributing to Volqan. This guide explains how to get set up, how to propose changes, and how to contribute code, docs, extensions, and themes in a way that is easy to review and maintain.

## Code of conduct

All contributors are expected to follow the rules in [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md). By participating in this project, you agree to uphold a respectful, inclusive, and professional community standard.

## Contributor License Agreement

All material contributions require acceptance of the Volqan Contributor License Agreement before a pull request can be merged. If maintainers ask for CLA confirmation, complete it before requesting final review.

## Development environment

### Required tools

- **Node.js:** 22 or newer
- **pnpm:** 9 or newer
- **PostgreSQL:** 16+ recommended for local development
- **Docker:** optional, but recommended for parity with self-hosted setups

### Initial setup

```bash
git clone https://github.com/ReadyPixels/volqan.git
cd volqan
pnpm install
cp .env.example .env.local
pnpm dev
```

### Database setup

If you are using PostgreSQL locally, create a database and configure your environment variables before running migrations.

Example connection string:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/volqan
```

If a package includes Prisma or seed tasks, run the package-specific setup documented in that package directory.

## Workspace commands

From the repository root:

```bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm clean
```

## Branch naming conventions

Use short, descriptive branch names with one of these prefixes:

- `feat/` — new features
- `fix/` — bug fixes
- `docs/` — documentation updates
- `refactor/` — internal refactors without behavior changes
- `chore/` — tooling, automation, maintenance
- `test/` — test additions or updates
- `ext/` — extension-related work
- `theme/` — theme-related work

Examples:

- `feat/visual-schema-builder`
- `fix/license-cache-timeout`
- `docs/readme-roadmap-refresh`

## How to contribute

### Reporting bugs

Before opening a bug report:

1. Search existing issues and discussions.
2. Reproduce the issue on the latest branch or release candidate.
3. Include clear steps, expected behavior, actual behavior, environment details, and screenshots when relevant.

### Suggesting features

Feature requests should explain:

- the problem being solved
- the users affected
- the expected workflow
- why the change belongs in core rather than an extension

### Submitting pull requests

1. Fork the repository and create a feature branch.
2. Keep each pull request focused on a single concern.
3. Add tests or update existing tests where behavior changes.
4. Update docs when APIs, workflows, or developer expectations change.
5. Run linting, formatting, type checks, and tests locally.
6. Open a pull request using a clear title and summary.

## Pull request process

Every pull request should include:

- a concise summary of the change
- screenshots or recordings for UI changes
- notes on migrations, breaking changes, or config changes
- linked issues or discussions when applicable
- confirmation that local checks passed

### Review expectations

Maintainers may request changes for:

- architecture consistency
- accessibility or UX quality
- test coverage gaps
- API stability concerns
- documentation completeness

Pull requests are typically merged using squash commits unless maintainers request otherwise.

## Coding standards

### TypeScript

- Use strict TypeScript patterns.
- Prefer explicit public interfaces for reusable contracts.
- Avoid `any` unless there is a documented, temporary reason.
- Model extension and theme contracts with stable exported types.

### ESLint and Prettier

- ESLint is used for correctness and consistency.
- Prettier is used for formatting.
- Do not manually format code in ways that fight project tooling.
- Run `pnpm lint` and `pnpm format` before requesting review if format scripts are available in your package.

### General standards

- Keep functions focused and composable.
- Prefer clear naming over clever abstractions.
- Maintain backward compatibility where reasonable.
- Document non-obvious decisions in code comments or PR notes.
- Preserve accessibility in admin UI changes.

## Testing expectations

When changing runtime behavior, add or update tests in the relevant package. At minimum, verify:

- schema and API behavior
- extension lifecycle behavior
- theme token application behavior
- licensing and attribution flows when touched

## Extension development guide

Volqan extensions should behave like well-contained products, not hacks around the core.

### Extension package expectations

Each extension should:

- expose a stable manifest and TypeScript entrypoint
- declare a unique ID in the form `vendor/extension-name`
- use semantic versioning
- document install, configuration, and compatibility details
- avoid undocumented network calls or destructive side effects

### Recommended structure

```text
extensions/my-extension/
├── src/
├── package.json
├── README.md
├── screenshots/
└── tsconfig.json
```

### Extension quality checklist

Before submitting an extension-related contribution:

- validate manifest shape and lifecycle hooks
- keep admin UI accessible and consistent with Volqan design tokens
- include setup instructions and screenshots in the README
- explain database migrations and rollback behavior
- declare compatibility with the current Volqan version range

## Theme development guide

Themes should use design tokens and component overrides rather than brittle DOM-specific styling whenever possible.

Theme contributions should:

- define a clear token strategy
- preserve contrast and readability
- support dark and light behavior where relevant
- avoid breaking layout assumptions in core admin surfaces

## Documentation contributions

Documentation PRs are welcome for:

- onboarding improvements
- missing examples
- ecosystem tutorials
- API clarifications
- typo and grammar fixes

If your change affects setup, commands, package names, licenses, or roadmap messaging, update the root README and relevant docs together.

## Commit guidance

Conventional Commits are encouraged:

- `feat:`
- `fix:`
- `docs:`
- `refactor:`
- `test:`
- `chore:`

Example:

```text
feat(core): add extension lifecycle registry
```

## Security-related contributions

Do not open public issues for sensitive vulnerabilities. Follow the reporting process in [SECURITY.md](./SECURITY.md).

## Questions and discussions

Use GitHub Discussions for questions, proposals, and ecosystem ideas:

- General
- Q&A
- Show and Tell
- Extension Ideas
- Announcements

Thank you for helping build Volqan.
