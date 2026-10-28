import { computed } from 'vue'
import type { RouteLocationNormalizedLoadedGeneric } from 'vue-router'
import { useRoute } from '#imports'
import { normalizeString } from '../../utils/normalize-string'

type RouteParamValue = string | string[] | null | undefined

export function readRouteParam(value: RouteParamValue): string {
  return normalizeString(Array.isArray(value) ? value[0] : value)
}

export function useRouteParam(key: string) {
  const route: RouteLocationNormalizedLoadedGeneric = useRoute()

  return computed(() => readRouteParam(route.params[key]))
}
