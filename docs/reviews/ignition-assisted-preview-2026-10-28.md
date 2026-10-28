# Assisted Ignition pipeline proof

Reviewed: 2026-10-28
Scope: one source-workspace Menu starting App
Role: dated local evidence; not general generation or release certification

## Result

The FireUX App and Codex now use one preparation function to produce a working
starting App from the same reviewed input. Both artifacts and all seven
materialized source files matched. The website artifact also resumed the
existing output through the CLI without overwriting it or creating another App.

```text
FireUX form ─┐
             ├─ shared preparation → source + artwork reference
Codex CLI ───┘                       → operator materialization/install/start
                                     → native sign-in and Core initialization
                                     → working, reloaded Menu preview
```

The proof target is `projects/fireux/ignition-menu-demo`, running locally on
port 3048. It is a new, clearly labelled test App in the existing FireUX
Ecosystem/database, not a duplicate Misebox App. Existing fictional Kitchen
Menu data stays in its owning source fixtures; no Kitchen, Menu, Order or
payment fixtures were seeded into Firestore.

## Actual execution

- The `/ignite-preview` form prepared source through its thin Nitro adapter.
  Codex prepared the identical input through the App-owned CLI. The shared
  recipe supplies native Nuxt configuration/layers, Core AppShell, App metadata,
  noindex preview SEO, and the existing Kitchen catalogue/demo manifest.
- The materializer wrote the source and copied neutral starter artwork. Native
  Nuxt uses the existing approved FireUX development environment via `--dotenv`;
  no credentials are copied into the artifact. Full workspace installation
  restored the dependency links after a filtered install exposed an incomplete
  linking boundary. Lifecycle scripts were disabled during installation.
- Normal Google sign-in completed. Core's existing Environment Check reported
  required configuration 10/10 and artwork 8/8. Its normal Initialize App action
  created the canonical App and initial membership and ran existing media sync.
  No raw Firestore writer or provider-provisioning command was introduced.
- The authenticated Admin view displayed the reviewed context and exactly one
  AppUser/admin. The App's public endpoint returned the exact generated id/name
  and omitted its private context. The Menu rendered and survived reload after
  initialization. Its reused section chooser navigated to Drinks, and the
  rendered head declared the correct loopback canonical URL, noindex policy
  and native App manifest.
- Invalid path-like input produced a clear website error and removed stale
  output. Corrected input prepared successfully through the same entrance.
  Exact source/artwork retries resumed; changed source was preserved and stale
  downloaded source was rejected. Failed first materialization removed only its
  own newly created output.

## Checks

- Five source-preparation/materialization tests passed, including generated Vue
  string safety, stale input, retry, operator edits and first-write failure.
- Twenty-three existing Core initialization/context/scope tests passed. These
  supply controlled retry and context-preservation evidence; the live proof
  performed one initialization, not a second initialization disguised as proof.
- Host and generated App typechecks passed. Targeted lint and IDE configuration
  checks passed; generated IDE tasks include the preview App.
- The generated App's native production build passed. Its development server
  was restored afterward. No deployment occurred.

## Ownership and limits

The [recipe](../../projects/fireux/fireux-app/shared/ignition-preview.ts),
[operator CLI](../../projects/fireux/fireux-app/ignition/prepare.mjs) and
[operator instructions](../../projects/fireux/fireux-app/ignition/README.md)
belong to the FireUX App's concrete supported case. Core still owns configuration,
Auth, initialization, relationships and media commands. Kitchen owns Menu data
and rendering. No universal generator, job runner, template registry or new
custom transport layer was added.

The manual steps are real: materialize, install, start, sign in, inspect the
target, initialize and verify. This proves an assisted, curated source recipe
inside the existing workspace. It does not interpret arbitrary ideas, create
an independent external consumer, automate the priced request queue, transfer
customer ownership, deploy hosting or certify production data privacy.
Neutral artwork remains placeholder content. Mobile interaction was not proved.
The existing Admin page briefly rendered its server empty state before account
hydration settled; its final data/context were correct. Broader Dashboard
hydration behaviour is not certified by this pipeline proof.

The selected Misebox Collection product remains the separate release track.
Grooming, wider libraries and Ecosystem expansion remain parked.
