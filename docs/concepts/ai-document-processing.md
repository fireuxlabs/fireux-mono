AI document processing map
Updated: 2026-06-25
Ref: 22f65613f
Role: map, not canon

Purpose:
Map the shared AI document-processing spine so menu photos, CV uploads,
supplier delivery notes, and future document flows do not each invent their
own provider loop.

Vertical links:
- Parent: server-api.md
- Parent: tool-provider.md
- Child: family-menu.md

Horizontal links:
- fireux.md
- firestore-entity.md
- console.md
- create.md

Family:
AI document processing is not an entity. It is a server-side processing seam.
Domain packages own domain meaning. `fireux-ai` owns the provider loop.

Current spine:
- Source files are uploaded and stored by the consuming domain/app.
- Domain adapter selects source files and describes the extraction job.
- `fireux-ai` runs the provider loop over each file.
- Each file returns `complete`, `empty`, or `failed`.
- Domain adapter normalizes provider JSON into domain objects.
- Domain adapter compares against existing records when useful.
- Confirmed runs may write draft/review records, but must not silently
  overwrite published truth.
- Confirmed runs may record billable usage against the owning domain.

Provider-owned:
- API provider config.
- Model selection.
- JSON response enforcement and parsing.
- Image/file request construction primitives.
- Per-file status handling.
- Provider/model metadata.

Domain-owned:
- Source record lookup.
- Access/auth policy.
- Domain prompt.
- Domain JSON schema.
- Domain normalization.
- Domain comparison.
- Approval/write mutations.

Menu example:
- Kitchen owns `menu-uploads` and current menu/dish records.
- `fireux-ai` processes uploaded menu photos.
- Kitchen normalizes sections/items and compares against current dishes.
- Menu extraction distinguishes required variants from optional extras:
  `price_options` are mutually exclusive sizes/choices, while `add_ons`
  are optional extras/toppings/sides that can be combined.
- Included alternatives expressed with words such as `or`, `oder`, or
  `choice of` are required `price_options` with the full item price repeated
  for each choice. Explicitly optional, separately priced supplements remain
  incremental `add_ons`. Missed alternative language is flagged for review.
- Processing estimates cost first, then writes draft/review data after
  operator confirmation.
- Kitchen records AI usage for later billing/invoicing.

Future examples:
- Professional profile CV: Professional owns the upload and profile fields;
  AI extracts experience, education, skills, and certifications.
- Supplier delivery note: Supplier or Kitchen/Supplier operation owns the
  upload; AI extracts line items, quantities, prices, dates, and supplier refs.

Working notes:
- Do not skip cover pages or pre-filter meaning by filename/order. The AI
  should classify valid but empty/non-content pages as `empty`.
- Do not overwrite published records in the same step as extraction.
- Show a cost estimate before confirmed processing.
- Keep provider output visible enough for debugging, but avoid storing giant
  raw model text by default.
- Start with image-backed documents; PDF page rendering/extraction can be a
  later source-file adapter.

Open questions:
- Where processed-but-unapproved extraction snapshots should live.
- How much raw model output should be retained for audit/debug.
- Whether PDF pages become image files before extraction or get a separate
  text/document extraction path.
