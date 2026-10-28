# Bären Collection pilot checkpoint

Reviewed: 2026-10-28
Source baseline: `cf2413355` plus the preserved shared checkout
Role: dated local evidence; not shipping authorization

## Customer and operator pipeline

A fresh customer journey completed through the existing Misebox Main App at
`/kitchens/baeren-ringgenberg/menu.collection`, using Restaurant Bären's saved
Kitchen and catalogue. One Pizza Margherita retained its existing CHF 13 price.
The saved service window was open; no hours, prices or service policy changed.

Before submission, reload restored the basket, customer name and dummy contact
number. The order was submitted once through the normal controls as **#21**, with
customer name **TEST — pipeline verification — do not prepare**. Its receipt
showed one Pizza Margherita, CHF 13, and the correct venue/collection details.

The signed-in Kitchen board progressed that exact order through acceptance,
Preparing, Ready and Completed. The customer receipt showed each corresponding
state. Reload on both sides retained Completed and the same order number and
price; the board contained one #21 ticket, without a duplicate. The receipt
screenshot is `/private/tmp/baeren-collection-order21-receipt.png`.

Earlier evidence remains bounded: test order #18 proved the operator half, and
an earlier closed-service check kept submission disabled until the saved window.
The new #21 journey closes the previously unproved fresh submission/receipt gap.
This is a software pipeline test, not a paid order or proof of physical service.

## Concrete repairs

- The existing Kitchen ServiceMenu owner now supplies its missing native search
  description from the existing venue projection; no new reader or page shell.
- Dish removal and the Menu Section's Dish updater now pass their explicit
  destination sources into the existing command guard. Obsolete intent stops
  during credential waits; dispatched command results retain their saved truth.
- Stale Dish UI fixtures now use the current explicit readers and Menu context.
  They no longer pretend that removed Workspace composables are active owners.
- Native Nuxt typing is explicit at the existing generic route boundaries,
  POST adapter and PWA plugin return. These annotations preserve runtime behavior.

## Local production policy candidate

The first production preflight exposed a stale direct-browser Dish creation
contract, including the retired `is_deal` schema. Source inspection found no
active browser Firestore writers in Kitchen or the Misebox App/Ecosystem lanes:
Kitchen mutations use named trusted server commands. The old candidate also
allowed direct Recipe, Prep, Station, sourcing, Waste and Menu writes.

Those parallel Kitchen write permissions and copied schemas are removed from
**the local production candidate**. Existing membership-bound reads, nested Menu
reads and six-App authority remain. All direct Kitchen create/update/delete
requests are denied, including root deletion. Trusted Admin commands retain
transaction-time authority and validation independently of Security Rules.

The revised allow/deny tests cover legitimate reads, direct-command bypass,
revocation, overlapping/stale/deleted/malformed grants and the six-App access
budget. No deployed Rules or accepted development template changed.

## Verification

- 140 focused Collection, command, UI intent and release-tool tests passed.
- 35 native PWA and Menu service/route checks passed.
- 24 production-policy tests passed against the exact local candidate, isolated
  to `demo-misebox-production-rules` / `misebox` on a local Firestore emulator.
  Their fixtures never targeted the real database.
- Misebox and FireUX generated App typing passed after the native compatibility repairs.
- The native Firebase release bundle was built and its isolated locked production
  dependencies prepared with lifecycle scripts disabled.
- Targeted lint, formatting and whitespace checks cover the changed source.

The broader policy remains a prototype requiring review before rollout. The
unchanged authored Blog/Product policy bounds list/map containers without full
per-element validation. These checks do not certify Storage Rules, IAM, every
App/customer scenario, mobile interaction, or physical venue operations.

## Exact live target readback

Firebase confirms `misebox-78f9c` / named database `misebox` is **STANDARD**, native
Firestore, location `eur3`. Its live Rules exactly matched the reviewed
**development-open** template, digest
`b33ffb316608adf71cbf9facc0b3cf62f4d1b84e13f833e89753e282e01c7b80`.
That policy permits public direct read/write and is not production privacy.

Hosting readback found the existing live channel on site `misebox-78f9c`, version
`e064da9292d34878`, released 2026-09-18. It routes to Cloud Run service
`miseboxapp` in `europe-west6`, consistent with the Main App's Firebase Gen 2
function target. Nothing was uploaded or changed.

| Candidate target | Value |
| --- | --- |
| App / Ecosystem | `misebox-app` / `misebox` |
| Source | `projects/misebox/misebox-app` |
| Firebase project / database | `misebox-78f9c` / `misebox` |
| Hosting site | `misebox-78f9c` |
| Function / codebase / runtime | `miseboxApp` / `misebox-ssr` / Node 22 |

Compiled payload SHA-256: `6ee24ab094e28aba1a9113b4fc5b6772f8c77af6a410c6076d560a1b813fd217` across 2234 files. This covers the server entry/chunks, public assets, manifest and isolated lockfile; the native marker separately retains the environment digest. Detailed local evidence is `/private/tmp/misebox-pilot-candidate-proof.json`.

Prepared output is ignored `.output`; the App's [release owner](../../projects/misebox/misebox-app/release/README.md)
retains local preflight and exact live-policy matching before upload. The source
comes from the shared, uncommitted checkout, not a clean reviewed release commit.
Module-loader fallbacks remain build warnings rather than proof of a new runtime
failure. No emulator was introduced into the App's customer/backend pipeline.

Restoration exposed Nuxt VueFire's native development emulator discovery:
starting Nuxt before stopping the Rules test service temporarily attached the
preview to local empty data. No retry/submission was triggered there. The test
service was stopped before restoring the real-data preview; the operator
procedure now records that ordering. The production build log and compiled
payload contained no binding to the test emulator's `127.0.0.1:8787` address.

## Remaining release gates

1. Review/checkpoint the exact source candidate, preserving unrelated shared
   cleanup. No Git save, stage or push was performed by this continuation.
2. Approve the production-access rollout separately: the live development-open
   policy cannot pass the production upload gate. Retain backups, check existing
   operator prerequisites and verify exact live readback after any authorized
   rollout. No Rules or application deployment is authorized by this proof.
3. Confirm Bären's intended operating hours and staff acceptance before using
   this as an operational customer service. The existing venue-hours questions
   remain with the owner; the test did not change or settle them.

The [bounded Ignition proof](ignition-assisted-preview-2026-10-28.md) separately
records its shared preparation and assisted startup path. This existing Misebox
pilot does not claim Ignition generated Misebox or automate commercial intake.
