import { useFireUXConfig } from '../FireUXConfig'

const normalizeFamily = (value: unknown) =>
  String(value ?? '').trim().toLowerCase()

/**
 * Shared console app policy.
 *
 * Explicit app config wins. Otherwise tenant apps use existing console targets,
 * while global/standalone apps may create new targets.
 */
export function useConsoleConfig(family = '') {
  const fireux = useFireUXConfig()

  const canCreateTarget = (targetFamily = family) => {
    const key = normalizeFamily(targetFamily)
    const config = key ? fireux.consoleConfig?.[key] : undefined
    if (typeof config?.canCreate === 'boolean') return config.canCreate

    return !fireux.isTenant
  }

  const targetIds = (targetFamily = family) => {
    const key = normalizeFamily(targetFamily)
    const config = key ? fireux.consoleConfig?.[key] : undefined

    return Array.isArray(config?.targetIds) ? config.targetIds : []
  }

  return {
    canCreateTarget,
    targetIds,
  }
}
