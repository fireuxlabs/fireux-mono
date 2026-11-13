import type { AppRole } from '../../app/models/model'
import type { FireuxWorkspaceConfig } from '../../../config/app/types'

export function resolveWorkspaceCanCreate(
  role: AppRole,
  workspaceConfig: FireuxWorkspaceConfig,
  family: string
): boolean {
  const key = family.trim().toLowerCase()
  const configured = key ? workspaceConfig[key]?.canCreate : undefined

  return typeof configured === 'boolean' ? configured : role !== 'tenant'
}
