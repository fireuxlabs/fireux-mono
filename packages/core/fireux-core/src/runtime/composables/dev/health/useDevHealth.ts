import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import type { DevHealthApi, DevHealthResult, DevHealthScope } from './types'
import { useDevAdminHealth } from './checks/useDevAdminHealth'
import { useDevAppsCollectionShapeHealth } from './checks/useDevAppsCollectionShapeHealth'
import { useDevUsersCollectionShapeHealth } from './checks/useDevUsersCollectionShapeHealth'

export function useDevHealth(): DevHealthApi {
  const adminMatrix = useDevAdminHealth()
  const appsShape = useDevAppsCollectionShapeHealth()
  const usersShape = useDevUsersCollectionShapeHealth()

  const checks = computed<DevHealthResult[]>(() =>
    [
      adminMatrix.value,
      appsShape.result.value,
      usersShape.result.value,
    ].filter((v): v is DevHealthResult => Boolean(v))
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
