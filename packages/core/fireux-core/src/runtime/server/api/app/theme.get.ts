import { defineEventHandler, setHeader, type H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
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

  const rawPrimary = process.env.APP_PRIMARY_COLOR || ''
  const appPrimaryColor = normalizeHex(rawPrimary, '#FACC15')
  const appNeutralColor = normalizeHex(
    process.env.APP_NEUTRAL_COLOR || '',
    '#71717A'
  )
  const rawSecondary = process.env.APP_SECONDARY_COLOR?.trim()
  const appSecondaryColor = rawSecondary
    ? normalizeHex(rawSecondary, appPrimaryColor)
    : undefined
  const projectName = process.env.PROJECT_NAME || 'FireUX'
  const appId = process.env.APP_ID || 'fireux-app'
  const appShortName = process.env.APP_SHORT_NAME || 'FireUX'
  const domain = process.env.APP_DOMAIN || 'https://fireux.app'

  const theme: {
    primary: string
    neutral: string
    secondary?: string
  } = {
    primary: appPrimaryColor,
    neutral: appNeutralColor,
  }

  if (appSecondaryColor) {
    theme.secondary = appSecondaryColor
  }

  // Only return data that's actually available from environment variables
  const appTheme = {
    // Core app identity from environment
    projectName: projectName,
    name: appName,
    appId: appId,
    shortName: appShortName,
    domain: domain,

    // Theme colors (the main purpose of this endpoint)
    theme,

    // App icon from environment
    icon: process.env.APP_ICON || 'flame',

    // App logos with absolute URLs
    logos: {
      light: `${domain}/img/core/brand/wordmark-light.png`,
      dark: `${domain}/img/core/brand/wordmark-dark.png`,
      default: `${domain}/img/core/brand/wordmark-light.png`,
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
