# FireUX App Ignition intake context

Updated: 2026-10-12
Ref: eddc8186c
Role: living context
Scope: FireUX App Ignition requests and private delivery tracking

## Purpose and inheritance

Inherit [AGENTS.md](../../../../../AGENTS.md) and [global context](../../../../../docs/ai/gpt-context.md). This context owns the App-specific request and delivery workflow. The reusable build process belongs to [fireux-ignite](../../../../../packages/extensions/fireux-ignite/docs/ai/ignite-context.md).

## Scope, ownership and authority

FireUX App owns its public intake form, contact and branding/page choices, originating product surface, input parsing, Conversation transport, private administrator queue and delivery checklist. These are concrete App policies rather than a required brief or page taxonomy for every generated SaaS.

An Ignition request is an App-owned Conversation with `kind: 'ignition'`. It is not an App, Project capability, assembly record or parallel App collection. Accepted/in-progress/launched request stages describe this delivery workflow; do not infer generated source, verified app behaviour or independent Ignition acceptance merely from a status or checked box. The reusable package neither grants request administration nor owns credentials, database transport or deployment.

FireUX App owns its Misebox reference case and the presentation consuming `fireux-ignite`. Reference source pointers and reviewed decisions contain no private operator/customer records. Keep the implementation-independent business brief separate from the observed assembly. An independent proposal and completed sibling journey remain separate evidence.

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
