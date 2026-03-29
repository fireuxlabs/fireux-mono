// FILE: scripts/_lib/dev-apps.mjs

const sharedRoutes = ['/', '/dashboard', '/dashboard/user-profile']

function consoleRoutes(families = []) {
  const routes = []

  if (!families.length) return routes

  routes.push('/console')

  for (const family of families) {
    routes.push(`/console/${family}`)
    routes.push(`/console/${family}/overview`)
    routes.push(`/console/${family}/read-only`)
  }

  return routes
}

function unique(values) {
  return [...new Set(values)]
}

export const DEV_APPS = {
  fireux: {
    key: 'fireux',
    name: 'FireUX',
    filter: './projects/fireux/fireux-app',
    port: 3000,
    baseUrl: 'http://localhost:3000',
    consoleFamilies: ['projects'],
  },
  misebox: {
    key: 'misebox',
    name: 'Misebox',
    filter: './projects/misebox/misebox-app',
    port: 3001,
    baseUrl: 'http://localhost:3001',
    consoleFamilies: ['kitchen', 'supplier'],
  },
  cleanbox: {
    key: 'cleanbox',
    name: 'Cleanbox',
    filter: './projects/cleanbox/cleanbox-app',
    port: 3002,
    baseUrl: 'http://localhost:3002',
    consoleFamilies: [],
  },
  niederhorn: {
    key: 'niederhorn',
    name: 'Niederhorn',
    filter: './projects/misebox/niederhorn',
    port: 3003,
    baseUrl: 'http://localhost:3003',
    consoleFamilies: ['kitchen'],
  },
  richies: {
    key: 'richies',
    name: 'Richies Reinigung',
    filter: './projects/cleanbox/richies-reinigung',
    port: 3004,
    baseUrl: 'http://localhost:3004',
    consoleFamilies: [],
  },
  tenant: {
    key: 'tenant',
    name: 'FireUX Tenant',
    filter: './projects/fireux/tenant',
    port: 3005,
    baseUrl: 'http://localhost:3005',
    consoleFamilies: [],
  },
  bringli: {
    key: 'bringli',
    name: 'Bringli',
    filter: './projects/bringli/bringli-app',
    port: 3006,
    baseUrl: 'http://localhost:3006',
    consoleFamilies: ['supplier'],
  },
  granite: {
    key: 'granite',
    name: 'Granite',
    filter: './projects/granite/granite-app',
    port: 3007,
    baseUrl: 'http://localhost:3007',
    consoleFamilies: ['portfolio'],
  },
  'la-tap-berne': {
    key: 'la-tap-berne',
    name: 'La Tap Berne',
    filter: './projects/misebox/la-tap-berne',
    port: 3008,
    baseUrl: 'http://localhost:3008',
    consoleFamilies: ['kitchen'],
  },
}

export const DEV_APP_KEYS = Object.keys(DEV_APPS)

export function getDevApp(key) {
  const app = DEV_APPS[key]
  if (!app) {
    const known = DEV_APP_KEYS.join(', ')
    throw new Error(`[smoke] Unknown app "${key}". Expected one of: ${known}`)
  }
  return {
    ...app,
    smokeRoutes: unique([...sharedRoutes, ...consoleRoutes(app.consoleFamilies)]),
  }
}

export function getDevApps(keys) {
  if (!keys?.length) return DEV_APP_KEYS.map((key) => getDevApp(key))
  return keys.map((key) => getDevApp(key))
}
