# fireux-core

Core runtime and primitives for FireUX.

This package is the reference implementation for FireUX conventions:
- opinionated repository and app structure
- shared runtime composables and models
- shared utilities used by ecosystems, extensions, and apps

## Structure Authority

Package-root and `src/` structure for FireUX modules are defined centrally in:
- `packages/core/fireux-docs/README.md`
- `packages/core/fireux-docs/src/README.md`

## Notes
- Do not commit build output
- FireUX is a listings and matching platform, not the legal employer

## SEO baseline
- Monorepo SEO defaults are centralized here through `defineFireuxConfig({ seo })`.
- `fireux-core` provides shared `/robots.txt` and `/sitemap.xml` runtime endpoints.
- Private app surfaces are tagged with `X-Robots-Tag: noindex, nofollow` by default.
- SEO route discovery is extension-driven via `nuxt.hook('fireux:seo:extend', ...)`.
