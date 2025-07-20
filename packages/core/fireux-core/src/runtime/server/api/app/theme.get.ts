import { defineEventHandler, setHeader } from 'h3'

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

  // Access environment variables directly in server context
  const appName = process.env.APP_NAME || 'FireUX App'
  const appPrimaryColor = process.env.APP_PRIMARY_COLOR || 'FACC15'
  const appNeutralColor = process.env.APP_NEUTRAL_COLOR || '71717A'
  const projectName = process.env.PROJECT_NAME || 'FireUX'
  const appId = process.env.APP_ID || 'fireux-app'
  const appShortName = process.env.APP_SHORT_NAME || 'FireUX'
  const domain = process.env.APP_DOMAIN || 'https://fireux.app'

  // Only return data that's actually available from environment variables
  const appTheme = {
    // Core app identity from environment
    projectName: projectName,
    name: appName,
    appId: appId,
    shortName: appShortName,
    domain: domain,

    // Theme colors (the main purpose of this endpoint)
    theme: {
      primary: `#${appPrimaryColor}`,
      neutral: `#${appNeutralColor}`,
    },

    // App icon from environment
    icon: process.env.APP_ICON || 'flame',

    // App logos with absolute URLs
    logos: {
      light: `${domain}/img/logo-type-light.svg`,
      dark: `${domain}/img/logo-type-dark.svg`,
      default: `${domain}/img/logo.svg`,
    },

    // Basic metadata
    description: `${appName} - Part of the FireUX ecosystem`,
    status: 'Available',
    lastUpdated: new Date().toISOString(),
  }

  return {
    success: true,
    data: appTheme,
  }
})
