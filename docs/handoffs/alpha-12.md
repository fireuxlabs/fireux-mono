# Handover Alpha 12 — Minimum native App configuration

Following Alpha 11, the agreed Blank and Misebox configs are implemented and committed locally as `80dd76dba70cbd85c55817d5df03036dd9330ec2` on `codex/app-architecture-reset` in `/private/tmp/fireux-app-architecture-reset`. The worktree is clean. New remains incumbent. GitHub main receives this handoff only.

## Implementation and ownership

- `projects/fireux/fireux-blank/nuxt.config.ts` and `projects/misebox/misebox-app/nuxt.config.ts` use the approved native shape. Both explicitly extend Core, register Nuxt UI, load their stylesheet and declare App ID and private deployment scope. Misebox alone declares the browser Auth runtime keys.
- The two App-local `env.defaults` files carry the existing expected demo project IDs. Misebox's file also carries the existing public Firebase Web SDK registration. The files contain no Admin credentials, database targets, emulator hosts or live-read opt-ins. Project and database routing remains private. An Auth emulator URL is supplied only for a matching demo run.
- Native Nuxt dotenv flags in both App `package.json` files load defaults and then an optional untracked `.env`. The process environment takes precedence. Preview adds the optional file only when present so Nuxt avoids a missing-file diagnostic. FireUX Launcher already invokes these App dev commands, so its implementation remains unchanged. An independently started Nitro server needs values from its deployment environment.
- Core runtime declarations and guards remain in place. Canon, Core README and the development checkpoint describe the ownership and environment requirements.

## Verification

Both Apps resolved native Nuxt config and verified environment precedence. Type checking and production builds passed. Launcher command discovery, the exact launcher App dev commands and both preview commands loaded the checked-in defaults with no local `.env`.

Isolated Firestore and Auth emulator checks passed for configured identity, signed-out SSR, one exact self read, shared heading and Detail, standalone with and without membership, bounded peers, private projection and protected User/AppUser operations. Headless Chrome verified hydration at 390 and 1440 px without duplicate acquisition. Misebox completed the Google-provider popup using a disposable Auth emulator account, retained the UID on refresh and cleared it on sign-out. Production builds rejected local live-read opt-in and development write routes.

No real Google account, live Firestore data, deployment or clean frozen installation was exercised in this slice. A hosted Nitro process still needs its explicit bindings. No blocker remains for the verified local workflow.
