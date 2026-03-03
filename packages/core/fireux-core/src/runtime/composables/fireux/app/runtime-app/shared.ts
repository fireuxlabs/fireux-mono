import type { RuntimeMode } from '../../runtime/runtime.types'

export type RuntimeAppMode = RuntimeMode

export type RuntimeAppSelection = {
  appId?: string | null | undefined
  mode?: RuntimeAppMode | null | undefined
}

/**
 * Simple helpers mirrored from core/normalize but scoped for app packages.
 * Using the shared runtime.normalize file directly would create a circular
 * dependency: shared -> core -> runtime.normalize. So we reimplement a small
 * subset here.
 */
const toSingleValue = (value: unknown): unknown => (Array.isArray(value) ? value[0] : value)

export const normalizeString = (value: unknown): string =>
  String(toSingleValue(value) ?? '').trim()

export const normalizeMode = (value: unknown): RuntimeAppMode | null => {
  const normalized = normalizeString(value).toLowerCase()
  if (normalized === 'dummy') return 'read-only'
  if (normalized === 'read-only' || normalized === 'test' || normalized === 'live') {
    return normalized as RuntimeAppMode
  }
  return null
}

export const resolveRuntimeAppCollectionPath = (
  mode: RuntimeAppMode
): 'apps' | 'test-apps' => (mode === 'live' ? 'apps' : 'test-apps')
