# FireUX Docs

Updated: 2026-11-03
Role: repository documentation viewer, not architecture authority

`fireux-docs` installs the Nuxt Content viewer used by `fireux-app`. It renders
the current repository entrypoints and concept maps at `/docs`, and provides
focused FireUX API references alongside them. API reference pages explain
current package behavior; the owning package source remains authoritative.
The first reference documents Core's App composables in
[`App`](src/runtime/pages/docs/composables/useApp.vue) and its
[source](../fireux-core/src/runtime/app/composables/useAppRead.ts).

Authority remains, in order:

1. current source and executable guards;
2. `AGENTS.md` and `docs/ai/*-context.md`;
3. `docs/concepts/*.md`.

The host App owns `content.config.ts` because Nuxt Content resolves source
collections at the application boundary. This package owns the reusable routes,
viewer layout, and its focused API reference pages.
