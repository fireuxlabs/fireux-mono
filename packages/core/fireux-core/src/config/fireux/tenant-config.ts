import type { NuxtConfig } from 'nuxt/schema'

// Canonical tenant input contract consumed by createFireuxConfig/resolveFireuxNuxtSetup.
// Required: ecosystem, appName, appShortName, appDescription, role. Modules may be empty; includeCore defaults true.
export interface TenantConfig {
  ecosystem: string
  appName: string
  appShortName: string
  appDescription: string
  role: 'global' | 'tenant'
  modules?: string[]
  includeCore?: boolean
  primaryColor?: string
  neutralColor?: string
  secondaryColor?: string
  vuefire?: Record<string, any>
  pwa?: Record<string, any>
  compatibilityDate?: string
  nitro?: NuxtConfig['nitro']
}
