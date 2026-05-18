# fireux-blogs Contract
Authority: Tier1 (Authoritative)
Updated: 2026-05-18
References: `docs/fireux-canon.md`, `docs/runtime-contract.md`, `docs/seo-canon.md`

## 1) Purpose
- Own the blog/post domain for FireUX apps.

## 2) Core entities
- `BlogPost`

## 3) Identity rule
- `BlogPost` identity is slug-first for public pages (`id`/doc id aligns with slug at publish time).

## 4) Collections + paths
- `blogs/{slug}`
- Collection name sanity-check: runtime write/read composables currently use `blogs` (no alias collection configured).

Composable stack canon:
- `firestore/blog/useBlog.ts` is the singular BlogPost family entry seam.
- `firestore/blog/fetch/useBlogFetch.ts` owns read-one BlogPost reads.
- `firestore/blog/fetch/useBlogCollection.ts` owns read-many BlogPost reads and default collection ordering.
- `firestore/blog/fetch` owns root BlogPost reads.
- `firestore/blog/mutations` owns root BlogPost writes.
- `firestore/blog/utils` owns root BlogPost helpers and view/interface utilities.
- `firestore/blog/utils/view/useBlogComputed.ts` owns derived BlogPost facts.
- `firestore/blog/utils/view/useBlogInterface.ts` owns BlogPost UI projections.
- `composables/fireux/blog/editor` owns BlogPost authoring/editor draft and submit helpers.
- BlogPost authoring/editor draft state belongs under `composables/fireux/blog/editor`, not under `fireux/app` or `firestore/blog`.

## 4a) Root scope fields
- `source_app_id`
- `source_ecosystem_id`
- `owner_type`
- `owner_id`
- `visibility`

Blog pages should filter root posts through these fields rather than creating app-local blog storage by default.

## 5) Routes (public vs internal; slug vs id)
- Public/indexable:
  - `/blog`
  - `/blog/[slug]`
- Internal/admin:
  - `/admin/blogs/*`

## 6) Surfaces supported
- `Pill`, `Cell`, `Preview`, `Profile` supported for blog cards/views.
- Treated as a core published entity surface set.

## 7) Runtime dependencies
- Firestore document + collection access.
- Editor stack (TipTap/DOMPurify) for authoring.

## 8) SEO hooks
- Public blog pages must use extension SEO helpers:
  - `useBlogSeo`
  - `buildBlogJsonLd` (`Article`)

## 9) Mutation entrypoints (write composables)
- `useBlogCreate`
- `useBlogUpdate`
- `useBlogDelete`

## 10) Non-goals / prohibited fallbacks
- No silent fallback from missing slug to id for public route generation.
- No implicit selection/routing fallbacks; missing publish identity must fail explicitly.
