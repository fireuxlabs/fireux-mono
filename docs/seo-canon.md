# SEO Canon
Authority: Tier1 (Authoritative)

## Purpose
- Define repo-wide SEO requirements for public FireUX entities and pages.

## Slug Policy
- Public/indexable entities must have a slug.
- Slug is required before publish.
- Slug changes require redirect coverage from previous canonical slug(s).

## Slug Immutability and Redirects
- Default policy: slug is immutable after publish.
- If an approved change is required:
  - create redirect mapping old slug -> new slug
  - keep canonical URL on the new slug
  - avoid broken indexed URLs

## Metadata Minimums (Public Pages)
- Required metadata:
  - `title`
  - `description`
  - `canonical`
  - Open Graph (`og:title`, `og:description`, `og:url`, `og:image`)
  - Twitter (`twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`)

## Structured Data Requirements
- Jobs: `JobPosting`
- Products: `Product` (or `Offer` additions when applicable)
- Places/Kitchens/Companies: `LocalBusiness` or `Organization` (entity-dependent)
- Blogs/Articles: `Article`

## Indexing Policy
- Public published pages: indexable.
- Dashboard/admin/auth-only pages: `noindex, nofollow`.
- Draft/unpublished public candidates: `noindex`.

## Sitemap Policy
- Sitemap is generated from published canonical public entities only.
- Exclude admin, dashboard, auth-only, and draft routes.
- Public URLs in sitemap must use canonical slug routes where defined.

## Extension Responsibility Pattern
- Each extension with public pages must expose:
  - `use<Entity>Seo` helper for metadata
  - `build<Entity>JsonLd` helper for structured data
- Extensions must keep SEO helpers aligned with their `docs/contract.md`.

## Conflicts Resolved
- Current permissive robots files do not define canon; this file defines intended indexing rules.
- Dashboard/admin indexing policy is canonicalized here and must be enforced in runtime/config changes in follow-up work.

## TBD Decisions (Deano)
- Slug rollout scope for currently id-based public entities (jobs/places/companies/kitchens):
  - Default: phase by extension
  - Note: products/blog already slug-first
- SEO enforcement timing:
  - Default: after Kitchen MVP polish (next sprint after dashboard stability)
  - Includes: robots/meta noindex, sitemap, JSON-LD helpers, canonical URLs
- AI/** tracking policy:
  - Default: keep AI/** ignored
  - Optional later: track `AI/README.md` + `AI/codex-threads/index.md` only
