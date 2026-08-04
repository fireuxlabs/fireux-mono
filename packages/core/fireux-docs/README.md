# FireUX Docs

Updated: 2026-08-04
Role: repository documentation viewer, not architecture authority

`fireux-docs` installs the Nuxt Content viewer used by `fireux-app`. It renders
the current repository entrypoints and concept maps at `/docs`; it does not own
or duplicate their content.

Authority remains, in order:

1. current source and executable guards;
2. `AGENTS.md` and `docs/ai/*-context.md`;
3. `docs/concepts/*.md`.

The host App owns `content.config.ts` because Nuxt Content resolves source
collections at the application boundary. This package owns the reusable routes
and viewer layout integration.
