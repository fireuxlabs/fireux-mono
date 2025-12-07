import type { NuxtConfig } from 'nuxt/schema'
import { createNitroConfig } from './nitro-config'
import type { TenantConfig } from './tenant-config'
import type { ModuleEntry } from './module-utils'
import { resolveTenantBasics } from './tenant-basics'
import { resolveTenantTheme } from './tenant-theme'
import { resolveTenantIntegrations } from './tenant-integrations'
import { resolveTenantModules } from './tenant-modules'
import { resolveTenantRuntime } from './tenant-runtime'
import { resolveTenantVite } from './tenant-vite'

interface FireuxNuxtSetup {
  appName: string
  appDescription: string
  themeColor: string
  modules: ModuleEntry[]
  runtimeConfig: NonNullable<NuxtConfig['runtimeConfig']>
  compatibilityDate: NuxtConfig['compatibilityDate']
  vite?: NuxtConfig['vite']
  nitro: NuxtConfig['nitro']
}

export const DEFAULT_COMPATIBILITY_DATE = '2025-09-01'

export function resolveFireuxNuxtSetup(opts: TenantConfig): FireuxNuxtSetup {
  // Constitution: fail fast on required tenant fields; avoid hidden compatibility layers.
  const basics = resolveTenantBasics(opts)
  const theme = resolveTenantTheme(opts)
  const integrations = resolveTenantIntegrations(basics, theme, opts)
  const modules = resolveTenantModules(
    basics.includeCore,
    opts.modules,
    integrations
  )
  const devMode = process.env.NODE_ENV !== 'production'
  const runtimeConfig = resolveTenantRuntime({
    basics,
    theme,
    modules,
    firebaseConfig: integrations.firebaseConfig,
    serviceAccountJson: integrations.serviceAccount?.json,
    devMode,
  })
  const nitro = createNitroConfig(opts.nitro)
  const vite = resolveTenantVite(devMode)

  return {
    appName: basics.appName,
    appDescription: basics.appDescription,
    themeColor: theme.primaryColor,
    modules,
    runtimeConfig,
    compatibilityDate: resolveCompatibilityDate(opts.compatibilityDate),
    vite,
    nitro,
  }
}

function resolveCompatibilityDate(
  explicit?: string
): NuxtConfig['compatibilityDate'] {
  return (explicit ??
    DEFAULT_COMPATIBILITY_DATE) as NuxtConfig['compatibilityDate']
}
