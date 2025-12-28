import { useCompanyFetch } from './fetch/useCompanyFetch'
import { useCompanyCreate } from './mutations/useCompanyCreate'
import { useCompanyUpdate } from './mutations/useCompanyUpdate'

/**
 * Canonical facade for Company: fetch + mutations.
 * Phase-1: dead object identity only.
 */
export function useCompanies() {
  const fetch = useCompanyFetch()
  const create = useCompanyCreate()
  const update = useCompanyUpdate()

  return {
    ...fetch,
    ...create,
    ...update,
  }
}
