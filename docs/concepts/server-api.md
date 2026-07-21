Server API spine map

<!-- Concurrent edit — 2026-07-21 12:37 CEST — Cleanbox-to-Werkbox migration: distinguish the current product from its legacy physical publication scope. -->
<!-- Concurrent edit — 2026-07-21 12:53 CEST — Public Jobs projection: map bounded category- and tenant-scoped Job browse/detail APIs. -->

<!-- Concurrent edit — 2026-07-19 17:52 CEST — Directory Publication Scaffold: map the default-off receiver and deployment gate. -->
<!-- Concurrent edit — 2026-07-19 22:15 CEST — Directory Publication Rules Pass: map dedicated databases, machine scope, and no-write remediation. -->
<!-- Concurrent edit — 2026-07-20 12:27 CEST — Directory Live Pass: record verified support infrastructure and remediation boundary. -->
<!-- Concurrent edit — 2026-07-20 13:19 CEST — Account consent follow-up: map the legal version and server-only public identity creation. -->
<!-- Concurrent edit — 2026-07-20 13:12 CEST — Driver authority: map trusted Kitchen grants and minimal dispatch projection. -->
<!-- Concurrent edit — 2026-07-20 13:42 CEST — Public profile projection: map domain-owned bounded profile/User joins. -->
<!-- Concurrent edit — 2026-07-20 16:04 CEST — Repo Efficiency Pass 1 of 6: map public App DTO, shell status, and authenticated dev-data boundaries. -->
<!-- Concurrent edit — 2026-07-20 20:12 CEST — Repo Efficiency Pass 2 of 6: map owner-only raw profiles and SSR detail transport. -->
<!-- Concurrent edit — 2026-07-20 22:10 CEST — Place-root authority pass: map trusted sparse Place mutation and fail-closed Kitchen projection. -->
<!-- Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: describe invalid Kitchen support joins explicitly. -->

Updated: 2026-07-21
Ref: 5b6cfcc8e
Role: map, not canon

Purpose:
Map server API boundaries and avoid duplicate provider/consumer jobs.

Vertical links:

- Parent: nuxt4.md
- Child: tool-provider.md
- Child: family-menu.md
- Child: create.md

Horizontal links:

- firestore-entity.md
- composables.md

Current server surfaces:

- Package APIs live under `src/runtime/server/api`.
- App APIs live under `server/api`.
- Server helpers live under `src/runtime/server/utils` or app `server/utils`.
- Server domain stacks may live directly under `src/runtime/server/<domain>`
  when the domain already has a named stack such as model/composables/routes.

Server spine:

- `server/api/**` follows the HTTP route and method surface. Registered module
  handlers should still live under `server/api` when they are request handlers.
- `server/utils/**` holds reusable server-only primitives grouped by family and
  workflow, not as a flat package drawer.
- `server/<domain>/**` extends an existing domain stack into server-only work.
  Menu and Place are current examples because each domain already has named
  models, composables, routes, and server workflows. Menu owns
  `server/menu/manifest`, `server/menu/payload`, `server/menu/source`, and
  `server/menu/ordering`; Place owns its bounded mutation verifier under
  `server/place`.
- Core utility buckets may be primitive buckets such as `auth`, `http`, `ids`,
  `records`, `uploads`, and `slug`.
- Domain server buckets should name the visible family and server workflow,
  for example `menu/ai`, `menu/draft`, `menu/source`, `menu/manifest`,
  `menu/payload`, `menu/ordering`, and `menu/ownership`.
- Use top-level provider folders such as `stripe` only for provider/runtime
  constants that are not a request handler and are not reusable helper logic.
- Do not create a top-level domain folder only because a route is complicated;
  prefer `server/utils` until the domain has a named stack to extend.

Boundary rule:

- Provider tools provide tool behavior.
- Consumer apps store their own consumer data unless the provider is dogfooding its own tool.
- `/api/internal/user/account` verifies a Firebase bearer identity and creates
  the caller's `UserPrivate` account record in the identity database only when
  absent. Email comes only from the decoded token; anonymous identities are
  rejected; signup consent records the published `2025-11-29` Terms acceptance
  and Privacy acknowledgement version, while
  ordinary legacy sign-in provisions honest unrecorded terms only when its
  public `User` already exists. A new identity requires current consent before
  private-first provisioning. The endpoint is idempotent and never overwrites
  existing terms evidence. Client User creation is denied; the authenticated
  handle endpoint validates consent, owns the handle reservation, and creates
  the canonical public User through the Admin SDK.
- Kitchens owns `/api/internal/kitchen/driver-access`. It binds the request to
  runtime App/database identity, accepts no client App target, and grants or
  revokes an AppDriver Kitchen link only after persisted App-admin or Kitchen
  operator authority plus target UserApp/AppDriver existence are verified in
  the transaction. `active_kitchen_ids` is derived from bounded normalized
  links and revocation removes the active authorization.
- Drivers consume `/api/internal/driver/dispatches` and
  `/api/internal/driver/dispatch-watch`. The list is an allowlisted beacon with
  no customer, destination, item-line, or payment data; watch writes are
  server-authorized against the current Driver grant. Full Kitchen Order reads
  remain client-accessible only to Kitchen operators.
- Places owns `PATCH /api/places/:placeId`. It accepts an allowlisted sparse
  patch, converts cleared optional values to field deletion, and writes through
  Firebase Admin only after a verified bearer identity proves Place ownership,
  current-App admin access, or operator access to an explicitly linked
  `app_id`/`kitchen_id` whose stored `place_id` matches the target. Kitchen
  `canWrite` is presentation state, not Place authority, and no broad client
  Place write rule is opened.
- Kitchens owns `GET /api/kitchens`. It cursor-pages root Kitchens, joins only
  explicit `place_id` and canonical App-scope references with bounded server
  batches, and emits a sparse public card DTO only for published, non-test rows
  with a slug and an existing linked Place. Raw Kitchen operational data,
  missing values, copied Place snapshots, invalid App support records, and browser N+1
  hydration stay out of the public directory contract.
- Jobs owns `GET /api/public/jobs` and `GET /api/public/jobs/:id`. The index
  cursor-scans bounded root batches without composite-index assumptions, and
  both routes use the same field allowlist. Only open, explicitly public jobs
  whose product-neutral `category_id` is configured by the current runtime are
  emitted; tenant runtimes also require the current App as `source_app_id`.
  Empty category configuration fails closed. Company/Place ids, owner scope,
  creator stamps, and raw linked documents never reach the browser DTO.
- Shared identity writes may publish authenticated, idempotent App events
  through core server endpoints. Event facts do not choose notification
  recipients or delivery channels; those belong to subscribing consumers.
- `/api/public/apps` and `/api/public/apps/:id` are the owning Ecosystem's
  allowlisted App projections; guests never read the canonical App document.
  `/api/public/app/status` exposes only whether the current runtime App exists,
  so the shell can distinguish missing initialization from a failed read.
  FireUX
  `/api/public/directory` is the shared platform App/Ecosystem projection used
  by landing and index surfaces.
- Raw developer inspection APIs are development-build-only and require a
  verified Firebase bearer identity matching `fireux.developerId`.
  `/api/dev/apps` has a fixed runtime database/collection and bounded result;
  `/api/dev/collection-snapshot` keeps bounded inputs; `/api/dev/images`
  exposes local asset paths only through the same developer boundary.
- Kitchens owns `/api/public/chefs` and `/api/public/drivers`; Jobs owns
  `/api/public/agents` and `/api/public/professionals`. Each index is capped,
  explicitly maps domain fields, and joins a minimal canonical User DTO by the
  shared uid. The raw profile and User collections are not public list APIs.
  Matching `/:id` endpoints use the same allowlists and return a truthful 404
  when either side of the canonical pair is absent or unusable. Raw Agent,
  Chef, and Professional documents are owner-only even for single-document
  reads; public pages use `usePublicProfileDetail` so the projected pair and
  outer HTTP status are resolved during SSR.
- FireUX `/api/internal/control/projects` verifies the Firebase bearer token and
  current FireUX App-admin membership before returning allowlisted private
  Project control-plane rows.
- Directory responses are explicit allowlists. Failed source reads remain HTTP
  errors and never masquerade as empty directories.
- `GET/POST /api/registry` are retired. The mixed registry database is neither
  entity authority nor directory authority.
- The selected directory publication transport is Google-signed OIDC from a
  dedicated owner worker to a private FireUX ingestion route. The receiver must
  verify signature, issuer, fixed audience, stable service-account subject,
  verified email, enabled source authorization, exact source database, and
  allowlisted entity kind/id. Firebase user bearer tokens and shared webhook
  secrets are not publisher authority.
- FireUX has a private publication route that is 404 by default. Its fixed OIDC
  audience and database id come only from private environment configuration;
  request Host is never publisher authority. The database has no fallback and
  must be exactly `platform-directory`.
- Core has a reusable Firestore document-written factory with a durable owner
  outbox/dispatcher. Canonical changes are watched in the canonical database,
  while delivery state is written only to that Firebase project's dedicated
  `directory-outbox` database. The factory requires a dedicated publisher
  service account. It is deliberately unregistered: no current module or app
  `firebase.json` deploys it, and public APIs still read legacy central rows.
- `directory-outbox` and FireUX `platform-directory` are server-only support
  databases with deny-all Firestore client rules. Exact, separate rules configs
  live under `scripts/firebase/directory-publication`; normal app deploy configs
  must not contain a Firestore stanza. Six Standard, delete-protected databases
  are provisioned across FireUX, Bringli, Werkbox's legacy `cleanbox-f15bc`
  scope, Granite, and Misebox. Slap's `directory-outbox` remains pending because
  billing is disabled.
- Ready publishers and the FireUX receiver have separate service accounts and
  conditional database-resource bindings to a four-permission custom role:
  database get plus entity get/create/update, with no list/delete. The current
  public FireUX SSR identity received no receiver authority.
- Source authorization is scoped by a digest of OIDC subject plus canonical
  Firebase project, database, Project, and optional Ecosystem. Reusing one
  service account across a Firebase project therefore does not merge source
  allowlists.
- Before enablement, each owner needs a separate statically exported publisher
  codebase, exact App/Ecosystem allowlists, OIDC source authorization, and
  deployed trigger/transport. Source authorizations are not seeded, publisher
  and receiver code stays dormant, and public reads remain on legacy central
  rows. Slap additionally needs billing and its missing support infrastructure.
- The receiver transaction writes an event receipt and the projection together:
  an existing receipt is a duplicate, a revision at or below the stored tuple is
  stale, a newer active upsert publishes or revives, and a newer retirement
  stores a payload-free tombstone. FireUX curation remains a separate record.
- Publication contract: `models/core/supporting/directory-publication.ts`.
  Safe tools: `scripts/reconcile-platform-directory.mjs` is read-only and
  `scripts/plan-platform-directory-backfill.mjs` only writes a disabled local
  plan. `scripts/plan-platform-directory-remediation.mjs` deterministically
  classifies the 13 locked decisions but has no mutation mode.
  `scripts/remediate-platform-directory.mjs` is a separate explicitly confirmed
  one-time executor. It applied 15 conditional writes across ten database
  batches with a 0600 backup, crash journal, per-batch source revalidation, and
  no document deletion. Post-reconciliation reports zero missing owners and
  zero relationship drift; directory publication/cutover remains disabled.
- The removed `/api/fireux-console` contract used Firebase project ids and
  singular Project links as entity identity; do not recreate it.

Working notes:

- Use endpoint files with clear HTTP suffixes where present, e.g. `.get.ts`, `.post.ts`, `.options.ts`.
- Keep upload/storage endpoints small and explicit.
- Shared server primitives can live in package `server/utils` when used by multiple endpoints.
- Server create endpoints are valid when the create is a transaction that needs
  multipart upload, storage, provider credentials, or admin/server-only work.
  See create.md.
- Avoid parked top-level `server/handlers` folders for API endpoints; route
  registration belongs in config, but the handler file itself should stay near
  the API route it serves.

Open questions:

- Menu upload endpoints are still young and should be simplified around clear input/process/output.
