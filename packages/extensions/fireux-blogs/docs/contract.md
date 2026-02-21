# fireux-blogs Contract
Authority: Tier1 (Authoritative)
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
