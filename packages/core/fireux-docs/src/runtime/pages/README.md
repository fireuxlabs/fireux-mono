# Pages Directory

Authority: Operational
Updated: 2026-04-17
Scope: `packages/*/fireux-*/src/runtime/pages` and child directories under `pages/*`.

This page documents FireUX rules for `runtime/pages/`.
It does not explain general Nuxt routing behavior.

For Nuxt mechanics, use Nuxt documentation.
This page is only for FireUX route ownership and runtime surface rules.

## FireUX Rule

`runtime/pages/` is the FireUX route delivery layer.

Pages are shells, entry points, and ownership surfaces.
They are not a second place to hide all runtime behavior.

## FireUX Ownership

In FireUX:

- pages own route delivery
- components own behavior-rich UI surfaces
- composables own reads, writes, state, and adapters

That means a page should usually answer:

- who owns this route
- who is the audience
- is this public, console, dashboard, admin, docs, or dev
- which lower seam does this page hand off to

## FireUX Route Families

Important FireUX route families include:

- public entity routes
- `/console/**`
- `/dashboard/**`
- `/admin/**`
- `/docs/**`
- dev-only routes

Important FireUX rule:

- route visibility and ownership matter more than visual similarity

For dashboard profile-extension canon, see `runtime/concepts/dashboard-canon.md`.

## FireUX Admin Surfaces

Admin index pages that should appear in `/dashboard/admin` declare `adminSurface` route meta.

That keeps the dashboard scalable:

- Products declares the Products admin surface.
- Blogs declares the Blog posts admin surface.
- App-local pages can declare app-specific surfaces such as Apps or Ecosystems without a domain opt-in.
- `/dashboard/admin` discovers registered admin surfaces instead of hard-coding every entity.
- Provider-packaged domain admin surfaces set `adminSurface.domain` and are shown
  only when the app opts into that domain with `domains: ['kitchens']`.
- Domain admin surfaces are curation-only for now: one featured/pinned slug field
  stored on `apps/{appId}/settings/public`.

Public index display choices belong to app-local public settings, not the
entities being displayed. For example, featured Apps and Ecosystems are stored
on `apps/{appId}/settings/public` as slug arrays, while the App and Ecosystem
records remain canonical identity records.

## FireUX Console Override

FireUX adds a stronger console-entry canon than plain Nuxt gives us.

Read console-backed families like this:

- `/console`
  family chooser
- `/console/X`
  family entry and target selection
- `/console/X/overview`
  selected-target workspace

Mode such as `live`, `demo`, and `test` is a FireUX runtime concern, not a reason to invent a second page architecture.

## FireUX Docs Override

Docs routes may be friendly aliases such as `/docs/project`, but the source documentation still has to live in the correct spine branch.

That means:

- route friendliness is allowed
- source placement drift is not

## What This README Should Answer

Use this branch README when the question is:

- should this be a page at all
- who owns this route
- is this route a public surface, a console surface, or an admin surface
- should this page be a thin shell over a lower seam

If the question is only about normal Nuxt file routing, that belongs to Nuxt docs instead.

## Short Version

`runtime/pages/` is the FireUX route delivery layer.

The FireUX concern here is surface ownership and entry canon, not basic Nuxt routing.
