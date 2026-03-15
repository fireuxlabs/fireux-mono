/**
 * Boundary:
 * - Suppliers provides entity + directory + ops.
 * - Kitchens consume thin supplier contracts.
 * - Suppliers must not depend on Kitchens.
 */

export * from '../fireux/firestore/profiles/Supplier/utils/view/useSupplierInterface'
export * from './ops/useSupplier'
export * from './ops/useSupplierComputed'
export * from './supplierConfig'
export * from './useSupplierCollection'
export * from './useSupplierCreate'
export * from './useSupplierDelete'
export * from './useSupplierFetch'
export * from './useSupplierList'
export * from './useSupplierQuickCreate'
export * from './useSupplierUpdate'
export * from './utils'
export * from './view/useKitchenBuyListSelection'
export * from './view/useSupplierCatalogueForKitchen'

