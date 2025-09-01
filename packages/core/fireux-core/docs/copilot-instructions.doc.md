# Copilot Instructions — fireux-core Docs

- Keep API tables in docs/api.md in sync with src/runtime/ exports
- When models move, update imports and docs/examples
- Validate with `pnpm -w --filter ./packages/core/fireux-core exec tsc --noEmit`
