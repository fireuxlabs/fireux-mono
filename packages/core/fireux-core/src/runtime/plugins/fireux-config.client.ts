// FILE: packages/core/fireux-core/src/runtime/plugins/fireux-config.client.ts
import { defineNuxtPlugin, useRuntimeConfig } from '#imports'

const FIREUX_CACHE_KEY = '__FIREUX_CONFIG'

/**
 * Client plugin:
 * - Builds a normalized FireUX config from runtimeConfig.public
 * - Freezes it and caches on window to avoid rework
 * - Provides it as $fireuxConfig (if you want to inject) and also sets a global cache
 */
export default defineNuxtPlugin(() => {
  const globalScope = globalThis as Record<string, unknown>

  if (globalScope[FIREUX_CACHE_KEY]) {
    return {
      provide: {
        fireuxConfig: globalScope[FIREUX_CACHE_KEY],
      },
    }
  }

  const pub = (useRuntimeConfig().public ?? {}) as Record<string, unknown>

  const asString = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
  const asOptString = (v: unknown) =>
    typeof v === 'string' && v.trim() ? v.trim() : undefined
  const asStringArray = (v: unknown) =>
    Array.isArray(v)
      ? v
          .map((e) =>
            typeof e === 'string' ? e.trim() : String(e ?? '').trim()
          )
          .filter(Boolean)
      : []

  const role = asString(pub.role).toLowerCase()
  const cfg = Object.freeze({
    devMode: Boolean(pub.devMode),
    role,
    ecosystem: asString(pub.ecosystem),

    appId: asString(pub.appId),
    appName: asString(pub.appName),
    appShortName: asString(pub.appShortName),

    modules: asStringArray(pub.modules),

    appIcon: asOptString(pub.appIcon),
    primaryColor: asOptString(pub.primaryColor),
    neutralColor: asOptString(pub.neutralColor),
    centralSignupUrl: asOptString(pub.centralSignupUrl),

    globalAppId: asOptString(pub.globalAppId),

    // derived convenience flags
    isTenant: role === 'tenant',
    isGlobal: role === 'global',
  })

  globalScope[FIREUX_CACHE_KEY] = cfg

  return {
    provide: {
      fireuxConfig: cfg,
    },
  }
})
