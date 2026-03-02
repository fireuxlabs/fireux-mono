# Server Projection Canon v1
Authority: Tier2 (Operational report)
Updated: 2026-03-02
Generated: 2026-03-02T09:05:13+01:00  
Canon version: `server-projection-v1`  
Scope: FireUX mono-repo public SEO surfaces and sitemap generation

## What Changes

- Public SEO read paths move to server projection endpoints (`/api/public/**`).
- Public page SSR (`/users`, `/users/:handle` first) reads endpoint payloads with `useAsyncData`.
- Public meta (`title`, `description`, canonical) is generated from server DTOs, not client-only Firestore reads.
- Sitemap generation moves from `seo_index_*` to canonical root docs (`users` migrated first).

## What Stays

- Console/Dashboard/Admin CRUD and Collection Manager patterns stay unchanged.
- Existing client CRUD composables stay in place for private/operator surfaces.
- Existing `seo_index_*` collections for non-migrated entities stay during rollout.

## Phased Migration

1. Users
- Add `/api/public/users` and `/api/public/users/:handle`.
- Switch `/users` and `/users/:handle` to endpoint-first SSR.
- Make users sitemap canonical-doc-first.

2. Jobs
- Add public DTO endpoints for jobs list/detail.
- Switch `/jobs` and `/jobs/:id` to endpoint-first SSR and meta.

3. Kitchens
- Add public DTO endpoints for kitchens list/detail.
- Switch `/kitchens` and `/kitchens/:id` read path.

4. Places
- Add public DTO endpoints for places list/detail.
- Switch `/places` and `/places/:id` read path.

5. Companies
- Add public DTO endpoints for companies list/detail.
- Switch `/companies` and `/companies/:id` read path.

6. Profiles
- Add endpoints for agents/professionals/chefs/suppliers.
- Switch profile public pages to endpoint-first SSR.

7. Blogs and Recipes
- Add endpoints for blog and recipe list/detail DTOs.
- Switch public content pages to endpoint-first SSR.

## Indexing Guardrails

- Never index: `/console/**`, `/dashboard/**`, `/admin/**`, `/dev/**`, `/auth/**`, `/onboarding/**`.
- Public pages must render meaningful SSR HTML without client-only Firestore dependence for initial meta/content.
- Keep canonical source of truth in root docs; long-term remove projection collection dependence.

## Transitional State Notes

- `handles` legacy collection is retired; runtime profile routing resolves from `users.handle`.
- `seo_index_users` is retired; users pages and sitemap resolve from canonical users docs.
- Other `seo_index_*` collections remain until each entity migrates.

## Reports Must Stay Fresh

Every canonical report must include:
- Generated timestamp
- Canon version string
- Scan scope (included paths + exclusions)

When canon changes:
- Regenerate all canonical reports
- Update generator scripts that produce those reports
- Ensure reports reference current source-of-truth paths
