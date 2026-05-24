# SEO Canon
Authority: Tier1 (Authoritative)
Updated: 2026-05-24
## Purpose
- Define repo-wide SEO requirements for public FireUX entities and pages.

## Slug Policy
- Public/indexable entities must have a slug.
- Slug is required before publish.
- Slug changes require redirect coverage from previous canonical slug(s).
- Existing id-keyed public families may register `id` as the explicit sitemap route key only while their extension contract still defines id-based public routing. That is not a fallback chain.

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
- Console/admin/auth-only pages: `noindex, nofollow`.
- Draft/unpublished public candidates: `noindex`.
- Tenant apps default to `noindex, nofollow` unless a Tier1/Tier1-extension contract explicitly declares published tenant SEO surfaces.
- Placeholder tenant pages/assets do not create indexable SEO surfaces.

## Sitemap Policy
- Sitemap is generated from published canonical public entities only.
- Exclude admin, console, auth-only, and draft routes.
- Public URLs in sitemap must use canonical slug routes where defined.
- Runtime sitemap entity pages must read canonical public collection data.
- Runtime sitemap entity registration must declare explicit publication truth, such as `show === true`, `isPublic === true`, or `visibility === 'public'`.
- Slug presence alone is not publication truth, except for a documented handle-index migration exception.
- `seo_index_*` projection collections are not sitemap fallback truth.
- If a canonical collection/path is missing, skip that entity explicitly instead of reading an old projection collection.
- Runtime mutation seams should not write `seo_index_*` records.
- SEO projections may exist later only as deliberate generated output for a named feature, not as silent route truth.

## Extension Responsibility Pattern
- Each extension with public pages must expose:
  - `use<Entity>Seo` helper for metadata
  - `build<Entity>JsonLd` helper for structured data
- Extensions must keep SEO helpers aligned with their `docs/contract.md` or `docs/canon.md`.
- Entity SEO helpers may delegate shared tag/canonical mechanics to core `useSeo()`.
- Entity SEO helpers own indexability. Core must not infer publication from a slug/id alone.

## Conflicts Resolved
- Current permissive robots files do not define canon; this file defines intended indexing rules.
- Console/admin indexing policy is canonicalized here and must be enforced in runtime/config changes in follow-up work.
- Older server-projection notes allowed non-migrated entities to fall back to `seo_index_*`; that is no longer canon.

## TBD Decisions (Deano)
- Slug rollout scope for currently id-based public entities (jobs/places/companies/kitchens):
  - Default: phase by extension
  - Note: products/blog already slug-first
- SEO enforcement timing:
  - Default: after sitemap fallback cleanup and active public surface inventory
  - Includes: robots/meta noindex, JSON-LD helpers, canonical URLs, and per-extension public DTO/read plans
- Tier3 AI memory location:
  - Default: keep Tier3 memory under `docs/ai/**`
  - Tier3 memory is tracked for auditability but is non-authoritative
