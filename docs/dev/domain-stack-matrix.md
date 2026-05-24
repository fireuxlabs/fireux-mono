# Domain Stack Matrix
Status: WIP inspection matrix
Authority: Tier2 (Operational draft, not canon)
Updated: 2026-05-25

## Purpose

This document tracks FireUX opt-in domain surfaces while the domain stack is being
aligned.

It is not canon yet. Use it as a working checklist when deciding which app
consumes which provider domain, and update it as each route stack is verified.

## Working Rule

Installed packages provide capabilities.

Apps consume domains explicitly.

If an app consumes a domain, the provider should make the domain's public and
admin curation surfaces available to that app.

The current config key for this is:

```ts
domains: ['kitchens', 'suppliers']
```

Products and Blog posts are excluded from this matrix because they are baseline
FireUX app tools, not opt-in domain surfaces:

- Products help each app sell.
- Blog posts help each app publish and build SEO.

## Basic Domain Page Stack

The common page stack for opt-in domains is:

| Page | Shape | Required | Notes |
| --- | --- | --- | --- |
| Index | `/<domain>` | Yes | Public collection surface. |
| Detail | `/<domain>/:slug` or `/<domain>/:id` | Yes | Public record surface when records are public. |
| Admin curation | `/dashboard/admin/<domain>` | Yes | Comma-separated featured/pinned slug field only for now. |
| Create | `/<domain>/create` | Optional | Only when self-service or public root creation is supported. |
| Edit | `/<domain>/:slug/edit` or equivalent | Optional | Shape depends on edit ownership. |
| Operator | `/<domain>/:slug/operator` | Optional | Entry into operational/private work. |
| Learn more | `/<domain>/learn-more` | Optional | Marketing/help, not core stack. |
| Console | `/console/<family>` | Optional | Only for console-managed domains. |

## Edit Ownership Types

Editing does not need one forced route shape. A domain should declare where edit
authority lives:

| Type | Meaning | Example |
| --- | --- | --- |
| `simple-edit` | Root record has a direct edit page. | `/jobs/edit/:id` |
| `console-managed` | Editing happens inside a selected console/workspace. | `/console/kitchen/*` |
| `profile-managed` | Editing belongs to the user's profile/dashboard surface. | `/dashboard/professional/profile` |
| `admin-managed` | Editing is app-admin owned. | `/professionals/admin/:id` |
| `utility-create-only` | The app can create/publish, but has no edit system yet. | Go QR docs |

## Current Matrix

Legend:

- `yes`: route/surface exists.
- `partial`: exists but naming, ownership, or route shape needs checking.
- `missing`: not found yet.
- `draft`: exists in current working tree or recent exploration, but not settled.
- `shelve`: provider exists, but the app/product decision is not to promote it yet.

| Domain | Provider | Index | Detail | Create | Edit ownership | Operator | Admin curation | Current read |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `apps` | `fireux-core` / FireUX app | yes | yes | yes | partial | missing | yes | Consumed by FireUX to show apps in the ecosystem. |
| `ecosystems` | FireUX app/core model | yes | yes | missing | console-managed | missing | yes | FireUX-only domain. |
| `projects` | FireUX app/core model | yes | yes | yes | console-managed | yes | yes | Project console is the real edit surface. |
| `modules` | FireUX app / Products-like | yes | yes | missing | partial | missing | yes | May be product-kind rather than a true domain. |
| `kitchens` | `fireux-kitchens` | yes | yes | yes | console-managed plus simple edit | yes | yes | Strong reference domain. |
| `chefs` | `fireux-kitchens` | yes | yes | missing | profile/admin-managed | partial | yes | Profile-ish; likely opt in only where useful. |
| `ingredients` | `fireux-kitchens` | yes | yes | partial | console-managed | missing | yes | Public stack exists; curation is slug-only. |
| `recipes` | `fireux-kitchens` | missing | missing | missing | console-managed | missing | missing | Currently kitchen child/operation, not public domain. |
| `suppliers` | `fireux-suppliers` | yes | yes | yes | console-managed | yes | yes | Consumed by Misebox/Bringli when opted in. |
| `jobs` | `fireux-jobs` | yes | yes | yes | simple-edit | missing | yes | Consumed where jobs are a public domain. |
| `professionals` | `fireux-jobs` | yes | yes | missing | profile/admin-managed | partial | yes | Important for Find My SEO. |
| `agents` | `fireux-jobs` | yes | yes | missing | profile/admin-managed | partial | yes | Shelve unless a product asks for it. |
| `properties` | `fireux-properties` | yes | yes | partial | console-managed | yes | yes | Public/private blend; opt in carefully. |
| `portfolios` | `fireux-properties` | yes | yes | yes | console-managed | yes | yes | Public/private blend; opt in carefully. |
| `places` | `fireux-places` | yes | yes | yes | simple-edit | missing | yes | Shelve for now; support/context domain. |
| `companies` | `fireux-companies` | yes | yes | yes | simple-edit | missing | yes | Shelve for now; support/context domain. |
| `docs` | Go QR app-local | yes | yes | upload flow | utility-create-only | missing | missing | Utility/noindex pages, not a normal public SEO domain yet. |

## Open Questions

- Should `modules` be a true domain, or remain a `Product` kind?
- Should `recipes` become a public domain, or stay a Kitchen child operation?
- Should `ingredients` be public outside Kitchen, or only support menu/recipe work?
- Should `docs` ever become a normal domain, or stay a utility public-link flow?
- Which apps should consume `properties` and `portfolios` publicly, given the
  public/private blend?

## Next Alignment Step

Pick one provider domain and make it satisfy the stack completely.

Recommended first provider: `kitchens`.

Reason: Kitchen already has the richest public/detail/console pattern and is the
best reference for later suppliers, jobs, and professionals.
