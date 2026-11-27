# Handover Alpha 15 — Blank verification and Holzworm pilot

The two authorized slices are complete on local `codex/app-architecture-reset` in `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-app-architecture-reset`. The worktree is clean. GitHub main receives only this handoff.

- `f5b0fa14e` fixes Blank's independent pnpm policy. Its workspace did not inherit the root allowlist. The locked esbuild and vue-demi versions may prepare their platform binary and Vue 3 adapter. The protobufjs postinstall only checks version scheme and warns, so the locked version is explicitly disallowed. No package versions changed. Standard frozen install, dev, type check, build, preview, and emulator SSR passed.
- `02752add05f2ff4887b097817b03119373cd5d0c` migrates Holzworm to native `defineNuxtConfig`, explicit Core and Nuxt UI, with its own native shell and error page. The old public product literature was retained in the App README. Its 20-item catalogue, photos, theme, landing route, navigation, and informational enquiry remain App-owned. The landing layout reads `/api/app` once through Nuxt SSR for the navigation name and document title. If self is unavailable, a generic home label keeps the catalogue accessible.
- All three Apps use the same explicit config shape. Blank uses `fireux-blank` and private `fireux` scope. Misebox uses `misebox-app` and private `misebox` scope and alone declares browser Auth runtime keys. Holzworm uses `holzworm` and private `fireux` scope, and consumes no browser Auth. Its App-local `env.defaults` names the expected demo project. Its deployment supplies `NUXT_FIREBASE_DATABASE_ID=holzworm`. Role stays in the App document. The workspace lockfile change is confined to Holzworm's importer.
- Holzworm passed frozen install, native preparation, type check, and production build and preview. The isolated named database fixture beat a conflicting default database fixture. Tests counted one self document read, showed no duplicate browser acquisition, confirmed projection privacy and bounded peer paths, and exercised an unavailable App and an unknown page. Chrome at 390 px and 1440 px verified images, catalogue filters, native product details and the enquiry navigation. The existing site gives enquiry guidance and has no submission form. No real enquiries were sent.
- Legacy source supports the historical identifiers and intended standalone-with-membership configuration. Live document identity, membership, database binding and legacy release integration remain unverified. No live data or deployment was touched. The pilot needed no new shared Core capability or config abstraction.

## Execution checklist

- [x] Verify durable worktree, reset branch, checkpoint, and applicable instructions.
- [x] Review the three pinned lifecycle scripts. Fix Blank, verify standard commands and commit.
- [x] Verify Holzworm's historical bindings. Migrate only the native shell/assembly and self-acquisition. Preserve product behavior.
- [x] Verify frozen install, build, scoped disposable fixtures and both browser viewports. Document evidence and commit separately.
- [x] Publish the numbered return on GitHub main only. Stop for review of the three Apps before more Core work.

Owning files: `projects/fireux/fireux-blank/pnpm-workspace.yaml`, `projects/fireux/holzworm/README.md`, the three App `nuxt.config.ts` files, `packages/core/fireux-core/README.md`, and `docs/handoffs/2026-11-26-native-core-checkpoint.md`.
