# Translation and reviewed copy

Updated: 2026-07-25
Role: map, not canon

## Purpose

Map the boundary between transient localization helpers and durable,
human-reviewed public copy.

## Shared spine

- `fireux-translation` owns the product-neutral language catalogue and client
  request helpers used to seed transient/localized fields. It owns no provider
  credentials, reviewed-copy persistence, or approval workflow.
- `fireux-sproochli` owns multilingual document models, provider transport,
  language selection, and reviewed authored-copy workflow semantics.
- Trusted AI drafting runs in the Sproochli server. A draft preserves English
  source intent, target language, profile identity, provider provenance, and
  the `ai_draft` state.
- Important public brand copy is served only from an approved phrase pack or a
  future bounded approved server projection. Browsers neither generate nor
  approve it at runtime.
- A reviewed phrase-pack entry preserves one display-ready English source and
  exact target-language variants. Every target variant carries its own
  profile, status, and provenance; a missing or unapproved requested language
  fails closed instead of displaying another language.
- Dialect is explicit authoring context. `gsw` is not treated as generic `de`;
  profiles carry locale, region, style, and glossary metadata.
- Apps own tenant-specific language profiles and phrase packs. Generic packages
  own the workflow contract, never a tenant's vocabulary.
- A sparse `sproochli` attachment on the canonical root Kitchen owns whether
  its shared public surfaces participate and which source state they present.
  AppKitchen remains access/support only and cannot override this capability.
- A public Menu manifest exposes only bounded display state: enabled,
  default/selected language, the shared catalogue, and languages backed by
  approved public content. A structured Menu requests translation through
  Sproochli's trusted provider. The Sproochli server reads and writes a
  source-aware translation memory in its named database, while the browser
  keeps the selected translated view only for its current session and performs
  no database write or approval. Translation-memory output is always
  `unreviewed`; a configured, requested, persisted, or client-cached language
  is not evidence that reviewed copy exists.
- Shared Menu-surface chrome remains one versioned, Kitchens-owned English
  source catalogue. It travels through the same Sproochli provider request and
  translation memory, so universal Browse wording is generated once per source
  version/language context and is never copied into Menu or Kitchen records.
  Translated allergy wording remains unreviewed machine output, not reviewed
  safety or legal copy.
- Provider translation memory is a separate storage family from reviewed
  `translation_documents`. Its content-addressed key includes cache recipe,
  domain, field kind, normalized source and target languages, glossary version,
  and source hash. Records preserve bounded source text and provider provenance;
  successful misses are created server-side with first-writer-wins semantics.
- The shared language trigger is one circular control. A mixed-source page
  presents Sproochli's purple translation mark as `Default`: two language
  tiles and exchange arrows inside the product's circular mark. It is the sole
  static language-state asset and the same artwork as the Sproochli product
  logo. When a language is active, including English, the trigger uses that
  language option's emoji. Its picker leads with the linked Sproochli wordmark
  rather than explanatory language copy. Ready and session-cached choices
  appear above one divider; uncached provider choices remain below it.

## First proof

Interlaken Essen owns the `interlaken-berner-oberland-v1` dialect profile, the
`interlaken-swiss-standard-german-v1` professional profile, and their reviewed
phrase pack. Public surfaces resolve approved entries such as `Choufe`,
`Verchoufe`, `Futter`, and `Chum cho esse`; they do not request live
generation.

Its project-owned site-shell order is `gsw`, `de`, and `en`, defaulting to
`gsw` and persisting the visitor's valid choice across Interlaken routes.
German uses the selector code `de`, locale `de-CH`, Swiss orthography, and a
professional formal register; French and Italian remain deferred. Each
approved site entry carries display-ready English source intent and exact
reviewed target variants; the language-aware resolver serves only those
source-controlled values and performs no visitor-time generation.

The project-owned marketplace routes, onboarding, account UI, SEO,
accessibility labels, picker chrome, and language-bearing launch artwork use
that resolver. The project app root sets the selected document locale across
all routes. German is currently bounded to project-owned marketplace routes.
`fireux-blogs` owns a sparse BlogPost Sproochli attachment and bounded
approved-language projection; Futter keeps only canonical Blog slug references
and omits stories that lack the selected approved language. Shared Core
Auth/default-shell/legal wording and generic Blog chrome are not copied into
the tenant pack and still need owner-level locale-aware copy before those
inherited routes can expose German.

Luna Piccante is the first canonical Kitchen-to-Menu attachment proof. Its
mixed-source Menu displays the Default mark and complete language catalogue
immediately. A selected provider language produces an unreviewed translated
view backed by reusable Sproochli translation memory; only separately reviewed
content can become published copy. The bounded public Kitchen detail also
projects its sparse Sproochli attachment and provides the shared language
trigger; the selected language is carried into published Menu doorways without
copying Menu translation state onto Kitchen.

## Source and verification

- Workflow types and approval resolver:
  `packages/extensions/fireux-sproochli/src/runtime/copy.ts`
- Trusted drafting:
  `projects/fireux/sproochli/server/api/tools/copy/draft.post.ts`
- Pilot profile and approved pack:
  `projects/misebox/interlaken-essen/app/content/sproochli-copy.ts`
- Pilot site-language policy and persisted selection:
  `projects/misebox/interlaken-essen/app/content/sproochli-site.ts` and
  `projects/misebox/interlaken-essen/app/composables/useInterlakenSproochli.ts`
- Localized Blog projection:
  `packages/extensions/fireux-blogs/src/runtime/server/utils/blog/public-projection.ts`
  and
  `packages/extensions/fireux-blogs/src/runtime/composables/fireux/blog/public/usePublicBlogLanguage.ts`
- Kitchen attachment authority and trusted mutation:
  `packages/extensions/fireux-kitchens/src/runtime/server/kitchen/sproochli.ts`
- Public Menu projection:
  `packages/extensions/fireux-kitchens/src/runtime/server/menu/payload/build.ts`
- Shared Menu-surface source copy:
  `packages/extensions/fireux-kitchens/src/runtime/content/menu-surface-copy.ts`
- Translation-memory model:
  `packages/extensions/fireux-sproochli/src/runtime/models/translation.model.ts`
- Content-addressing and server persistence:
  `projects/fireux/sproochli/server/utils/sproochliTranslationKey.ts` and
  `projects/fireux/sproochli/server/utils/sproochliTranslationMemory.ts`
- Executable contract: `scripts/guards/sproochli-copy.mjs`

Reviewed-copy persistence and its reviewer UI remain `to-confirm`.
Translation memory is not that approval workflow. Their eventual
implementation must extend this authority rather than add a third translation
seam or expose direct browser writes.
