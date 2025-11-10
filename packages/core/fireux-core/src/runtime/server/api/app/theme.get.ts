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
  const normalizeHex = (value: string, fallback: string) => {
    const cleaned = (value || '').replace(/['"]/g, '').trim()
    const target = cleaned || fallback
    return target.startsWith('#') ? target : `#${target}`
  }

  const appPrimaryColor = normalizeHex(
    process.env.APP_PRIMARY_COLOR || '',
    '#FACC15'
  )
  const appNeutralColor = normalizeHex(
    process.env.APP_NEUTRAL_COLOR || '',
    '#71717A'
  )
  const appSecondaryColor = normalizeHex(
    process.env.APP_SECONDARY_COLOR || '',
    '#F97316'
  )
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
      primary: appPrimaryColor,
      neutral: appNeutralColor,
      secondary: appSecondaryColor,
    },

    // App icon from environment
    icon: process.env.APP_ICON || 'flame',

    // App logos with absolute URLs
    logos: {
      light: `${domain}/img/brand/wordmark.png`,
      dark: `${domain}/img/brand/wordmark.png`,
      default: `${domain}/img/brand/wordmark.png`,
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
