import type { FireuxAppRole } from '../../config/app/types'
import type { FireuxEntityManagement } from '../models/utils/scope.model'

const text = (value: unknown) => String(value ?? '').trim()

export function readFireuxEntityManagement(
  value: unknown
): FireuxEntityManagement | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null

  const source = value as Record<string, unknown>
  const keys = Object.keys(source).sort()
  const mode = text(source.mode)

  if (
    (mode === 'root' || mode === 'console') &&
    keys.length === 1 &&
    keys[0] === 'mode'
  ) {
    return { mode }
  }

  if (
    mode === 'app' &&
    keys.length === 2 &&
    keys[0] === 'app_id' &&
    keys[1] === 'mode' &&
    text(source.app_id)
  ) {
    return { mode, app_id: text(source.app_id) }
  }

  return null
}

export function resolveFireuxEntityManagementForApp(
  role: FireuxAppRole,
  appId: string,
  ecosystem: string
): Exclude<FireuxEntityManagement, { mode: 'root' }> {
  const id = text(appId)
  if (!id) {
    throw new Error('[fireux] App-managed entity requires an App id.')
  }
  if (role === 'global') {
    if (id !== resolveFireuxEcosystemAppId(ecosystem)) {
      throw new Error('[fireux] Global App must be the ecosystem App.')
    }
    return { mode: 'console' }
  }
  return { mode: 'app', app_id: id }
}

export function resolveFireuxEntityManagementAppId(
  management: FireuxEntityManagement,
  ecosystem: string
): string {
  if (management.mode === 'root') return ''
  if (management.mode === 'app') return management.app_id
  return resolveFireuxEcosystemAppId(ecosystem)
}

export function resolveFireuxEcosystemAppId(ecosystem: string): string {
  const key = text(ecosystem).toLowerCase()
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(key)) {
    throw new Error('[fireux] Ecosystem key is required to resolve its App.')
  }
  return `${key}-app`
}
