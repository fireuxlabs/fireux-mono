## Scope & links

Core foundation: auth, Firestore helpers, UI primitives, layout tokens.

- See repo root CONTEXT.md for principles.
- See docs/STRUCTURE_GUIDE.md for workspace conventions.

Last updated: 2025-08-10

# Core Packages

This folder contains core, framework-level packages for FireUX. No domain-specific code should be placed here.

## Packages

- `fireux-core/`: The main FireUX core framework (Firebase, auth, base components, utilities).

## Rules

- Only shared, generic code.
- No business/domain logic.
- Use `workspace:*` for all local dependencies.
