/**
 * Boundary:
 * - Suppliers provides entity + directory + ops.
 * - Kitchens consume thin supplier contracts.
 * - Suppliers must not depend on Kitchens.
 */

export * from './constants'
export * from './ops/useSupplier'
export * from './ops/useSupplierComputed'
export * from './useSupplierCollection'
export * from './useSupplierCreate'
export * from './useSupplierDelete'
export * from './useSupplierEnsure'
export * from './useSupplierFetch'
export * from './useSupplierInterface'
export * from './useSupplierList'
export * from './useSupplierQuickCreate'
export * from './useSupplierRecord'
export * from './useSupplierUpdate'
export * from './utils'
export * from './view/useKitchenBuyListSelection'
export * from './view/useSupplierCatalogueForKitchen'
