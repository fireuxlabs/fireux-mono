import { useCompany, type UseCompanyOptions } from './useCompany'

export type UseCompaniesOptions = UseCompanyOptions

/**
 * @deprecated Use `useCompany()` as the singular Company family entry seam.
 * `useCompanies()` remains only as a compatibility alias for old callers.
 */
export function useCompanies<
  T extends Record<string, any> = Record<string, any>,
>(options: UseCompaniesOptions = {}) {
  return useCompany<T>(options)
}
