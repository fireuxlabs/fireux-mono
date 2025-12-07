import type { NuxtConfig } from 'nuxt/schema'
import { requireEnv } from './env'
import { createRuntimeConfig } from './runtime-config'
import type { ModuleEntry } from './module-utils'
import type { TenantBasics } from './tenant-basics'
import type { TenantTheme } from './tenant-theme'

export interface TenantRuntimeInput {
  basics: TenantBasics
  theme: TenantTheme
  modules: ModuleEntry[]
  firebaseConfig: Record<string, any>
  serviceAccountJson?: string
  devMode: boolean
}

export function resolveTenantRuntime(
  input: TenantRuntimeInput
): NonNullable<NuxtConfig['runtimeConfig']> {
  const {
    basics,
    theme,
    modules,
    firebaseConfig,
    serviceAccountJson,
    devMode,
  } = input
  const appId = requireEnv('APP_ID')
  const globalAppId = basics.ecosystem ? `${basics.ecosystem}-app` : undefined

  return createRuntimeConfig({
    ecosystem: basics.ecosystem,
    appId,
    appName: basics.appName,
    appShortName: basics.appShortName,
    appDescription: basics.appDescription,
    role: basics.role,
    modules,
    primaryColor: theme.primaryColor,
    neutralColor: theme.neutralColor,
    secondaryColor: theme.secondaryColor,
    centralSignupUrl: theme.centralSignupUrl,
    appIcon: theme.appIcon,
    developerPin: theme.developerPin,
    firebaseConfig,
    serviceAccountJson,
    globalAppId,
    devMode,
  })
}
