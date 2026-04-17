# Assets Directory

Authority: Operational
Updated: 2026-04-17
Scope: `packages/*/fireux-*/src/runtime/assets` only.

This page documents FireUX rules for `runtime/assets/`.
It does not explain general Nuxt asset handling.

For Nuxt mechanics, use Nuxt documentation.
This page is only for FireUX placement and override rules.

## FireUX Rule

Use `runtime/assets/` only for build-processed package assets that genuinely belong to delivered runtime behavior.

Typical FireUX use:

- imported package stylesheets
- build-time visual assets used by delivered components or pages
- package-owned assets that should stay inside the runtime delivery layer

Do not use `runtime/assets/` for:

- public brand files that should be directly served
- app-root static files
- general documentation or report files

## FireUX Boundary

The important FireUX boundary is:

- `runtime/assets/` = build-processed package assets
- `runtime/public/` = directly served static files

If a file needs a stable public URL, it usually belongs in `runtime/public/`, not here.

## FireUX Override

FireUX does not add a special second asset architecture on top of Nuxt.

The FireUX override is only this:

- package assets must stay close to the package that delivers the runtime behavior
- public brand and app-facing static files must stay explicit instead of being hidden in build assets

## Short Version

Use `runtime/assets/` for package-owned build assets only.

If the question is about general Nuxt asset behavior, that belongs to Nuxt docs, not here.
