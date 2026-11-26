# Handover Alpha 11 — Native App configuration audit for New

Alpha 10 was reviewed and committed on the local reset branch `codex/app-architecture-reset` as `73fb8d89bed2e3a66339459eaa0f0dc0e0201f50`. The commit contains the 12 verified pipeline and documentation files. The worktree is clean. The audit changed no App configuration or data. GitHub main remains the handoff mailbox.

## Recommendation

Use native `defineNuxtConfig`. Native `extends` loads the explicit Core layer and discovers its components and Nitro routes. Native `modules` runs Nuxt UI setup. Native runtime config declares the keys and maps deployment environment overrides. Core's Firebase Admin helper and route checks still own real behavior. Neither behavior needs a configuration builder.

The two current files `projects/fireux/fireux-blank/nuxt.config.ts` and `projects/misebox/misebox-app/nuxt.config.ts` have no authored imports. They select Core and Nuxt UI explicitly, load each App's CSS, declare the running App ID and private Ecosystem scope, and supply a per-App expected emulator project. Misebox alone supplies Firebase browser Auth configuration consumed by `app/components/MiseboxAuth.client.vue`. The expected emulator projects and browser connection values can move to the environment. That changes where the values are supplied and requires provisioning them before switching. Neither current file duplicates Firestore display metadata.

## Configuration chain and removal effects

- `packages/core/fireux-core/package.json` exports `./layer` as `src/nuxt.config.ts`. The layer declares runtime keys only. `firebase.projectId` and `databaseId` are private explicit targets. `emulatorProjectId` is the expected demo target. `liveReads: false` guards opt-in local ADC reads. `developmentDatabase: false` is diagnostic, used by the debug indicator. Preserve the keys and fail-closed defaults. `src/server/utils/firebase-admin.ts` checks them against the SDK's loopback emulator environment or explicit dev live mode. `src/server/utils/require-firebase-user.ts` validates emulator separation and verifies bearer tokens against that Admin app. ADC and emulator host variables belong to infrastructure. Production live Admin reads are outside today's verified path.
- Private `fireux.ecosystemId` is a deployment restriction for self, peer detail, collection, Ecosystem detail, join and count. The stored `ecosystem_id` is authoritative membership. Matching them enforces the restriction. They have distinct owners. Removing scope breaks member deployments and closes peer access. Public `fireux.appId` is an explicit selector read from server runtime config by self and membership operations, and from client config by collection's self-filter. The App document ID is the other end of this lookup, and `role` does not select configuration.
- Each `app/assets/css/main.css` imports Tailwind and Nuxt UI. The UI module supplies integration, component discovery and default supporting modules, including icons, fonts and color mode. Keep the CSS entry for the current styles. The App-owned `app/app.vue` composes `UApp` and `NuxtPage`. Neither App authors `app.config.ts`. That native file is for public UI/runtime presentation settings. It cannot replace private Nitro configuration. Native SSR is on by default and neither App needs `ssr: true` to restate it.
- Manifests own Nuxt, Nuxt UI, Vue, Vue Router and Tailwind. Core owns Firebase Admin and h3 and declares Nuxt, UI and Vue peers. App-level Firebase Admin and h3 are duplicated in manifests with no direct App source import in these two Apps. Treat removal as a separate clean-install and Nitro bundling check. Misebox needs the browser `firebase` SDK and links Core through `workspace:*`. Blank has independent Core link, Vue/TypeScript tooling, lockfile and a local Nuxt 4.7 release-age exception. Its Core link is a build-time dev dependency. Root pnpm policy, overrides and lockfile apply to Misebox, which uses Nuxt 4.6.1. Shared pnpm settings and root `.npmrc` govern dependency resolution and install behavior. They are outside application configuration.
- The App `tsconfig.json` files only reference four Nuxt-generated TypeScript projects. The App manifests own native dev/build/preview commands and loopback development ports. `tools/fireux-launcher/apps.mjs` discovers these commands. Its folder group and heuristic role are tool labels. The launcher starts the App's dev script with inherited environment. Neither launcher nor repository packaging is a source of App identity.

## Historical entry points

- At `f2b55221c7`, `packages/core/fireux-core/src/config/app/fireux.config.ts:47` exported `defineFireuxConfig`. Historical Blank and Misebox imported it. It installed modules, applied visual and runtime defaults, projected identity and feature settings, and wired Firebase, SEO, PWA and Nitro. At `1d6857c572`, sibling `nuxt-overrides.ts:20` exported `withFireuxNuxtConfig`, a custom merge wrapper used by earlier Misebox and other consumers.
- In the reset checkout, `packages/extensions/fireux-app/src/config.ts:38` still defines `defineFireuxApp` for historical consumers such as Baeren and Go QR. It injects modules and layers, including the selected ecosystem package, and projects metadata and feature flags into runtime alongside PWA and deployment setup. `packages/extensions/fireux-ecosystem/src/config.ts:6` defines `defineFireuxEcosystem`, used by older principal Apps such as Bringli and Granite. It rejects roles other than global, appends a host layer, then calls `defineFireuxApp`. Historical Misebox used it at `4cee17626`. Both APIs still have repository consumers and import retired Core paths. Their compatibility is outside this audit.
- For comparison, `packages/ecosystem/fireux-misebox/src/module.ts` is a native capability module with historical composition and Firebase wiring. It is absent from both reset Apps. A reusable ecosystem package supplies opt-in capabilities. The consuming App assembles them. The Firestore Ecosystem document owns Ecosystem facts and selects no packages.

## Proposed files

Blank

```ts
export default defineNuxtConfig({
  extends: ['fireux-core/layer'],
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    fireux: { ecosystemId: 'fireux' },
    public: {
      fireux: { appId: 'fireux-blank' },
    },
  },
})
```

Misebox

```ts
export default defineNuxtConfig({
  extends: ['fireux-core/layer'],
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    fireux: { ecosystemId: 'misebox' },
    public: {
      fireux: { appId: 'misebox-app' },
      firebaseAuth: {
        apiKey: '',
        authDomain: '',
        projectId: '',
        emulatorUrl: '',
      },
    },
  },
})
```

Before adopting either file, supply `NUXT_FIREBASE_PROJECT_ID` and `NUXT_FIREBASE_DATABASE_ID`. For an emulator supply the expected `NUXT_FIREBASE_EMULATOR_PROJECT_ID` separately, currently `demo-fireux-blank` or `demo-misebox`, plus `FIRESTORE_EMULATOR_HOST`. For protected emulator operations supply the matching `FIREBASE_AUTH_EMULATOR_HOST`. Local live reads retain their existing explicit opt-in and ADC requirement.

Misebox requires the existing browser SDK values via `NUXT_PUBLIC_FIREBASE_AUTH_API_KEY`, `NUXT_PUBLIC_FIREBASE_AUTH_AUTH_DOMAIN`, and `NUXT_PUBLIC_FIREBASE_AUTH_PROJECT_ID`. Set `NUXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL` only for a matching demo setup. These public SDK settings are separate from Admin credentials. Without the browser values, the proposed Misebox file loses its current sign-in defaults. Land the environment wiring together with the change. Retain each private scope and App ID for the current member deployments. An Ecosystem-free standalone leaves scope empty under the existing self-read contract.

Both complete proposed files were loaded in temporary directories with the installed Nuxt versions. They resolved the real Core layer, SSR, CSS, UI, runtime shape and fail-closed defaults. The proposed environment relocation did not receive a full browser or deployed runtime rerun. Existing Alpha 10 verification applies to the committed configuration. Outstanding items are environment rollout, dependency deduplication and version alignment if requested, fresh frozen installation, and live deployment verification. No helper or config change has been made.
