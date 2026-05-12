# Sproochli MVP

Sproochli is a standalone FireUX ecosystem app for multilingual QR pages for real-world places. A place or business can publish short public information pages that visitors open from a QR code, with the page rendered server-side and readable as plain HTML and JSON.

The standalone product app lives at:

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

The app lives under the FireUX ecosystem as `projects/fireux/sproochli` and uses `fireux-fireux`, `fireux-sproochli`, plus core FireUX app configuration. It does not import `fireux-kitchens`, `fireux-suppliers`, or Misebox app code.

The shared `fireux-sproochli` package is also generic. It owns info-page types, language helpers, RTL helpers, translation resolution, and public response building. It should not import Misebox or any kitchen/menu/supplier/chef models.

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

```ts
type Place = {
  id: string
  slug: string
  name: string
  primary_language: string
  supported_languages: string[]
  contact?: string
}

type InfoPage = {
  id: string
  place_id: string
  slug: string
  title: string
  description: string
  original_language: string
  titles: Record<string, string>
  descriptions: Record<string, string>
  sections: InfoSection[]
  active: boolean
  published: boolean
  sort_order: number
}

type InfoSection = {
  id: string
  title: string
  titles: Record<string, string>
  description: string
  descriptions: Record<string, string>
  blocks: InfoBlock[]
  sort_order: number
}

type InfoBlock = {
  id: string
  type: 'text' | 'warning' | 'list' | 'contact' | 'link'
  title?: string
  body: string
  titles?: Record<string, string>
  bodies: Record<string, string>
  sort_order: number
}
```

The current sample data lives in `projects/fireux/sproochli/app/content/sampleInfo.ts`. Generic types and resolver helpers live in `packages/extensions/fireux-sproochli/src/runtime/info`.

## Future Firestore Paths

```text
places/{placeId}
places/{placeId}/info_pages/{pageId}
places/{placeId}/info_pages/{pageId}/sections/{sectionId}
places/{placeId}/info_pages/{pageId}/translation_cache/{language}
translation_glossary/{termId}
```

The translation cache path requested for the first Firestore pass is:

```text
places/{placeId}/info_pages/{pageId}/translation_cache/{language}
```

## Next Steps

1. Add a minimal editor for place and page drafts.
2. Add Firestore persistence only after the static page shape is accepted.
3. Add route-level SEO metadata and sitemap entries once public records are dynamic.
4. Add glossary and AI translation support later, after owner approval and cache semantics are clear.
5. Add QR generation only after public page publishing is stable.
