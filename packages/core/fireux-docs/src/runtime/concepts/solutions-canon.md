# Solutions Canon

Authority: Operational
Updated: 2026-05-26
Scope: shared `/solutions` pages, `metaContent.solutions`, and app-local solution overrides.

## Meaning

Solutions are authored SEO and segue pages.

They are not domains, products, stored entities, collection managers, or admin-managed surfaces.

Use solutions when an app needs a public page for a clear job, search intent, or sibling-product bridge without creating a new entity stack.

## Runtime Shape

Apps declare solution cards in app meta:

```ts
metaContent.solutions = [
  {
    slug: 'url-qr-code',
    title: 'URL QR code',
    description: 'Turn a URL into a scannable QR code.',
    icon: 'i-lucide-link',
  },
]
```

Core owns the shared route mechanism:

```txt
/solutions
/solutions/:slug
```

The shared index reads the current app's `metaContent.solutions`.

The shared child route renders a simple boilerplate page for any declared solution slug.

Core also owns `LandingSolutions`. It fetches the current app's solutions and renders the same panels in:

```txt
landing preview mode
/solutions hub mode
```

Do not build a second app-local solutions card system for landing pages.

The shared footer nav item is visible for ecosystem/global apps and standalone apps. Tenant apps do not show Solutions by default.

Apps may add an app-local page at `/solutions/:slug` when that solution needs a real tool, data flow, or richer product bridge. The app-local page overrides the core boilerplate route.

## Rules

- Declare solutions in `metaContent.solutions`.
- Keep solution slugs URL-safe and stable.
- Keep visible copy concise; SEO detail belongs in metadata and page content.
- Do not create `/dashboard/admin/solutions`.
- Do not add featured solution slugs.
- Do not create a `solutions` Firestore collection unless solutions become stored entities.
- Do not treat `/solutions` as a domain index.
- Keep core ignorant of app-specific solution copy; app meta owns the actual solution list.

## Difference From Domains

A domain creates a public collection promise:

```txt
/kitchens
/kitchens/:slug
/dashboard/admin/kitchens
featured_kitchen_slugs
```

A solution creates an authored landing route:

```txt
/solutions/food-menu-qr-code
```

Solutions can link to products, domain pages, resource routes, or sibling apps, but they do not own those systems.
