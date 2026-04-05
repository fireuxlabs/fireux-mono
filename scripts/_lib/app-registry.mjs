const SHARED_ROUTES = ['/', '/dashboard', '/dashboard/user-profile']

function unique(values) {
  return [...new Set(values)]
}

function consoleRoutes(families = []) {
  if (!families.length) return []

  const routes = ['/console']

  for (const family of families) {
    routes.push(`/console/${family}`)
    routes.push(`/console/${family}/demo`)
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
    consoleFamilies: ['projects'],
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
    consoleFamilies: ['kitchen', 'supplier'],
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
    consoleFamilies: [],
    launchOrder: 3,
  },
  niederhorn: {
    key: 'niederhorn',
    name: 'Niederhorn',
    appId: 'niederhorn',
    ecosystem: 'misebox',
    databaseId: 'misebox',
    role: 'tenant',
    workspace: './projects/misebox/niederhorn',
    port: 3003,
    consoleFamilies: [],
    launchOrder: 4,
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
    consoleFamilies: [],
    launchOrder: 5,
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
    consoleFamilies: [],
    launchOrder: 6,
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
    consoleFamilies: ['supplier'],
    launchOrder: 7,
  },
  'find-my-seo': {
    key: 'find-my-seo',
    name: 'Find My SEO',
    appId: 'find-my-seo-app',
    ecosystem: 'fireux',
    databaseId: 'fireux',
    role: 'standalone',
    workspace: './projects/fireux/find-my-seo-app',
    port: 3010,
    consoleFamilies: [],
    launchOrder: 8,
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
    consoleFamilies: ['portfolio'],
    launchOrder: 9,
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
    consoleFamilies: [],
    launchOrder: 10,
  },
}

export const APP_GROUPS = {
  all: ['fireux', 'misebox', 'cleanbox'],
  'all-extended': ['fireux', 'misebox', 'cleanbox', 'niederhorn', 'richies', 'tenant'],
  full: ['fireux', 'misebox', 'cleanbox', 'niederhorn', 'richies', 'tenant', 'bringli', 'find-my-seo', 'granite', 'la-tap-berne'],
}

export const APP_KEYS = Object.keys(APP_REGISTRY)

export function getAppRegistryEntry(key) {
  const app = APP_REGISTRY[key]

  if (!app) {
    throw new Error(`[app-registry] Unknown app "${key}". Expected one of: ${APP_KEYS.join(', ')}`)
  }

  return {
    ...app,
    filter: app.workspace,
    baseUrl: `http://localhost:${app.port}`,
    smokeRoutes: unique([...SHARED_ROUTES, ...consoleRoutes(app.consoleFamilies)]),
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
