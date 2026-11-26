# Handover Alpha 10 — Minimum viable App pipeline for New

The authorized slice is implemented and verified in `fireuxlabs/fireux-mono` at `/private/tmp/fireux-app-architecture-reset`, branch `codex/app-architecture-reset`, HEAD `03e4152b9`. The implementation and documentation edits are local and unstaged. GitHub main contains this handoff only. Alpha 9's configuration audit still applies. No legacy configuration returned.

## Implemented

- `packages/core/fireux-core/src/server/api/app.get.ts` adds public `GET /api/app`. The server validates its configured kebab-case App ID and uses the existing Firebase target and exact `apps/{appId}` reader. Caller selectors have no effect. Missing or invalid deployment identity returns 503. The record must be active and pass the explicit public projection. Successful responses use `Cache-Control: no-store`.
- `packages/core/fireux-core/src/server/app/detail/read.ts`, `src/server/app/read-app-document.ts` and `src/shared/app/app.model.ts` under Core enforce membership by role and deployment scope. Configured scope must match stored membership. An empty scope can match only the exact configured active, valid standalone record with the field absent. Null and empty stored values are invalid. This uses the trusted ID and target plus record validation. It adds no second deployment flag. Peer routes and membership guards retain their existing scope requirements.
- Core's `src/app/components/App/Detail.vue` owns one keyed SSR fetch. Blank and Misebox `app/pages/index.vue` render the heading and existing card from that result. Ecosystem discovery renders when the acquired App has membership. Misebox's `app/dev/AppJsonInspection.vue` reuses the same payload. Native App configs, Firebase infrastructure, Auth and protected membership operations were not edited.
- Canon, Core README, development checkpoint and AI handover reflect the implemented path. See `docs/concepts/fireux.md`, `packages/core/fireux-core/README.md` and the two reset handoffs under `docs/handoffs/`.

## Verification

Blank and Misebox Nuxt type checks and production builds passed. Isolated Firestore and Auth emulators verified signed-out SSR, one exact self document read per initial page, configured identity and database, ignored caller selectors, no-store on successful reads, a fresh name change, standalone with and without membership, closed failure states and scoped peers. Private fields were absent from API and SSR. Chrome at 390 px and 1440 px verified SSR/hydration agreement and zero browser acquisition requests for Blank, Misebox and standalone Blank. Misebox development Copy Debug JSON still works. Protected User/AppUser reads, count authorization, provisioning, repeat join and production write guards passed.

Live deployment, a fresh frozen install, Firefox form verification and downstream migration remain open. No live records were inspected or changed. No implementation blocker remains for the agreed local slice.
