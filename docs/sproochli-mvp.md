# Sproochli MVP

Sproochli is the translation product. It translates structured documents owned by other apps, stores/reuses translation cache, and enforces strict no-fallback language behavior.

The standalone translation product app lives at:

```text
projects/fireux/sproochli
```

The shared generic multilingual info-page tooling lives at:

```text
packages/extensions/fireux-sproochli
```

The name comes from "Sprooch", Swiss German/Bernese-style for language or speech, with "-li" giving it a small friendly Swiss feel.

## Separate From Misebox

Sproochli is not Misebox and should not depend on Misebox domain models. It is generic place information infrastructure, not a kitchen, chef, supplier, menu, recipe, or restaurant system.

The app lives under the FireUX ecosystem as `projects/fireux/sproochli` and uses `fireux-fireux`, `fireux-sproochli`, plus core FireUX app configuration. It does not import `fireux-kitchens`, `fireux-suppliers`, Misebox app code, or BuenoHost guest-guide ownership code.

The shared `fireux-sproochli` package is also generic. It owns language helpers, RTL helpers, translation resolution, translation cache conventions, and public response helpers. It should not import Misebox kitchen/menu models or BuenoHost guest-manual models.

Misebox can later reuse generic public JSON and translation helpers from `fireux-sproochli` for menu-readable endpoints without Sproochli depending on Misebox.

## Language Model

- Original/default: the content the owner wrote.
- Certified languages: owner-approved attached translations.
- Cached languages: generated translation output for one specific page.
- Glossary: reusable learned translation knowledge for future translation quality.
- Cache: what the public page can show.

The MVP intentionally does not build AI translation, glossary management, or editor workflows yet.

## Sample Routes

- `/`
- `/info/bern-bike-rental/rental-instructions`
- `/info/bern-bike-rental/rental-instructions?lang=en`
- `/info/bern-bike-rental/rental-instructions?lang=de`
- `/info/bern-bike-rental/rental-instructions?lang=fr`
- `/info/bern-bike-rental/rental-instructions?lang=it`
- `/info/bern-bike-rental/rental-instructions?lang=ar`
- `/console/info`
- `/api/public/info/bern-bike-rental/rental-instructions?lang=en`

Arabic renders with `dir="rtl"`. Other sample languages render with `dir="ltr"`.

The public JSON endpoint is intentional product infrastructure, not only developer convenience. It gives crawlers, AI review tools, and debugging workflows a stable readable version of the same public page:

```text
/api/public/info/{placeSlug}/{pageSlug}?lang={language}
```

## Sample Data Model

The shared human term for people who keep Sproochli content accurate is:

```text
Maintainer
```

A maintainer can be a BNB host, apartment manager, restaurant manager, bike-shop owner, or trusted info editor. Roles can be `owner`, `manager`, `editor`, or `viewer`, but the collection name stays `maintainers` across BNB, menu, and info branches.

```ts
type SproochliSite = {
  id: string
  slug: string
  type: 'bnb' | 'menu' | 'info'
  name: string
  title: string
  status: 'draft' | 'published' | 'archived'
  primary_language: string
  original_language: string
  published: boolean
}

type SproochliMaintainer = {
  id: string
  display_name: string
  maintainer_type: 'host' | 'manager' | 'owner' | 'info_editor'
  role: 'owner' | 'manager' | 'editor' | 'viewer'
  email?: string
  phone?: string
  uid?: string
}

type SproochliPage = {
  id: string
  slug: string
  title: string
  description: string
  original_language: string
  titles: Record<string, string>
  descriptions: Record<string, string>
  sections: SproochliSection[]
  active: boolean
  published: boolean
  sort_order: number
}

type SproochliSection = {
  id: string
  title: string
  titles: Record<string, string>
  description: string
  descriptions: Record<string, string>
  blocks: InfoBlock[]
  sort_order: number
}

type SproochliBlock = {
  id: string
  type: 'text' | 'warning' | 'list' | 'contact' | 'link'
  title?: string
  body: string
  titles?: Record<string, string>
  bodies: Record<string, string>
  sort_order: number
}
```

The current static proof data lives in:

```text
projects/fireux/sproochli/app/content/bnbGuides.ts
projects/fireux/sproochli/app/content/sampleInfo.ts
```

The first seed path for Nat's BNB guide is:

```text
node scripts/seed-sproochli-bnb-guides.mjs --commit
```

That migrates the static BNB proof into the Sproochli app database. Generic types and resolver helpers live in `packages/extensions/fireux-sproochli/src/runtime/info`.

## Firestore Paths

```text
sproochli_sites/{siteId}
sproochli_sites/{siteId}/maintainers/{maintainerId}
sproochli_sites/{siteId}/guest_messages/{messageId}
sproochli_sites/{siteId}/pages/{pageId}
sproochli_sites/{siteId}/pages/{pageId}/sections/{sectionId}
sproochli_sites/{siteId}/pages/{pageId}/translation_cache/{language}
sproochli_translation_glossary/{termId}
```

For the first BNB proof:

```text
sproochli_sites/holiday-with-nats
sproochli_sites/holiday-with-nats/maintainers/natalie
sproochli_sites/holiday-with-nats/guest_messages/current
sproochli_sites/holiday-with-nats/pages/guest-guide
sproochli_sites/holiday-with-nats/pages/guest-guide/sections/{sectionId}
```

## Next Steps

1. Add a minimal editor for place and page drafts.
2. Add Firestore persistence only after the static page shape is accepted.
3. Add route-level SEO metadata and sitemap entries once public records are dynamic.
4. Add glossary and AI translation support later, after owner approval and cache semantics are clear.
5. Add QR generation only after public page publishing is stable.
