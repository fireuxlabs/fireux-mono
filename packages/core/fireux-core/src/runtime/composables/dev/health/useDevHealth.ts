import { computed } from 'vue'
import type { ComputedRef } from 'vue'
import type { DevHealthApi, DevHealthResult, DevHealthScope } from './types'

export function useDevHealth(): DevHealthApi {
  const checks = computed<DevHealthResult[]>(() => [])

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
