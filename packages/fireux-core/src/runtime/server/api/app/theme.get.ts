import { defineEventHandler, setHeader } from 'h3'
import type { AppSettings } from '../../../../runtime-config'

export default defineEventHandler(async (event) => {
  // Add CORS headers for cross-origin access between ecosystem apps
  setHeader(event, 'Access-Control-Allow-Origin', '*')
  setHeader(
    event,
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  )
  setHeader(
    event,
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  )

  const config = useRuntimeConfig(event)

  // Get app settings from public runtime config
  const appSettings = config.public.appSettings as AppSettings

  // Only return data that's actually available from runtime config
  const appTheme = {
    // Core app identity from runtime config
    projectName: appSettings?.projectName || 'FireUX',
    name: appSettings?.appName || 'FireUX App',
    appId: appSettings?.appId || 'fireux-app',
    shortName: appSettings?.appShortName || 'FireUX',
    domain: appSettings?.domain || 'https://fireux.app',

    // Theme colors (the main purpose of this endpoint)
    theme: {
      primary: appSettings?.appPrimaryColor
        ? `#${appSettings.appPrimaryColor}`
        : '#FACC15',
      neutral: appSettings?.appNeutralColor
        ? `#${appSettings.appNeutralColor}`
        : '#71717A',
    },

    // App icon from config
    icon: appSettings?.appIcon || 'flame',

    // App logos with absolute URLs
    logos: {
      light: `${appSettings?.domain || 'https://fireux.app'}/img/logo-type-light.svg`,
      dark: `${appSettings?.domain || 'https://fireux.app'}/img/logo-type-dark.svg`,
      default: `${appSettings?.domain || 'https://fireux.app'}/img/logo.svg`,
    },

    // Basic metadata
    description: `${appSettings?.appName || 'FireUX App'} - Part of the FireUX ecosystem`,
    status: 'Available', // Simple default
    lastUpdated: new Date().toISOString(),
  }

  return {
    success: true,
    data: appTheme,
  }
})
