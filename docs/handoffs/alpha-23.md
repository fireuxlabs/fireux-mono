# Alpha 23 Codex — Package export cleanup and Misebox guard

For FireUX — Architecture. The clean durable sibling worktree `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-app-architecture-reset` matched Alpha 22 at `0c1738d259e8b0a596f82dcd610fc50976cb1914`. It is clean on `codex/app-architecture-reset` after two local commits:

- `ebb3b3a96e63a3980a0a95d2a316cf070b725615` removed Core's `./package.json` export and its redundant import/map entry in `projects/fireux/fireux-app/app/utils/package-library.ts`. A focused before/after comparison using the actual source and manifests found identical rows, including Core's name and absent optional description. The existing package page route predicate still accepts Core. Updated the Core README, FireUX canon and development checkpoint.
- `6a3c6a0123c77ea3c3f2760479a17f2f57afd73d` changed only the profile submit guard at `projects/misebox/misebox-app/app/components/MiseboxAuth.client.vue:212` to check `canProvision.value`.

Core keeps five entries: `./layer`, `./app`, `./user-consent`, `./app/detail-card`, and `./server/app/read-app-document`. Both the Docs card migration and its export removal were deferred. The actual platform host fails Nuxt config resolution at `fireux-ecosystem/config`. Its historical config chain also references retired Core config exports. It was not possible to verify the actual Docs host's component result within scope. The manifest row was independently verifiable without that host build. The packed file allowlist, dependencies and metadata are unchanged.

## Verification

- Packed Core contains 36 files. All five retained entry targets resolve, Nuxt Kit loads the packed layer, and Node rejects the removed metadata specifier. The physical manifest still ships.
- Frozen pnpm install, Nuxt types, type checks, and production builds passed in Blank, Misebox and Holzworm. Each generated six Core components and nine typed Core API handlers. Browser output inspection found no Admin or server connection markers.
- All three local previews passed signed-out SSR, hydration without a duplicate browser self fetch, configured App acquisition, public field filtering, bounded peer pagination, Ecosystem reads, signed-out guards, and production rejection of development writes.
- The focused submit check reproduced the old guard issue and covered false eligibility, missing consent, success and cancellation before sending or applying a response. Misebox dev passed Google-provider emulator sign-in, refresh restoration, sign-out, both consent checkboxes, provision and explicit join in the actual form. Emulator readback confirmed handle reservation, private versioned consent and separate ordinary membership. API checks covered repeat join and role-gated counts. The corrected Misebox passed a fresh type check, production build and preview.
- Fixture work was confined to disposable loopback emulators and those processes were stopped. No live data, merge or deployment. The only scope decision was to defer the unverified Docs consumer as directed. This mailbox commit is separate from both local commits.

Next discussion: internal organization of `fireux-core/server/`. Reusable identity capabilities and historical consumer migrations remain separate.