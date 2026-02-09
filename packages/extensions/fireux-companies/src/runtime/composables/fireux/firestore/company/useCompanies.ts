import { useCompanyCollection } from './fetch/useCompanyCollection'

export interface UseCompaniesOptions {
  collectionPath?: string
}

export function useCompanies<
  T extends Record<string, any> = Record<string, any>,
>(options: UseCompaniesOptions = {}) {
  const { collectionPath, collection, count } = useCompanyCollection<T>(
    options.collectionPath ?? 'companies'
  )

  return { collectionPath, collection, count }
}
