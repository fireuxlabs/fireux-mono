# Components Directory

Authority: Operational
Updated: 2026-04-17
Scope: `packages/*/fireux-*/src/runtime/components` and child directories under `components/*`.

This page documents FireUX rules for `runtime/components/`.
It does not explain general Nuxt component behavior.

For Nuxt mechanics, use Nuxt documentation.
This page is only for FireUX ownership and canon seams.

## FireUX Rule

`runtime/components/` is where FireUX package-owned UI and runtime behavior surfaces live.

The important FireUX rule is not “how components work in Vue.”
It is “which behavior belongs in components, and which does not.”

## FireUX Ownership

In FireUX:

- pages own route delivery
- components own UI behavior and reusable runtime surfaces
- composables own state, reads, writes, and adaptation logic

That means:

- route shells belong in `pages/`
- behavior-heavy UI surfaces belong in `components/`
- fetch and mutation logic should not be invented inside components unless that is the explicit canon

## FireUX Canon Seams

The main repo-wide component seams are:

- `**/Create/System.vue`
- `**/Collection/Manager.vue`
- `**/Cards/*.vue`

Read them like this:

- `Create/System.vue`
  FireUX create behavior surface
- `Collection/Manager.vue`
  FireUX collection browse shell
- `Cards/*`
  FireUX presentational entity surfaces such as `pill`, `cell`, `preview`, and `profile`

## FireUX Override

FireUX adds stronger behavior rules on top of ordinary component placement:

- create ownership may start in pages, but create behavior usually lives in `Create/System.vue`
- collection browse behavior should stay consistent across domains through the collection manager seam
- profile cards should move toward prop-in, render-out rather than local read logic

## What This README Should Answer

Use this branch README when the question is:

- does this behavior belong in a component at all
- which component seam owns this FireUX pattern
- is this component a shell, a manager, or a card surface

If the question is only about Vue component syntax, that belongs to Nuxt or Vue docs instead.

## Short Version

`runtime/components/` is for FireUX-delivered UI surfaces and component-owned behavior.

FireUX care points are ownership and canon seams, not basic Vue mechanics.
