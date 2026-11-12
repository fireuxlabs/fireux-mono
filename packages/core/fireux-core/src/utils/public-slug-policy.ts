export const normalizeReservedRouteKey = (value: unknown): string =>
  String(value ?? '')
    .trim()
    .toLowerCase()

/**
 * Core defaults for top-level route keys; enabled modules register additions at build time.
 * These protect root-level public identities such as user handles.
 */
export const BASE_RESERVED_ROUTE_KEYS = [
  'apps',
  'users',
  'auth',
  'workspace',
  'onboarding',
  'legal',
  'admin',
  'diagnostics',
  'api',
  'assets',
  'img',
  'static',
  '_nuxt',
] as const

/**
 * Reserved static/action route segments used inside entity namespaces.
 * These protect entity public slugs from colliding with routes such as
 * /products/create or /users/settings.
 */
export const BASE_RESERVED_ROUTE_SEGMENT_KEYS = [
  'new',
  'create',
  'edit',
  'delete',
  'settings',
  'me',
  'admin',
  'diagnostics',
  'api',
] as const
