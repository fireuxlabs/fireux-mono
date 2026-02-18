// FILE: packages/core/fireux-core/src/runtime/plugins/fireux-config.client.ts
import { defineNuxtPlugin } from '#imports'
import { useFireUXConfig } from '../composables/fireux/app/FireUXConfig'

const FIREUX_CACHE_KEY = '__FIREUX_CONFIG'

/**
 * Client plugin:
 * - Provides the canonical FireUX config (built from runtimeConfig.public.fireux)
 * - Caches it on global scope to avoid rework
 */
export default defineNuxtPlugin(() => {
  const globalScope = globalThis as Record<string, unknown>
  const cfg = useFireUXConfig()
  globalScope[FIREUX_CACHE_KEY] = cfg
  return { provide: { fireuxConfig: cfg } }
})
