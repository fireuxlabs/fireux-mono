# Alpha 20 Codex — Native Core layer relocation verified

For FireUX — Architecture. Alpha 19 matched the clean reset starting point, `02752add05f2ff4887b097817b03119373cd5d0c`. The approved relocation is committed locally on `codex/app-architecture-reset` at `0c1738d259e8b0a596f82dcd610fc50976cb1914`, with a clean durable sibling worktree at `/Users/danielwatson/Developer/FireUX/FireUX-Mono/fireux-app-architecture-reset`. This handoff is a separate GitHub main commit.

Core's package root now contains `nuxt.config.ts`, `app/`, `server/`, and `shared/`. The 34 moved files are byte-identical. The manifest allowlists those four entries and retargets the existing layer, App model, consent, Detail card, and server projection exports. Package metadata export is unchanged. Blank, Misebox, and Holzworm still extend `fireux-core/layer`; no App configuration, runtime code, lockfile, or historical consumer was edited. Updated the FireUX canon, Core README, development checkpoint, and direct App Detail card reference in brand-assets guidance.

## Verified

- Frozen pnpm installation passed in Blank's separate workspace and for the filtered Misebox/Holzworm workspace graph. All three passed Nuxt preparation, type checking, and production builds with installed Nuxt versions (Blank 4.7.0, Misebox and Holzworm 4.6.1).
- The packed Core contains exactly 36 files and all six export targets. Nuxt Kit loaded the unpacked layer by its package export. The shared contract and projection exports imported through Jiti. The installed Nuxt toolchain handles the package's existing source TypeScript exports.
- Each App generated six Core components, the same nine typed API handlers, and Nuxt project references to the relocated directories. No Firebase Admin or server connection code was found in client JS.
- Standard dev and preview commands passed localhost emulator SSR, configured self identity, Ecosystem acquisition, scoped peer detail and pagination, no-store and public projection, and signed-out identity guards. Chrome hydrated each preview without a mismatch or a repeat browser self fetch.
- Misebox dev passed the Google-provider Auth emulator popup, UID restoration on reload, sign-out, protected User provisioning/read, AppUser join/read and repeat join, plus role-gated membership count. All production previews rejected development-only writes. The popup needed the SDK's static Google assets. Auth and database requests used loopback demo projects. The task emulators were stopped after verification.

## Open

No regression was observed in the tested foundation. Live infrastructure and deployment were outside the verification. Existing historical aliases and release tooling still point to retired files. For example, the Core-wiring link in `docs/concepts/runtime-package.md:32` points to the removed `src/config/module/README.md`. The current owner is `packages/core/fireux-core/README.md`. No downstream fixes are included. Next discussion is the internal `server/` structure. No change to it was authorized in this slice.
