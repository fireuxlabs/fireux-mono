import type { FireuxAppScopeState } from '../models/utils/scope.model'

/** Normalizes stored scope state into the current vocabulary. */
export function normalizeFireuxAppScopeState(
  value: unknown
): FireuxAppScopeState | '' {
  const state = String(value ?? '').trim()

  if (state === 'dedicated_app') return 'tenant_app'
  if (
    state === 'root_only' ||
    state === 'parent_app' ||
    state === 'tenant_app'
  ) {
    return state
  }

  return ''
}

/** Maps an App role to the root-plus-App ownership state written at runtime. */
export function resolveFireuxAppScopeStateForRole(
  value: unknown
): Exclude<FireuxAppScopeState, 'root_only'> | '' {
  const role = String(value ?? '').trim()

  if (role === 'tenant') return 'tenant_app'
  if (role === 'global' || role === 'standalone') return 'parent_app'
  return ''
}
