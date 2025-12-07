import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import type { DevHealthApi, DevHealthResult, DevHealthScope } from './types'
import { useDevAdminHealth } from './checks/useDevAdminHealth.ts'

export function useDevHealth(): DevHealthApi {
  const adminMatrix = useDevAdminHealth()

  const checks = computed<DevHealthResult[]>(() =>
    [adminMatrix.value].filter(Boolean)
  )

  const getChecksForScope = (
    scope: DevHealthScope
  ): ComputedRef<DevHealthResult[]> =>
    computed(() =>
      checks.value.filter((check) => {
        if (!check.scopes?.length) return true
        return check.scopes.includes(scope)
      })
    )

  return {
    checks,
    getChecksForScope,
  }
}
