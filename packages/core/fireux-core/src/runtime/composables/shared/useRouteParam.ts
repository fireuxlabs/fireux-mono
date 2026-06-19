import { computed } from 'vue'
import { useRoute } from '#imports'
import { normalizeString } from '../../utils/string'

type RouteParamValue = string | string[] | null | undefined

export function readRouteParam(value: RouteParamValue): string {
  return normalizeString(Array.isArray(value) ? value[0] : value)
}

export function useRouteParam(key: string) {
  const route = useRoute()

  return computed(() => readRouteParam(route.params[key]))
}
