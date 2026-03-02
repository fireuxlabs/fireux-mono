---
title: SEO + Indexing Playbook
status: draft
updated: 2026-03-02
owner: FireUX Core---

# FireUX Mono SEO + Indexing Playbook
Authority: Tier2 (Operational)

This is the mono-repo SEO baseline for all FireUX apps (`fireux.app`, `misebox.app`, and future ecosystems).

## Core Standard

All SEO/indexing defaults must be configured in `fireux-core` via `defineFireuxConfig`, not copied per app.

Baseline provided by core:

- `/robots.txt` generated from shared runtime config.
- `/sitemap.xml` generated from shared runtime config.
- Private surfaces (`/console/**`, `/admin/**`) receive `X-Robots-Tag: noindex, nofollow`.
- Core stays route-agnostic; extensions/apps contribute hubs and sitemap paths.

## App API (Nuxt Config)

Use `seo` in `defineFireuxConfig` only when app-level overrides are needed:

```ts
defineFireuxConfig({
  ecosystem: 'misebox',
  id: 'misebox-app',
  name: 'Misebox',
  shortName: 'Misebox',
  role: 'global',
  modules: ['fireux-jobs', 'fireux-kitchens', 'fireux-blogs'],
  seo: {
    siteUrl: 'https://misebox.app',
    hubs: ['/jobs', '/kitchens', '/blog'],
    staticPaths: ['/about', '/get-started'],
    disallowPaths: ['/console', '/admin'],
    noindexPaths: ['/console/**', '/admin/**'],
  },
})
```

`seo` fields:

- `enabled`: set `false` to block crawling (`Disallow: /`).
- `siteUrl`: canonical origin for sitemap/canonical links.
- `defaultDescription`: fallback page description.
- `hubs`: public collection routes to prioritize for discovery.
- `staticPaths`: additional public URLs for sitemap.
- `disallowPaths`: robots disallow list.
- `noindexPaths`: route patterns for `X-Robots-Tag`.

## Extension API (Hook)

Extensions register public surfaces via `fireux:seo:extend`:

```ts
nuxt.hook('fireux:seo:extend', (ctx) => {
  ctx.addHub('/jobs')
  ctx.addStaticPath('/jobs/learn-more')
})
```

## 60-Second Triage

1. `site:<domain>` in Google (index footprint).
2. `view-source:https://<domain>/` and confirm meaningful SSR HTML.
3. Open `https://<domain>/robots.txt`.
4. Open `https://<domain>/sitemap.xml`.
5. Confirm homepage links to hub routes.

## Common Failure Modes

1. SPA shell pages (`onMounted`-only content, empty SSR HTML).
2. Auth redirects on public routes.
3. No internal linking to public detail routes.
4. `noindex`/canonical mistakes.
5. 500/403 responses to bots.

## FireUX Public SEO Rules

- Public discovery pages must render meaningful SSR HTML.
- Public pages must not block on Firebase auth state.
- Public hubs must contain crawlable links to deeper routes.
- Private app surfaces can be noindex and/or disallowed.

## Done Definition (MVP)

- `site:<domain>` shows multiple pages.
- `/robots.txt` exists and includes sitemap.
- `/sitemap.xml` exists and includes public hubs.
- `view-source` for homepage/hubs includes copy and links.
- Public routes do not redirect to auth.
