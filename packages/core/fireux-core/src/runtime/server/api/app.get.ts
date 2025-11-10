import { defineEventHandler } from 'h3'

export default defineEventHandler(async (_event) => {
  // Access environment variables directly in server context
  const appName = process.env.APP_NAME || 'FireUX App'
  const projectName = process.env.PROJECT_NAME || 'FireUX'
  const appShortName = process.env.APP_SHORT_NAME || 'FireUX'
  const appId = process.env.APP_ID || 'fireux-app'
  const domain = process.env.APP_DOMAIN || 'https://fireux.app'
  const appPrimaryColor = process.env.APP_PRIMARY_COLOR || 'FACC15'
  const appNeutralColor = process.env.APP_NEUTRAL_COLOR || '71717A'
  const appSecondaryColor = process.env.APP_SECONDARY_COLOR || 'F97316'
  const appIcon = process.env.APP_ICON || 'flame'

  // Ensure a single leading '#'
  const normalizeHex = (value: string) => {
    const cleaned = (value || '').replace(/['"]/g, '').trim()
    if (!cleaned) return '#000000'
    return cleaned.startsWith('#') ? cleaned : `#${cleaned}`
  }

  // App info using environment variables
  const appInfo = {
    name: appName,
    projectName: projectName,
    shortName: appShortName,
    appId: appId,
    description: `${appName} - Part of the FireUX ecosystem`,
    version: '1.0.0',
    status: 'Available',
    url: domain,

    // Theme colors from env vars
    theme: {
      primary: normalizeHex(appPrimaryColor),
      neutral: normalizeHex(appNeutralColor),
      secondary: normalizeHex(appSecondaryColor),
    },

    // Assets
    assets: {
      icon: appIcon,
      logo: '/img/brand/wordmark.png',
      logoDark: '/img/brand/wordmark.png',
      favicon: '/favicon.ico',
      ogImage: '/img/og-image.png',
    },

    // App-specific metadata
    features: [
      'Dashboard Templates',
      'Authentication System',
      'Component Library',
    ],
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
