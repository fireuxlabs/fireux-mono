# FireUX App

This is the main FireUX app. It imports core and extension packages from `/packages`.

## Key Points

- Uses `fireux-core`, `fireux-jobs`, `fireux-places`, etc. from `/packages`.
- All dependencies on local packages should use `workspace:*`.
- TypeScript paths in `tsconfig.json` should point to `../../packages/core/fireux-core/src/*` for `@fireux-core/*`.

See `/packages/README.md` for package structure and rules.
