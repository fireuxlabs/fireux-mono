import { useBlogMetrics } from './useBlogMetrics'
import { useProductMetrics } from './useProductMetrics'
import { useUserMetrics } from './useUserMetrics'

export async function useAdminMetrics() {
  const blog = await useBlogMetrics()
  const product = await useProductMetrics()
  const users = useUserMetrics()
  return {
    ...blog,
    ...product,
    ...users,
  }
}

export async function exposeAdminMetrics() {
  return await useAdminMetrics()
}
