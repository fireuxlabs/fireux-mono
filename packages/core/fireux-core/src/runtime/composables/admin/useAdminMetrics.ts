import { useBlogMetrics } from './useBlogMetrics'
import { useProductMetrics } from './useProductMetrics'

export async function useAdminMetrics() {
  const blog = await useBlogMetrics()
  const product = await useProductMetrics()
  return {
    ...blog,
    ...product,
  }
}

export async function exposeAdminMetrics() {
  return await useAdminMetrics()
}
