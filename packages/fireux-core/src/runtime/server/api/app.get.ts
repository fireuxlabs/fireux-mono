import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (event) => {
  // Access environment variables directly in server context
  const appName = process.env.APP_NAME || 'FireUX App'
  const projectName = process.env.PROJECT_NAME || 'FireUX'
  const appShortName = process.env.APP_SHORT_NAME || 'FireUX'
  const appId = process.env.APP_ID || 'fireux-app'
  const domain = process.env.APP_DOMAIN || 'https://fireux.app'
  const appPrimaryColor = process.env.APP_PRIMARY_COLOR || 'FACC15'
  const appNeutralColor = process.env.APP_NEUTRAL_COLOR || '71717A'
  const appIcon = process.env.APP_ICON || 'flame'

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
      primary: `#${appPrimaryColor}`,
      neutral: `#${appNeutralColor}`,
    },

    // Assets
    assets: {
      icon: appIcon,
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
