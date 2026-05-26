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
    status: 'live',
    steps: [
      'Enter the URL.',
      'Generate a QR code.',
      'Download or share the QR code.',
    ],
  },
]
```

Apps may back solution route content with a single markdown file:

```txt
app/solutions.md
```

Use one `## solution-slug` heading per route. Body copy under the heading becomes the route body. A `### How this comes to life` list becomes the route steps.

Apps may also include admin-only planning sections:

```md
### Business case

Internal planning prose for why the solution matters.

### Provisioning

- Records, routes, consoles, bridges, and seed data required to fulfill it.

### Checklist

- [x] Admin-only fulfillment tasks that are already complete.
- [ ] Admin-only fulfillment tasks that still need work.
```

These sections are passed through runtime meta but should only render for app admins.

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

Core owns the shared visual rhythm for solution hubs, cards, and boilerplate detail pages in:

```txt
packages/core/fireux-core/src/runtime/assets/styles/scss/organisms/solutions.scss
```

Apps may change solution data and app branding tokens. They should not restyle the shared solutions hub locally.

The shared footer nav item is visible for ecosystem/global apps and standalone apps. Tenant apps do not show Solutions by default.

Apps may add an app-local page at `/solutions/:slug` when that solution needs a real tool, data flow, or richer product bridge. The app-local page overrides the core boilerplate route.

## Rules

- Declare solutions in `metaContent.solutions`.
- Keep solution slugs URL-safe and stable.
- Use `status` and `relatedApp` in meta to keep solution cards honest while the feature is still coming alive.
- Use `app/solutions.md` for authored route body copy and "How this comes to life" steps when a solution page needs more than a card description.
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
