# Demo Data Canon

Authority: Operational
Updated: 2026-05-15
Scope: runtime demo records, repo-level `demo/*.demo.ts` fixtures, and collection source behaviour.

Tier1 authority: `docs/fireux-canon.md`.

## Core Rule

Demo data exists to help development, product demos, UX exploration, and explicit preflight surfaces.

Demo data is not storage canon by itself. It must bend toward live and test shape.

## Identity Split

Keep these concepts separate:

- `User` is the person.
- `Professional`, `Chef`, and `Agent` are profile capabilities the person can use in a given app/profile context.
- `AppUser` is the app membership overlay at `apps/{appId}/users/{userId}`.
- A console entity is the thing a person operates, such as a kitchen, supplier, portfolio, or project.

Practical fixture rule:

- Put shared people in `demo/user.demo.ts`.
- Profile/product fixtures reference shared people with `userId`.
- Product-owned records keep product fields, such as provider type, brand name, services, pricing, case studies, and lead data.
- Do not use product/profile ids as root user ids.

Example:

```ts
userId: 'demo-user-seo-alex'
professionalId: 'professional-alex-mercer'
```

## Placement Rule

Use one demo location for one job:

- `demo/*.demo.ts` is for repo-wide fixtures and reusable view payloads.
- `packages/*/src/runtime/**/demo-scenarios*` is for package-owned runtime and console scenarios.
- `projects/<ecosystem>/<app>/app/demo/*.ts` is for app-local demo records.
- `projects/<ecosystem>/<app>/app/meta.ts` is for app identity, positioning, product language, SEO language, CTAs, lists, and conceptual entities.

Do not put guest guides, sample info pages, public menus, provider cards, avatars, logos, entity records, concrete demo slugs, or smoke routes in app meta.

## Source Evidence Rule

When demo data starts from a real-world source, such as a host manual, the source is evidence.

Do not invent missing fields just because the product shape expects them. If the source lacks check-in time, arrival steps, current Wi-Fi confirmation, parking bay details, or public-contact approval, keep the missing state explicit with source notes or follow-up questions.

Product language can evolve around the idea, but source-backed records must distinguish:

- facts present in the source
- normalized placement of those facts
- missing facts to ask for
- demo-only placeholders

Practical pattern:

```ts
source_notes: [
  {
    id: 'ask-owner-check-in-time',
    status: 'needs_source_confirmation',
    owner: 'property-owner',
    field: 'arrival.check_in_time',
    note: 'Source manual does not state a check-in time.',
  },
]
```

## Collection Fetch Rule

Collection composables read live Firestore by default.

Current user collection behaviour:

- `useUserCollection()` streams root `users`.
- `useAppUserCollection()` streams `apps/{appId}/users` and hydrates each membership from root `users`.
- Demo user fixtures must not silently replace these reads.

If a collection later needs demo support, use an explicit source option:

```ts
useUserCollection({ source: 'demo' })
```

Do not add hidden demo fallbacks to live collection composables.

## App User Fixture Rule

`AppUser` is canon as a stored membership overlay.

Do not add repo-level app-user fixture exports unless one of these exists:

- a seed script writes them to Firestore
- a dev surface consumes them directly
- `useAppUserCollection({ source: 'demo' })` or equivalent explicit demo source is implemented

Until then, shared demo users can carry lightweight `userOf` and `adminOf` hints, but real app membership remains the stored `apps/{appId}/users/{userId}` record.

## Media Rule

Demo entity avatars and logos should be URL-backed unless the task is testing local asset pipelines.

App brand assets stay under app `public/img/app/*`.

Entity demo avatars and company logos should not be stored in app `public` folders by default.

## Short Version

Demo users are people.

Profile demos reference people.

App membership is a real overlay, not a guessed fixture.

Live collection composables stay live unless demo mode is explicit.
