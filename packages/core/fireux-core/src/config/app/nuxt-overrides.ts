import type { NuxtConfig } from '@nuxt/schema'
import { defineNuxtConfig } from 'nuxt/config'

type FireuxNuxtOverrides = NuxtConfig & Record<string, any>

const record = (value: unknown): Record<string, any> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, any>
    : {}

const array = <T>(value: T[] | T | undefined): T[] => {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

/**
 * Use only when an app needs a real Nuxt-level override.
 * Plain app identity/capability config should export defineFireuxConfig directly.
 */
export function withFireuxNuxtConfig(
  fireuxConfig: NuxtConfig,
  overrides: FireuxNuxtOverrides
) {
  const runtimeConfig = record(fireuxConfig.runtimeConfig)
  const overrideRuntimeConfig = record(overrides.runtimeConfig)
  const app = record(fireuxConfig.app)
  const overrideApp = record(overrides.app)
  const vite = record(fireuxConfig.vite)
  const overrideVite = record(overrides.vite)

  return defineNuxtConfig({
    ...fireuxConfig,
    ...overrides,
    app: {
      ...app,
      ...overrideApp,
    },
    css: [
      ...array(fireuxConfig.css),
      ...array(overrides.css),
    ],
    hooks: {
      ...record(fireuxConfig.hooks),
      ...record(overrides.hooks),
    },
    runtimeConfig: {
      ...runtimeConfig,
      ...overrideRuntimeConfig,
      public: {
        ...record(runtimeConfig.public),
        ...record(overrideRuntimeConfig.public),
      },
    },
    vite: {
      ...vite,
      ...overrideVite,
      server: {
        ...record(vite.server),
        ...record(overrideVite.server),
      },
    },
  })
}
