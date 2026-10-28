# Ignition delivery-path audit

Reviewed: 2026-10-28
Source baseline: `cf2413355`, including the current shared checkout
Role: dated source audit; not live acceptance or implementation authority

## Outcome

The reusable method, intake, App-record commands and a real branded App exist.
They do not form an executed brief-to-preview pipeline. The first useful proof
is an assisted delivery with explicit manual handoffs, followed separately by
independent industry-SaaS and fresh-generation acceptance.

The [single priority list](../roadmaps/fireux-priorities.md) owns sequencing.
Inherit [AGENTS.md](../../AGENTS.md), [global context](../ai/gpt-context.md),
the [Ignite context](../../packages/extensions/fireux-ignite/docs/ai/ignite-context.md)
and [App intake context](../../projects/fireux/fireux-app/docs/ai/ignition-intake-context.md).

## Traced paths

| Stage | Current owner and evidence | What remains manual or unproved |
| --- | --- | --- |
| Industry idea | [Ignition page](../../projects/fireux/fireux-app/app/pages/ignite.vue) prepares a local brief and email draft | No persisted industry request, model execution, source assembly or deployment follows this action |
| Branded-App request | [Intake endpoint](../../projects/fireux/fireux-app/server/api/conversations/index.post.ts) validates and stores an App-owned Conversation and initial message | This is a separate offer; it is not the industry's brief persistence endpoint |
| Delivery tracking | [Queue](../../projects/fireux/fireux-app/app/composables/useIgnitionQueue.ts) and [request update](../../projects/fireux/fireux-app/server/api/internal/control/ignition-requests/[requestId].patch.ts) change stages/checklist fields | A launched checkbox does not verify a host or execute a build; no destination App/source/preview association is established by these updates |
| FireUX Project App creation | [Command](../../packages/ecosystem/fireux-fireux/src/runtime/project/server/apps/create.ts) saves an inactive App, initial admin membership and canonical references | It is restricted to the configured FireUX Ecosystem and validates Project ownership; it neither writes source files nor provisions infrastructure |
| Configured-App initialization | [Developer endpoint](../../packages/core/fireux-core/src/runtime/server/api/internal/app/initialize.post.ts) delegates to the [Core initializer](../../packages/core/fireux-core/src/runtime/app/server/initialization/initialize.ts) using the running App's database/configuration | This initializes the configured runtime identity; it does not assemble or deploy the App. Its authenticated authority is distinct from public intake |
| Source assembly | [Bike Tours brief/assembly](../../projects/slap/interlaken-bike-tours/app/ignition/brief.ts), [Nuxt configuration](../../projects/slap/interlaken-bike-tours/nuxt.config.ts) and Core AppShell form a real existing consumer | Existing authored source does not prove creation from a fresh brief. The reusable Ignite package owns contracts/reconciliation, not a generation executor |
| Local result | [Enquiry](../../projects/slap/interlaken-bike-tours/app/components/Landing/Enquiry.vue) prepares WhatsApp/email drafts from tour choices | Current rendered journey and recovery require a fresh check; sending, reservations, payments and an operator Workspace are outside its brief |
| Hosted preview | [Bike Tours Hosting configuration](../../projects/slap/interlaken-bike-tours/firebase.json) names a prototype site/function and noindex header; [SEO tests](../../projects/slap/interlaken-bike-tours/tests/seo.test.mjs) define rendered checks | Configuration and historical evidence are not current hosted verification. Package scripts provide build/generate but no complete release command |

## Concrete gaps and the smallest response

### Shared creation contract

Use one assisted path before adding automation. The requester enters through the
FireUX App or asks Codex; an authorized operator reviews the same business brief
and uses the same source, initialization and release owners. Intake channels may
differ; creation authority and mechanics do not.

| Step | Input → output | Owner and recovery |
| --- | --- | --- |
| Scope | Idea → reviewed `IgnitionBrief`, bounded acceptance and unresolved decisions | Requester/operator; keep industry enquiry separate from priced branded-App terms |
| Assemble | Brief → `IgnitionAssembly`, App source, declared identity/Ecosystem and preview policy | Actual App plus existing packages; inspect current files before repeating an interrupted edit |
| Initialize | Configured runtime identity → canonical App and membership | Core configured-App initializer; authenticated developer authority, exact database/config, existing conflict/retry checks |
| Verify | Source and configured App → check results and observed customer/operator journey | Owning App/domain checks; retained evidence distinguishes source, local behaviour and hosting |
| Preview/release | Verified source → exact artifact and reviewed hosting target | App release owner; no upload or Rules change follows from a request stage or checklist |

The handoff records the brief, assembly, source directory, App/Ecosystem,
operator, preview target and evidence together. These are delivery facts, not a
second Entity registry or a new universal execution engine. Existing request
tracking currently lacks this complete association and does not execute the
steps. The two entrances therefore remain **unproved as one creation path**;
the contract above is the implementation boundary, not a completion claim.

### Selected product proof

The user selected **Misebox Collection at Restaurant Bären** after this audit's
initial Bike Tours comparison. Use the existing Main App, Kitchen, catalogue and
order commands, preserving prices and hours. Do not create another App or
reinitialize an already configured App to manufacture a creation result.
Misebox's App-owned release commands are the relevant candidate owner. The Bike
Tours references below remain useful source evidence, not the selected pilot.

The bounded journey is guest basket/submission and receipt, then Kitchen
acceptance → preparation → ready → completed. A closed service must remain
closed; an existing labelled submitted test order can prove operator transitions
but cannot substitute for a fresh guest submission. Payment, Delivery, pre-order
and wider industry generation are outside this pilot.

### Remaining source gaps

1. **Intake-to-delivery handoff.** Keep industry enquiry and priced branded-App
   requests distinct. For the first assisted run, record the operator-reviewed
   brief, source directory, configured App/Ecosystem and intended preview
   together. Do not add a universal pipeline or silently submit a different offer.
2. **Correct creation owner.** Bike Tours belongs to Slap. The FireUX-only
   Project App command cannot create that record. Use its existing configured-App
   initialization boundary when needed, inspecting any existing record first.
   Do not widen the FireUX command or create a duplicate App for this proof.
3. **Release execution.** [FireUX's manifest](../../projects/fireux/fireux-app/package.json)
   still names absent root helpers for preparation, preflight, deployment and
   environment checks. Bike Tours also needs an explicit reproducible release
   path before this proof can claim hosted delivery. The nearest working sibling
   is [Misebox's App-owned release owner](../../projects/misebox/misebox-app/release/README.md).
   Reuse proved mechanisms where suitable; preserve each App's own project,
   site, function, origin, database and release policy.
4. **Evidence and recovery.** Reopening a lost response must not imply creating
   another App or deploying blindly. Record which manual step completed and
   inspect its actual result before retrying. Existing App commands contain
   their own repeat/conflict checks; these do not make the whole delivery
   resumable automatically.
5. **Proof boundaries.** Bike Tours can prove assisted branded delivery and its
   enquiry journey. It cannot prove private booking operations or a generated
   industry SaaS. Preserve the later external dog/cat sequence and its separate
   scope decisions. Keep the proposed neutral business engine parked.

## Bounded first acceptance

- Reviewed brief, provenance, source location, intended owner and preview target.
- Actual FireUX configuration, layers, shell, attribution and App identity.
- Ride comparison/detail and correct enquiry drafts, with no message sent by
  the verification itself and no claim of stored booking or payment.
- Current build and rendered preview checks: status, primary content, missing
  routes, canonical identity, robots/sitemap and PWA identity. Keep noindex.
- Explicit manual steps, errors and recovery results; distinguish an existing
  prototype from a newly assembled App and local output from hosted evidence.
- Any private operational pilot separately verifies its exact access policy;
  the [accepted development Rules](../ai/firestore-mutations-context.md#explicit-open-development-rules)
  do not establish production privacy.

Infrastructure changes, external messages, live initialization and deployment
remain concrete separately authorized actions. This audit performed none.

## Verification and limits

This review inspected current routes, handlers, commands, package manifests,
App configuration and the nearest release sibling. Local documentation links
and diff whitespace were checked. It did not execute request submission,
initialize records, build or deploy Apps, inspect deployed Rules or certify a
hosted journey. The source-owned checks remain with their owners: Ignite's
`src/test`, Core's App initialization/context tests, FireUX's
`app/tests/project-relationship-authority.test.mjs`, Bike Tours' rendered SEO
suite and Misebox's release tests. Run the checks appropriate to the eventual
changed contract; their presence alone is not passing evidence.
