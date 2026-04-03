import { useSupplierFetch } from './useSupplierFetch'

type UseSupplierCollectionOptions = {
  collectionPath?: string
}

export function useSupplierCollection(options: UseSupplierCollectionOptions = {}) {
  const { coreSuppliers } = useSupplierFetch(options)

  return {
    coreSuppliers,
  }
}
