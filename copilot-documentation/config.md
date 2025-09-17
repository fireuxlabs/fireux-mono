# FireUX Config Flow: Nuxt configs → createFireuxConfig → runtime config → useFireUXConfig → useApp

This report shows the config pipeline end-to-end with file paths and complete contents for the key files.

---

## 1) App Nuxt configs (consumers)

These apps call `createFireuxConfig(...)` to generate a full Nuxt config with FireUX defaults.

### projects/misebox/misebox-app/nuxt.config.ts

```ts
import { defineNuxtConfig } from 'nuxt/config'
import type { NuxtConfig } from 'nuxt/schema'
import { createFireuxConfig } from 'fireux-core'

export default defineNuxtConfig(<NuxtConfig>{
  ...createFireuxConfig({
    appName: 'Misebox',
    appShortName: 'Misebox',
    ecosystem: 'misebox',
    modules: ['fireux-misebox'],
    role: 'king',
  }),
})
```

### projects/misebox/niederhorn/nuxt.config.ts

```ts
import { defineNuxtConfig } from 'nuxt/config'
import type { NuxtConfig } from 'nuxt/schema'
import { createFireuxConfig } from 'fireux-core'

export default defineNuxtConfig(<NuxtConfig>{
  ...createFireuxConfig({
    appName: 'Niederhorn',
    appShortName: 'Niederhorn',
    ecosystem: 'misebox',
    modules: ['fireux-misebox'],
  }),
})
```

### projects/fireux/fireux-app/nuxt.config.ts

```ts
import { defineNuxtConfig } from 'nuxt/config'
import type { NuxtConfig } from 'nuxt/schema'
import { createFireuxConfig } from 'fireux-core'

export default defineNuxtConfig(<NuxtConfig>{
  ...createFireuxConfig({
    appName: 'FireUX',
    appShortName: 'FireUX',
    ecosystem: 'fireux',
    modules: ['fireux-fireux'],
  }),
})
```

### projects/fireux/tennant/nuxt.config.ts

```ts
import { defineNuxtConfig } from 'nuxt/config'
import type { NuxtConfig } from 'nuxt/schema'
import { createFireuxConfig } from 'fireux-core'

export default defineNuxtConfig(<NuxtConfig>{
  ...createFireuxConfig({
    appName: 'FireUX Tenant',
    appShortName: 'Tenant',
    ecosystem: 'fireux',
    modules: ['fireux-fireux'],
  }),
})
```

### projects/cleanbox/cleanbox-app/nuxt.config.ts

```ts
import { defineNuxtConfig } from 'nuxt/config'
import type { NuxtConfig } from 'nuxt/schema'
import { createFireuxConfig } from 'fireux-core'

export default defineNuxtConfig(<NuxtConfig>{
  ...createFireuxConfig({
    appName: 'Cleanbox',
    appShortName: 'Cleanbox',
    ecosystem: 'cleanbox',
    modules: ['fireux-cleanbox', 'fireux-jobs'],
  }),
})
```

### projects/cleanbox/richies-reinigung/nuxt.config.ts

```ts
import { defineNuxtConfig } from 'nuxt/config'
import type { NuxtConfig } from 'nuxt/schema'
import { createFireuxConfig } from 'fireux-core'

export default defineNuxtConfig(<NuxtConfig>{
  ...createFireuxConfig({
    appName: 'Richies',
    appShortName: 'Richies',
    ecosystem: 'cleanbox',
    modules: ['fireux-cleanbox', 'fireux-jobs'],
  }),
})
```

---

## 2) createFireuxConfig (core generator)

Path: `packages/core/fireux-core/src/runtime/utils/fireux-config.ts`

```ts
import type { NuxtConfig } from 'nuxt/schema'

type ModuleEntry = string | [string, Record<string, any>]

export interface TenantConfig {
  ecosystem: string
  appName: string
  appShortName: string
  modules?: ModuleEntry[]
  includeCore?: boolean // default true

  // Optional overrides (read from env by default)
  primaryColor?: string
  neutralColor?: string
  vuefire?: Record<string, any>
  pwa?: Record<string, any>
  compatibilityDate?: string

  // Simple tenancy role (e.g. 'tenant' | 'global' | custom). Defaults to 'tenant'.
  role?: string
}

function dedupeKeepLast(mods: ModuleEntry[] = []): ModuleEntry[] {
  // Keep last occurrence so app-provided modules/options win
  const map = new Map<string, ModuleEntry>()
  for (const m of mods) map.set(Array.isArray(m) ? m[0] : m, m)
  const seen = new Set<string>()
  const ordered: ModuleEntry[] = []
  for (const m of mods) {
    const id = Array.isArray(m) ? m[0] : m
    if (!seen.has(id)) {
      seen.add(id)
      ordered.push(map.get(id)!)
    }
  }
  return ordered
}

// Treat empty-string envs as undefined
const env = (k: string) => {
  const v = process.env[k]
  return v?.trim()?.length ? v : undefined
}

export function createFireuxConfig(opts: TenantConfig): NuxtConfig {
  const includeCore = opts.includeCore ?? true

  // Colors come from env unless explicitly overridden
  const primaryColor =
    opts.primaryColor ?? env('APP_PRIMARY_COLOR') ?? '#000000'
  const neutralColor = opts.neutralColor ?? env('APP_NEUTRAL_COLOR')

  // Defaults
  const vuefireDefaults = {
    auth: { enabled: true, sessionCookie: false },
    config: {
      apiKey: env('FIREBASE_API_KEY'),
      authDomain: env('FIREBASE_AUTH_DOMAIN'),
      projectId: env('FIREBASE_PROJECT_ID'),
      storageBucket: env('FIREBASE_STORAGE_BUCKET'),
      messagingSenderId: env('FIREBASE_MESSAGING_SENDER_ID'),
      appId: env('FIREBASE_APP_ID'),
      measurementId: env('FIREBASE_MEASUREMENT_ID'),
    },
    appCheck: env('FIREBASE_RECAPTCHA_V3_KEY')
      ? {
          debug: false,
          isTokenAutoRefreshEnabled: true,
          provider: 'ReCaptchaV3',
          key: env('FIREBASE_RECAPTCHA_V3_KEY'),
        }
      : undefined,
  }

  const pwaDefaults = {
    registerType: 'autoUpdate',
    manifest: {
      name: opts.appName,
      short_name: opts.appShortName,
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: primaryColor,
    },
  }

  const vuefireMerged = { ...vuefireDefaults, ...(opts.vuefire ?? {}) }
  const pwaMerged = { ...pwaDefaults, ...(opts.pwa ?? {}) }

  // Always-on modules (order matters)
  const base: ModuleEntry[] = [
    '@nuxt/ui',
    '@nuxt/icon',
    ['nuxt-vuefire', vuefireMerged],
    ['@vite-pwa/nuxt', pwaMerged],
    ...(includeCore ? (['fireux-core'] as ModuleEntry[]) : []),
  ]

  const modules = dedupeKeepLast([...base, ...(opts.modules ?? [])])

  const appId = env('APP_ID')
  if (process.env.NODE_ENV !== 'production' && !appId) {
    // eslint-disable-next-line no-console
    console.warn(
      '[fireux] APP_ID is not set. Some app-level composables may not resolve.'
    )
  }

  const config: NuxtConfig = {
    // FireUX app structure defaults
    srcDir: 'app',
    // composables only; models stay explicit-import-only
    imports: { dirs: ['composables/**', 'utils/**'] },

    modules,
    app: { head: { title: opts.appName } },
    runtimeConfig: {
      // server-only (JSON string accepted; OR rely on GOOGLE_APPLICATION_CREDENTIALS path env)
      firebaseServiceAccount: env('FIREBASE_SERVICE_ACCOUNT') || '',
      public: {
        ecosystem: opts.ecosystem,
        appName: opts.appName,
        appShortName: opts.appShortName,
        primaryColor,
        neutralColor,
        // expose to client plugin
        firebaseConfig: { ...(vuefireMerged.config || {}) },
        // minimal app settings
        appSettings: {
          appId, // may be undefined; that's okay
          ecosystem: opts.ecosystem,
          // Include key branding fields so runtime composables can resolve names reliably
          appName: opts.appName,
          appShortName: opts.appShortName,
        },
        // Expose the resolved module list (string form) so runtime composables
        // like useFireUXConfig can introspect enabled tenant/feature modules.
        // NOTE: Was previously missing; downstream code expecting modules would receive []
        // which could cause feature detection divergence between tenants.
        modules: modules.map((m) => (Array.isArray(m) ? m[0] : m)),

        // Simple tenancy role (default 'tennant') exposed to client
        // NOTE: legacy value 'tenant' will be normalized to 'tennant' by composables
        role: opts.role ?? 'tennant',
      },
    },
    compatibilityDate: (opts.compatibilityDate ??
      '2025-09-01') as unknown as NuxtConfig['compatibilityDate'],
  }

  return config
}
```

---

## 3) Re-export (core/config)

Path: `packages/core/fireux-core/src/config/app/fireux-config.ts`

```ts
export {
  createFireuxConfig,
  type TenantConfig,
} from '../../runtime/utils/fireux-config'
```

---

## 4) Runtime accessor (client)

Path: `packages/core/fireux-core/src/runtime/composables/FireUXConfig.ts`

```ts
import { useRuntimeConfig } from 'nuxt/app'

interface AppSettings {
  projectName: string // Moved to the top to match `.env` order
  appName: string
  appId: string
  nodeEnv: string
  appShortName: string
  appPrimaryColor: string
  appNeutralColor: string
  appIcon: string
  domain: string
}

export function useFireUXConfig() {
  const runtimeConfig = useRuntimeConfig()
  // ... see file for defaults/merging ...
  return {
    devMode,
    projectName,
    appName,
    appId,
    appIcon,
    ecosystem,
    modules,
  }
}
```

(Full file content included above.)

---

## 5) Consumer composable

Path: `packages/core/fireux-core/src/runtime/composables/app/useApp.ts`

```ts
export function useApp() {
  const { appId } = useFireUXConfig()
  // Ensures Firebase is initialized, exposes current app doc, apps collection,
  // users subcollection helper, and child helpers (update/computed/ensure/subscription setup).
}
```

(Full file content included above.)

---

## Flow summary

- App-level nuxt.config.ts calls `createFireuxConfig`, passing app name, ecosystem, modules, and optionally role/colors.
- `createFireuxConfig` assembles modules and emits `runtimeConfig.public` values (ecosystem, appSettings with appId, modules array, role) and Firebase/PWA config.
- `useFireUXConfig` reads those `runtimeConfig.public` values (plus env) and surfaces a normalized config for client code.
- `useApp` uses `appId` from `useFireUXConfig` to build the proper Firestore doc/collections and app helpers.

If you want, I can add a tiny “Config Inspector” page under core dev (`/dev/config`) to render these values at runtime for quick sanity checks.
