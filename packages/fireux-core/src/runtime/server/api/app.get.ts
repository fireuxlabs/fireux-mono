import { defineEventHandler } from 'h3'
import type { AppSettings } from '../../../runtime-config'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)

  // Get app settings from runtime config (based on actual env structure)
  const appSettings = config.public.appSettings as AppSettings

  // App info using actual runtime config structure
  const appInfo = {
    name: appSettings.appName || 'FireUX App',
    projectName: appSettings.projectName || 'FireUX',
    shortName: appSettings.appShortName || 'FireUX',
    appId: appSettings.appId || 'fireux-app',
    description: `${appSettings.appName || 'FireUX App'} - Part of the FireUX ecosystem`,
    version: '1.0.0', // Could be from package.json later
    status: 'Available', // Default status, could be env var later
    url: appSettings.domain || 'https://fireux.app',

    // Theme colors from actual env vars
    theme: {
      primary: appSettings.appPrimaryColor
        ? `#${appSettings.appPrimaryColor}`
        : '#FACC15',
      neutral: appSettings.appNeutralColor
        ? `#${appSettings.appNeutralColor}`
        : '#71717A',
    },

    // Assets using actual structure
    assets: {
      icon: appSettings.appIcon || 'flame',
      logo: '/img/logo-type-light.svg',
      logoDark: '/img/logo-type-dark.svg',
      favicon: '/favicon.ico',
      ogImage: '/img/og-image.png',
    },

    // App-specific metadata
    features: [
      'Dashboard Templates',
      'Authentication System',
      'Component Library',
    ], // Default for FireUX
    category: 'framework',
    tags: ['vue', 'nuxt', 'firebase', 'ui'],

    // API metadata
    lastUpdated: new Date().toISOString(),
    api: {
      version: '1.0.0',
      endpoints: {
        app: '/api/app',
        health: '/api/health',
      },
    },
  }

  return {
    success: true,
    data: appInfo,
  }
})
