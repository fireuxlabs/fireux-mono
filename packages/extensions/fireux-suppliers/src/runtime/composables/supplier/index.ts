/**
 * Boundary:
 * - Suppliers provides entity + directory + ops.
 * - Kitchens consume thin supplier contracts.
 * - Suppliers must not depend on Kitchens.
 */

export * from './supplierConfig'
export * from './useSupplierCollection'
export * from './useSupplierCreate'
export * from './useSupplierDelete'
export * from './useSupplierFetch'
export * from './useSupplierList'
export * from './useSupplierQuickCreate'
export * from './useSupplierUpdate'
export * from './utils'
export * from './ops/useSupplier'
export * from './ops/useSupplierComputed'
export * from './view/useSupplierInterface'
export * from './view/useSupplierCatalogueForKitchen'
export * from './view/useKitchenBuyListSelection'
