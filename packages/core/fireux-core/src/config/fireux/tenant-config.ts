import type { NuxtConfig } from 'nuxt/schema'
export interface TenantConfig {
  ecosystem: string
  appName: string
  appShortName: string
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
