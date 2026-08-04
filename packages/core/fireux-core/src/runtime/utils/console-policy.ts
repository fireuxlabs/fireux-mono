import type { FireuxAppRole, FireuxConsoleConfig } from '../../config/app/types'

export function resolveConsoleCanCreate(
  role: FireuxAppRole,
  consoleConfig: FireuxConsoleConfig,
  family: string
): boolean {
  const key = family.trim().toLowerCase()
  const configured = key ? consoleConfig[key]?.canCreate : undefined

  return typeof configured === 'boolean' ? configured : role !== 'tenant'
}
