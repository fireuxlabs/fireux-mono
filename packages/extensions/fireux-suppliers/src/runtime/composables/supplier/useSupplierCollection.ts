import { useSupplierFetch } from './useSupplierFetch'

export function useSupplierCollection() {
  const { coreSuppliers } = useSupplierFetch()

  return {
    coreSuppliers,
  }
}
