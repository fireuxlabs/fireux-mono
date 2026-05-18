import { useProductCollection } from './fetch/useProductCollection'
import { useProductFetch } from './fetch/useProductFetch'
import { useProductCreate } from './mutations/useProductCreate'
import { useProductDelete } from './mutations/useProductDelete'
import { useProductUpdate } from './mutations/useProductUpdate'
import { useProductPrices } from './price/fetch/useProductPrices'
import { useProductFormatting } from './utils/useProductFormatting'
import { useProductComputed } from './utils/view/useProductComputed'
import { useProductInterface } from './utils/view/useProductInterface'

export {
  useProductCollection,
  useProductFetch,
  useProductCreate,
  useProductUpdate,
  useProductDelete,
  useProductPrices,
  useProductFormatting,
  useProductComputed,
  useProductInterface,
}

/**
 * FireUX stack family: Publishable root entity.
 * Entity: Product.
 * Canon:
 * - docs/fireux-canon.md
 * - packages/core/fireux-docs/src/runtime/concepts/stacks/README.md
 * Contract:
 * - packages/extensions/fireux-products/docs/contract.md
 *
 * This file is the single Product family entry seam.
 * ProductPrice remains a documented child reader exception; Product
 * authoring state belongs to the Product family, not fireux/app by default.
 */
export function useProduct() {
  return {
    ...useProductCollection(),
    ...useProductFetch(),
    ...useProductCreate(),
    ...useProductUpdate(),
    ...useProductDelete(),
    ...useProductPrices(),
    ...useProductFormatting(),
    ...useProductComputed(),
    ...useProductInterface(),
  }
}
