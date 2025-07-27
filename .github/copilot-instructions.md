# Copilot Instructions for npm-package-arg

## Project Overview
- **Purpose:** Parses npm package specifiers (e.g., for `npm install`) into structured objects, supporting registry, git, file, directory, alias, and remote types.
- **Entry Point:** `lib/npa.js` exports the main API: `npa(arg, [where])`, `npa.resolve(name, spec, [where])`, and `npa.toPurl(arg, [reg])`.
- **Key Consumers:** Used by npm CLI and related tooling to interpret dependency specifiers.

## Architecture & Patterns
- **Single-module design:** All parsing logic is in `lib/npa.js`. No submodules.
- **Result Object:** Returned by all main APIs, with fields like `type`, `name`, `rawSpec`, `fetchSpec`, `saveSpec`, `hosted`, etc. See README for full schema.
- **Type Detection:** Uses regex and helper functions to distinguish between registry, git, file, directory, alias, and remote specifiers.
- **Platform Awareness:** Handles Windows/Posix path differences explicitly (see `isWindows`, path handling in `npa.js`).
- **External Dependencies:**
  - `hosted-git-info` for git URLs
  - `semver` for version/range parsing
  - `validate-npm-package-name` for npm name validation
  - `proc-log` for logging

## Developer Workflows
- **Testing:**
  - Run all tests: `npm test` (uses `tap`)
  - Tests are in `test/` and cover all specifier types and edge cases.
  - Windows/Posix path normalization is tested via mocks.
- **Linting:**
  - Run: `npm run lint` (uses `eslint` via npmcli config)
  - Auto-fix: `npm run lintfix`
- **Template Management:**
  - Some files are managed by `@npmcli/template-oss`. See `package.json` for details.

## Project Conventions
- **No TypeScript or transpilation.** Pure Node.js, targeting Node 18+.
- **No subdirectories in `lib/`**—all logic is in `npa.js`.
- **Tests use `tap` and may mock Node core modules for platform simulation.**
- **File specifiers are NOT URI-encoded for saveSpec.** See README for rationale.
- **All public API changes must be reflected in the README.**

## Examples
- See `README.md` for usage and expected result object structure.
- See `test/basic.js` for canonical test cases and expected outputs.

## When in Doubt
- Reference the README and `lib/npa.js` for source of truth on parsing logic and result object fields.
- Ask for review if changing result object structure or specifier parsing logic.
