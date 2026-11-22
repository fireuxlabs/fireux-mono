import type { AppRole } from 'fireux-core/runtime/app/models/model'
import type { FireuxWorkspaceConfig } from 'fireux-core/config/app/types'

export function resolveWorkspaceCanCreate(
  role: AppRole,
  workspaceConfig: FireuxWorkspaceConfig,
  family: string
): boolean {
  const key = family.trim().toLowerCase()
  const configured = key ? workspaceConfig[key]?.canCreate : undefined

  return typeof configured === 'boolean' ? configured : role !== 'tenant'
}
