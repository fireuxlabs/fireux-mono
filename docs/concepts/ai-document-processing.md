# AI document processing map

Updated: 2026-08-16
Ref: 76aabc4b4
Role: map, not canon

## Purpose

Map the shared AI document-processing spine so menu photos, CV uploads,
supplier delivery notes, and future document flows do not each invent their
own provider loop.

## Vertical links

- Parent: server-api.md
- Parent: tool-provider.md
- Child: family-menu.md

## Horizontal links

- fireux.md
- firestore-entity.md
- console.md
- create.md

## Family

AI document processing is not an entity. It is a server-side processing seam.
Domain packages own domain meaning. `fireux-ai` owns the provider loop.

## Current spine

- Runtime execution is explicit: `disabled`, deterministic `simulator`, local
  `codex`, or provider-backed `app`. Enabling the module without choosing a
  mode defaults to the simulator, and legacy `dev` input resolves to that same
  safe mode.
- Only `app` may call a configured provider. The simulator returns bounded,
  deterministic development output and records no provider token usage.
- `codex` is a development-only reasoning transport. It receives the exact
  serialized request envelope used by the provider adapter, with provider keys
  removed, in an empty ephemeral read-only workspace. It must not inspect the
  repository, browse, run tools, or inherit task history.
- Source files are uploaded and stored by the consuming domain/app.
- Domain adapter selects source files and describes the extraction job.
- `fireux-ai` runs the provider loop over each file.
- Each file returns `complete`, `empty`, or `failed`.
- Domain adapter normalizes provider JSON into domain objects.
- Domain adapter compares against existing records when useful.
- Confirmed runs may write draft/review records, but must not silently
  overwrite published truth.
- Confirmed runs may record billable usage against the owning domain.

## Provider-owned

- API provider config.
- Model selection.
- JSON response enforcement and parsing.
- Image/file request construction primitives.
- Per-file status handling.
- Provider/model metadata.

## Domain-owned

- Source record lookup.
- Access/auth policy.
- Domain prompt.
- Domain JSON schema.
- Domain normalization.
- Domain comparison.
- Approval/write mutations.

## Menu example

- Kitchen owns `menu-uploads` and current menu/dish records.
- `fireux-ai` processes uploaded menu photos.
- Kitchen normalizes sections/items and compares against current dishes.
- Menu extraction distinguishes required variants from optional extras:
  `price_options` are mutually exclusive sizes/choices, while `add_ons`
  are optional extras/toppings/sides that can be combined.
- The canonical KitchenMenu keeps one authored `Default` value per field and
  declares no source language. When an uploaded document prints aligned copies
  in other languages, the review draft preserves those copies beside their
  matching field rather than flattening or discarding them.
- Confirmation commits canonical Default content first. It then writes the
  extracted language copies through Sproochli's host-local server seam using
  the same content-addressed Menu translation recipe as visitor-time
  generation. The consuming host owns the named `sproochli` database; Kitchen
  owns no parallel translation cache and no remote cache-import endpoint.
- A document with no aligned language copies creates only Default. The first
  visitor request for another language follows Sproochli's ordinary
  generate-on-miss/write-once path, so imported and visitor-populated Menus
  converge on the same cached reading experience.
- Included alternatives expressed with words such as `or`, `oder`, or
  `choice of` are required `price_options` with the full item price repeated
  for each choice. Explicitly optional, separately priced supplements remain
  incremental `add_ons`. Missed alternative language is flagged for review.
- Processing estimates cost first, then writes draft/review data after
  operator confirmation.
- Kitchen records AI usage for later billing/invoicing.
- Kitchen persists a per-item media decision separately from extracted candidates.
  A reviewed Keep candidate is fetched through the bounded public-raster policy and
  crosses canonical Dish normalization only at confirmation. Generate and
  Reprocess with AI remain explicit, selective work and block confirmation until
  their reviewable output exists; No image performs no media write.

## Future examples

- Professional profile CV: Professional owns the upload and profile fields;
  AI extracts experience, education, skills, and certifications.
- Supplier delivery note: Supplier or Kitchen/Supplier operation owns the
  upload; AI extracts line items, quantities, prices, dates, and supplier refs.

## Working notes

- Do not skip cover pages or pre-filter meaning by filename/order. The AI
  should classify valid but empty/non-content pages as `empty`.
- Do not overwrite published records in the same step as extraction.
- Show a cost estimate before confirmed processing.
- Keep provider output visible enough for debugging, but avoid storing giant
  raw model text by default.
- Keep direct PDF and image inputs as the current source adapters. Add PDF page
  rendering only when a measured provider limitation requires it.

## Source evidence

- Runtime mode resolution and provider gate:
  `packages/extensions/fireux-ai/src/runtime/server/utils/fireux-ai-config.server.ts`
- Providerless simulator:
  `packages/extensions/fireux-ai/src/runtime/server/utils/fireux-ai-simulator.server.ts`
- Isolated Codex development transport:
  `packages/extensions/fireux-ai/src/runtime/server/utils/fireux-ai-codex.server.ts`
- Shared provider loop:
  `packages/extensions/fireux-ai/src/runtime/server/utils/document-ai.server.ts`
- Menu domain adapter:
  `packages/extensions/fireux-kitchens/src/runtime/server/menu/ai/extraction.ts`
- Menu review/checkpoint lifecycle:
  `packages/extensions/fireux-kitchens/src/runtime/server/menu/ai/review.ts`
- Menu confirmation boundary:
  `packages/extensions/fireux-kitchens/src/runtime/server/api/console/kitchen/menus/confirm.post.ts`
- Menu host-local cache import:
  `packages/extensions/fireux-kitchens/src/runtime/server/menu/sproochli/cache-import.ts`
- Sproochli translation-memory persistence:
  `packages/extensions/fireux-sproochli/src/runtime/server/menu/translation-memory.ts`

## Delta register

| Difference                                                                   | State        | Reason or alignment trigger                                                                                       |
| ---------------------------------------------------------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------- |
| Menu is the only proven domain adapter                                       | `accepted`   | It proves the shared loop without forcing CV or delivery-note semantics into Kitchen code                         |
| Menu accepts URL text, direct PDF files, and images                          | `accepted`   | Source transport differs, while status, provider metadata, and domain normalization remain shared                 |
| Menu stores retry checkpoints in `ai_process` and review truth in `ai_draft` | `accepted`   | Snapshot location is domain-owned; another domain may use a different record while preserving the review boundary |
| Successful extraction does not retain giant raw model text                   | `accepted`   | Structured output, bounded per-file metadata, and failure excerpts are enough for current review/debug needs      |
| No second domain has proved the adapter contract                             | `to-confirm` | Do not generalize prompts, draft schemas, or approval records until another real consumer exists                  |
| PDF handling is direct-file while images use image input                     | `accepted`   | The provider supports both; introduce page rendering only when a measured PDF failure requires it                 |

## Alignment roadmap

### Now

- Keep source ownership and approval writes in the consuming domain.
- Keep provider/model mechanics in `fireux-ai`.
- Preserve extraction checkpoints without treating them as published truth.

### Next

- Add one non-Menu consumer before changing the shared adapter contract.
- Compare failure, retry, usage, and approval needs across those two domains.

### Later

- Extract a shared review-record shape only if two domains persist the same
  lifecycle.
- Add a PDF page-rendering adapter only with failing-document evidence and a
  bounded storage/cleanup policy.
