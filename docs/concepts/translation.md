# Translation and reviewed copy

Updated: 2026-08-19
Ref: d1a7d5eec
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
- A consuming host owns its runtime Sproochli cache. The shared server package
  resolves the host's Firebase runtime and fixed named database `sproochli`;
  the standalone Sproochli App generates missing translations but never
  selects or writes the host database. Production generation is a
  fixed-audience Google OIDC server-to-server call authorized against an exact
  service-account and host scope; the browser never calls the billable
  provider.
- The host server configures `SPROOCHLI_MENU_PROVIDER_ENDPOINT` and
  `SPROOCHLI_MENU_PROVIDER_OIDC_AUDIENCE` to the same exact HTTPS provider URL.
  The Sproochli receiver configures that audience plus
  `SPROOCHLI_MENU_PROVIDER_SOURCE_SCOPES`, a JSON array of exact
  `service_account_email`, `firebase_project_id`, `database_id`, and `app_ids`
  grants. Production deployment must bind a dedicated host SSR service account
  and its matching grant; neither side infers authority from a Firebase CLI
  alias. These non-secret deployment values live in each App's
  `firebase.runtime-env.json` manifest and are copied into the generated
  function source by the shared guarded deployment preparation.
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
- A sparse Kitchen translation capability configuration owns whether its
  shared Menu surfaces participate and which source state they present; it is
  not a Kitchen root field.
- A Menu manifest exposes only its final Sproochli `state`, selected
  `language`, nullable `readyLanguages`, and resolved shared surface copy.
  Menu records carry no source language: canonical authored content is always
  `Default` and may itself be multilingual. `?sproochli=<code>` is the sole
  selection input. Default never translates or calls the provider. The Menu
  server reads readiness and complete caches locally and calls the provider
  only for fields missing from host-local translation memory. The browser
  writes no translation data and approves nothing.
- Shared Menu-surface chrome remains one versioned, Kitchens-owned English
  source catalogue. A selected language resolves that catalogue and the Menu
  fields through the same host-side cache path. Universal Browse wording is
  never copied into Menu or Kitchen records. Default uses the canonical
  catalogue directly.
  Translated allergy wording remains unreviewed machine output, not reviewed
  safety or legal copy.
- Provider translation memory is a separate storage family from reviewed
  `translation_documents`. Its content-addressed key includes cache recipe,
  domain, field kind, normalized source and target languages, glossary version,
  and source hash. Records preserve bounded source text and provider provenance;
  successful misses are created server-side with first-writer-wins semantics.
- A complete Menu cache is a separate Sproochli database record keyed by the
  Menu source identity, complete source-field fingerprint, and target
  language. It stores every translated field required to render that exact
  Menu projection. Only a complete matching record may place a language in the
  bounded readiness list or render it as a hit; partial memory or provider
  output may not. Cache and memory records carry their originating host App as
  provenance plus their Firebase project and database storage identity.
  Readers require the provenance to be present and reject another project or
  database; Apps inside the same host project intentionally share translation
  memory, while complete-cache fingerprints retain source App identity.
- Multilingual Menu-source extraction may seed aligned variants into that same
  memory directly inside the trusted host server. Imported variants retain
  source-document, extraction-provider, and model provenance but use the same
  unreviewed read path and cache identity as generated variants. No remote
  cache writer or browser seam exists. The canonical Kitchen Menu still stores
  Default only.
  A visitor request for a missing language generates and saves it once; a
  changed Default field produces a new complete fingerprint while unchanged
  fields can still reuse translation memory.
- The shared language trigger is one circular control. A mixed-source page
  presents Sproochli's purple translation mark as `Default`: two language
  tiles and exchange arrows inside the product's circular mark. It is the sole
  static language-state asset and the same artwork as the Sproochli product
  logo. When a language is active, including English, the trigger uses that
  language option's emoji. Its picker leads with the linked Sproochli wordmark
  rather than explanatory language copy. Complete matching languages appear
  under Cached; remaining supported choices appear under On demand. If
  readiness is unavailable, the manifest carries `null` rather than claiming
  that no languages are cached.

## Host registration canon

Enabling `fireux-sproochli` attaches the runtime capability; it does not by
itself register a production host. A production installation is complete only
when Sproochli and the host agree on one explicit registration containing:

- one trusted host-server principal;
- the exact provider endpoint and OIDC audience;
- the host Firebase project, fixed `sproochli` database, and permitted App ids;
- server-only host storage and the minimum roles needed by that host server.

The invariant is **one installation, one scoped host identity, host-owned
storage, centrally provided translation intelligence**. The provider receives
source text and translation context, not credentials or database authority.
The host reads and persists its own cache and translation memory. A host cannot
claim another project, database, App id, or installation merely by changing a
request payload.

FireUX Firebase SSR hosts currently prove this contract with a dedicated
Google service account bound to the deployed Gen 2 function. They use no
downloaded key, default compute identity, browser token, Firebase CLI alias, or
cross-project database grant. A future non-Google host such as WordPress may
use a signed installation credential or another server-verifiable principal,
but it must preserve the same scoped registration and host-storage boundary;
the credential mechanism is an adapter, not a second authority model.

Misebox is the first production proof. Its exact registration is
source-controlled and guarded, but provisioning the service account, minimum
IAM, database, Rules, receiver grant, and deployment values is not yet a
general Sproochli signup command. Until that onboarding seam exists, adding the
module alone must never be described as production-ready registration. The
next reusable seam should make registration idempotent and guarded, emit no
long-lived credentials, and verify both unauthenticated rejection and an
authenticated request from the deployed host identity.

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
authored Menu content is Default and carries no source-language declaration,
even when the source document contains more than one language. Aligned
secondary-language copies extracted from that source seed Sproochli memory;
missing selections use the same generate-once path. Default renders the
canonical Menu directly. English, Arabic, and every other selected language
use the same single complete server path. Complete English and Arabic caches
appear in the picker’s Cached group; other supported choices remain On demand
until their complete projection is stored. Only separately reviewed content
can become published copy. The bounded Kitchen detail also projects its sparse
Sproochli attachment and provides the shared language trigger; the selected
language is carried into published Menu doorways without copying Menu
translation state onto Kitchen.

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
  `packages/extensions/fireux-blogs/src/runtime/server/blog/read.ts`
  and
  `packages/extensions/fireux-blogs/src/runtime/composables/fireux/blog/directory/useBlogLanguage.ts`
- Kitchen attachment authority and trusted mutation:
  `packages/extensions/fireux-kitchens/src/runtime/kitchen/server/identity/sproochli.ts`
- Public Menu projection:
  `packages/extensions/fireux-kitchens/src/runtime/menu/server/payload/build.ts`
  and
  `packages/extensions/fireux-kitchens/src/runtime/menu/server/sproochli/resolve.ts`
- Shared Menu-surface source copy:
  `packages/extensions/fireux-kitchens/src/runtime/menu/utils/menu-surface-copy.ts`
- Translation-memory model:
  `packages/extensions/fireux-sproochli/src/runtime/models/translation.model.ts`
- Host identity and server persistence:
  `packages/extensions/fireux-sproochli/src/runtime/host.ts` and
  `packages/extensions/fireux-sproochli/src/runtime/server/menu/`
- Trusted host-local extraction import:
  `packages/extensions/fireux-kitchens/src/runtime/menu/server/sproochli/cache-import.ts`
- Stateless Menu generation provider:
  `projects/fireux/sproochli/server/api/tools/menu/index.post.ts`,
  `projects/fireux/sproochli/server/utils/sproochliMenuProviderAuth.ts`, and
  `packages/extensions/fireux-sproochli/src/runtime/server/menu/provider-client.ts`
- Misebox server-only Rules and migration:
  `scripts/firebase/sproochli/` and
  the retired operational artifact in Git history
- Executable contract: the retired operational artifact in Git history

Reviewed-copy persistence and its reviewer UI remain `to-confirm`.
Translation memory is not that approval workflow. Their eventual
implementation must extend this authority rather than add a third translation
seam or expose direct browser writes.
