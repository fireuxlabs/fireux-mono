# FireUX App Ignition intake context

Updated: 2026-10-21
Ref: eddc8186c
Role: living context
Scope: FireUX App Ignition requests and private delivery tracking

## Purpose and inheritance

Inherit [AGENTS.md](../../../../../AGENTS.md) and [global context](../../../../../docs/ai/gpt-context.md). This context owns the App-specific request and delivery workflow. The reusable build process belongs to [fireux-ignite](../../../../../packages/extensions/fireux-ignite/docs/ai/ignite-context.md).

## Scope, ownership and authority

FireUX App owns its public intake form, contact and branding/page choices, originating product surface, input parsing, Conversation transport, private administrator queue and delivery checklist. These are concrete App policies rather than a required brief or page taxonomy for every generated SaaS.

An Ignition request is an App-owned Conversation with `kind: 'ignition'`. It is not an App, Project capability, assembly record or parallel App collection. Accepted/in-progress/launched request stages describe this delivery workflow; do not infer generated source, verified app behaviour or independent Ignition acceptance merely from a status or checked box. The reusable package neither grants request administration nor owns credentials, database transport or deployment.

FireUX App owns its Misebox reference case and the presentation consuming `fireux-ignite`. Reference source pointers and reviewed decisions contain no private operator/customer records. Keep the implementation-independent business brief separate from the observed assembly. An independent proposal and completed sibling journey remain separate evidence.

## Product intent and family

FireUX is an industry SaaS framework for industry founders and the teams building
their software. Shared SaaS foundations and industry libraries compose connected
Apps and Workspaces; Nuxt and Nuxt UI provide the technical and interface foundation.
Its public offering distinguishes source-workspace development, scoped industry
SaaS work and branded App requests. Industry SaaS enquiries use the existing
Your Ecosystem offer and contact path; the App-specific Ignition form retains
its own terms and validation. Ignition is the guided scoping and delivery process;
repeatable assembly from an independent brief remains a separate proving boundary.
Use the statement “[Brand] is a [domain] operating system” to describe the intended
operating scope; it is not evidence of automatic generation or shipped capabilities.

This is the single named family definition for the current Ignition direction:

| Brand | Agreed product statement |
| --- | --- |
| Misebox | Misebox is a kitchen management operating system. |
| Granite | Granite is a property portfolio operating system. |
| BuenoHost | BuenoHost is a property hosting operating system. |
| Bringli | Bringli is a supplier and local distribution operating system. |
| Werkbox | Werkbox is a practical services operating system. |
| External dog brand, unnamed | [Brand] is a dog grooming operating system. |
| External cat brand, unnamed | [Brand] is a cat grooming operating system. |

Sharer and Apps That Slap are outside this Ignition product family. This scope
choice does not remove their packages, Apps or existing ownership. It is not a
runtime registry or a restriction on future industries.

When generation is claimed, prove it through independently assembled external consumers: first the
dog App, then a separate cat App; compare their working domain behaviour before
extracting a shared animal-grooming library into FireUX, and verify both external
consumers after migration. Initial grooming implementation belongs in those
external Apps. Core and neutral Ignition receive industry knowledge as explicit
inputs and must not pre-seed grooming rules. Preserve meaningful dog/cat policies
at their owners. Record manual interventions and distinguish assisted assembly,
repeatable execution and completed product journeys. Misebox remains a separate
product-finishing track and reference source, not a product to rebuild for this proof.

The current public intake offer remains sourced from `app/content/meta/source.ts`;
the shared platform explanation is Core-owned
`packages/core/fireux-core/src/runtime/utils/platform-context.ts`. Neither the
family statements nor an intake status change authorize publication or deployment.

## Current source and boundaries

Paths below are relative to this App:

- `app/pages/get-started.vue` and `app/composables/useIgnitionRequestForm.ts`: public intake and `/api/conversations` submission.
- `server/utils/ignition-request.ts`: input, origin, status and checklist validation and serialization.
- `server/api/conversations/index.post.ts`: owning App intake adapter.
- `server/utils/require-fireux-app-admin.ts` and `server/api/internal/control/ignition-requests*`: private request read/update authority.
- `app/composables/useIgnitionQueue.ts`, `app/components/Ignition/Queue.vue` and `app/pages/workspace/project/ignitions.vue`: delivery presentation.
- `app/ignition/misebox-reference.ts` and `app/pages/workspace/project/ignition-reconciliation.vue`: concrete reference and package consumer.
- `app/ignition/industry-comparisons.ts` and `app/pages/workspace/project/industry-comparison.vue`: App-owned like-for-like reviews for Misebox, proposed grooming, Granite, BuenoHost and FireUX. Architecture vocabulary and projection are package-owned; concrete claims and source references stay App-owned.
- [Conversation model](../../../../../packages/core/fireux-core/src/runtime/models/operations/conversation.model.ts): existing storage contract.

## Refresh and verification

Inspect the form, parser, handlers, administrator authority and real UI together before changing intake or delivery. Verify that source/branding/page choices, privacy acknowledgement and validated origin remain App-owned. Check current consuming App compilation and appropriate parser/handler behaviour; live authenticated intake and delivery verification are separate from a package test. For reconciliation changes, run the package's `src/test/reconciliation.test.mjs`, recheck every reference path and compile the consuming App. Source-reviewed, checks-passed and journey-proved evidence remain separate.

No authority to mutate records, deploy or contact a requester follows from reading this context. Follow current user authorization and existing command boundaries.

## Living maintenance

Update this file when the App's stable intake, authority, storage or consumer boundary changes. Update the package context only when a reusable build rule changes. Do not duplicate the package's lifecycle, retain chat transcripts or turn temporary delivery status into working guidance. Recheck source pointers after ownership migrations.
