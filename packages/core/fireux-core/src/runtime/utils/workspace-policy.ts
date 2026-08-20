import type { FireuxAppRole, FireuxWorkspaceConfig } from '../../config/app/types'

export function resolveWorkspaceCanCreate(
  role: FireuxAppRole,
  workspaceConfig: FireuxWorkspaceConfig,
  family: string
): boolean {
  const key = family.trim().toLowerCase()
  const configured = key ? workspaceConfig[key]?.canCreate : undefined

  return typeof configured === 'boolean' ? configured : role !== 'tenant'
}
