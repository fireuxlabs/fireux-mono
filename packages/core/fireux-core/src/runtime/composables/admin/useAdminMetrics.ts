import { useBlogMetrics } from './useBlogMetrics'
import { useProductMetrics } from './useProductMetrics'

export function useAdminMetrics() {
  return {
    ...useBlogMetrics(),
    ...useProductMetrics(),
  }
}

export function exposeAdminMetrics() {
  return useAdminMetrics()
}
