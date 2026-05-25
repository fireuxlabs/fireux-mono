const SHARED_ROUTES = ['/', '/dashboard', '/dashboard/user-profile']

// Registry consoles are smoke-test route segments.
// Console family keys and route segments are singular:
// `project`, `property`, `kitchen`, `portfolio`, and `supplier`.
function unique(values) {
  return [...new Set(values)]
}

function consoleRoutes(families = []) {
  if (!families.length) return []

  const routes = ['/console']

  for (const family of families) {
    routes.push(`/console/${family}`)
  }

  return routes
}

export const APP_REGISTRY = {
  fireux: {
    key: 'fireux',
    name: 'FireUX',
    appId: 'fireux-app',
    ecosystem: 'fireux',
    databaseId: 'fireux',
    role: 'global',
    workspace: './projects/fireux/fireux-app',
    port: 3000,
    consoles: ['project'],
    launchOrder: 1,
  },
  misebox: {
    key: 'misebox',
    name: 'Misebox',
    appId: 'misebox-app',
    ecosystem: 'misebox',
    databaseId: 'misebox',
    role: 'global',
    workspace: './projects/misebox/misebox-app',
    port: 3001,
    consoles: ['kitchen', 'supplier'],
    componentSmokeRoutes: [
      '/console/kitchen',
      '/console/kitchen/identity',
      '/console/kitchen/mise',
      '/console/kitchen/ingredients',
      '/console/kitchen/suppliers',
      '/console/kitchen/menus',
      '/console/kitchen/dishes',
      '/console/kitchen/recipes',
      '/console/supplier',
    ],
    launchOrder: 2,
  },
  cleanbox: {
    key: 'cleanbox',
    name: 'Cleanbox',
    appId: 'cleanbox-app',
    ecosystem: 'cleanbox',
    databaseId: 'cleanbox',
    role: 'global',
    workspace: './projects/cleanbox/cleanbox-app',
    port: 3002,
    consoles: [],
    launchOrder: 3,
  },
  richies: {
    key: 'richies',
    name: 'Richies Reinigung',
    appId: 'richies-reinigung',
    ecosystem: 'cleanbox',
    databaseId: 'cleanbox',
    role: 'tenant',
    workspace: './projects/cleanbox/richies-reinigung',
    port: 3004,
    consoles: [],
    launchOrder: 4,
  },
  tenant: {
    key: 'tenant',
    name: 'FireUX Tenant',
    appId: 'fireux-tenant',
    ecosystem: 'fireux',
    databaseId: 'fireux',
    role: 'tenant',
    workspace: './projects/fireux/tenant',
    port: 3005,
    consoles: [],
    launchOrder: 5,
  },
  bringli: {
    key: 'bringli',
    name: 'Bringli',
    appId: 'bringli-app',
    ecosystem: 'bringli',
    databaseId: 'bringli',
    role: 'global',
    workspace: './projects/bringli/bringli-app',
    port: 3006,
    consoles: ['supplier'],
    launchOrder: 6,
  },
  'find-my-seo': {
    key: 'find-my-seo',
    name: 'Find My SEO',
    appId: 'find-my-seo-app',
    ecosystem: 'fireux',
    databaseId: 'find-my-seo',
    role: 'standalone',
    workspace: './projects/fireux/find-my-seo-app',
    port: 3010,
    consoles: [],
    smokeRoutes: [
      '/',
      '/chat',
      '/professionals',
      '/professionals/alex-mercer-technical-seo',
      '/categories/technical-seo',
      '/seo-for-saas',
      '/seo-for-ecommerce',
      '/case-studies',
      '/dashboard',
      '/dashboard/professional/profile',
    ],
    launchOrder: 7,
  },
  sproochli: {
    key: 'sproochli',
    name: 'Sproochli',
    appId: 'sproochli',
    ecosystem: 'fireux',
    databaseId: 'sproochli',
    role: 'standalone',
    workspace: './projects/fireux/sproochli',
    port: 3011,
    consoles: [],
    smokeRoutes: [
      '/',
      '/chat',
      '/bnb',
      '/info',
      '/menus',
      '/info/bern-bike-rental/rental-instructions',
      '/bnb/holiday-with-nats',
      '/bnb/holiday-with-nats/wifi',
    ],
    launchOrder: 8,
  },
  buenohost: {
    key: 'buenohost',
    name: 'BuenoHost',
    appId: 'buenohost',
    ecosystem: 'fireux',
    databaseId: 'buenohost',
    role: 'standalone',
    workspace: './projects/fireux/buenohost',
    port: 3012,
    consoles: ['property'],
    smokeRoutes: [
      '/',
      '/chat',
      '/properties/holiday-with-nats',
      '/properties/holiday-with-nats/companion',
      '/properties/holiday-with-nats/companion/check-in',
      '/console/property',
    ],
    launchOrder: 9,
  },
  'go-qr': {
    key: 'go-qr',
    name: 'Go QR',
    appId: 'go-qr',
    ecosystem: 'fireux',
    databaseId: 'go-qr',
    role: 'standalone',
    workspace: './projects/fireux/go-qr',
    port: 3013,
    consoles: [],
    smokeRoutes: ['/'],
    launchOrder: 10,
  },
  granite: {
    key: 'granite',
    name: 'Granite',
    appId: 'granite-app',
    ecosystem: 'granite',
    databaseId: 'granite',
    role: 'global',
    workspace: './projects/granite/granite-app',
    port: 3007,
    consoles: ['portfolio'],
    launchOrder: 11,
  },
  'la-tap-berne': {
    key: 'la-tap-berne',
    name: 'La Tap Berne',
    appId: 'la-tap-berne',
    ecosystem: 'misebox',
    databaseId: 'misebox',
    role: 'tenant',
    workspace: './projects/misebox/la-tap-berne',
    port: 3008,
    consoles: ['kitchen'],
    launchOrder: 12,
  },
}

export const APP_GROUPS = {
  all: ['fireux', 'misebox', 'cleanbox'],
  'all-extended': ['fireux', 'misebox', 'cleanbox', 'richies', 'tenant'],
  full: ['fireux', 'misebox', 'cleanbox', 'richies', 'tenant', 'bringli', 'find-my-seo', 'sproochli', 'buenohost', 'go-qr', 'granite', 'la-tap-berne'],
}

export const APP_KEYS = Object.keys(APP_REGISTRY)

export function getAppRegistryEntry(key) {
  const app = APP_REGISTRY[key]

  if (!app) {
    throw new Error(`[app-registry] Unknown app "${key}". Expected one of: ${APP_KEYS.join(', ')}`)
  }

  const smokeRoutes = app.smokeRoutes?.length
    ? unique(app.smokeRoutes)
    : unique([...SHARED_ROUTES, ...consoleRoutes(app.consoles)])

  return {
    ...app,
    filter: app.workspace,
    baseUrl: `http://localhost:${app.port}`,
    smokeRoutes,
    componentSmokeRoutes: unique(app.componentSmokeRoutes ?? smokeRoutes),
  }
}

export function getAppRegistryEntries(keys) {
  if (!keys?.length) return APP_KEYS.map((key) => getAppRegistryEntry(key))
  return keys.map((key) => getAppRegistryEntry(key))
}

export function getAppGroupKeys(group) {
  const keys = APP_GROUPS[group]

  if (!keys) {
    throw new Error(`[app-registry] Unknown app group "${group}". Expected one of: ${Object.keys(APP_GROUPS).join(', ')}`)
  }

  return [...keys]
}

export function getAppGroupEntries(group) {
  return getAppRegistryEntries(getAppGroupKeys(group))
}
