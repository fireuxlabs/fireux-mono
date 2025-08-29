import { createFireuxConfig } from './fireux-config'
import type { TenantConfig } from './fireux-config'

// Base Nuxt configuration shared across all FireUX apps
// This now wraps createFireuxConfig for a single source of truth
export const createBaseNuxtConfig = (appConfig: {
  appName: string
  appShortName: string
  primaryColor: string
  modules: string[]
  port: number
  ecosystem?: string
  neutralColor?: string
}) => {
  // Compose the config for createFireuxConfig
  const fireuxConfig: TenantConfig = {
    appName: appConfig.appName,
    appShortName: appConfig.appShortName,
    primaryColor: appConfig.primaryColor,
    modules: appConfig.modules,
    ecosystem: appConfig.ecosystem,
    neutralColor: appConfig.neutralColor,
  }
  // Get the base config from fireux
  const base = createFireuxConfig(fireuxConfig)
  // You can extend/override here if needed
  return {
    ...base,
    server: {
      port: appConfig.port,
    },
    // Example: add/override fonts, tailwind, etc.
    googleFonts: {
      families: {
        Inter: [100, 200, 300, 400, 500, 600, 700, 800, 900],
      },
    },
    tailwindcss: {
      cssPath: '~/assets/css/tailwind.css',
      configPath: 'tailwind.config',
    },
    // Any other app-specific overrides can go here
  }
}
