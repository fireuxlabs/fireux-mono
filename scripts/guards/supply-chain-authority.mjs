// @fireux-script
// last_used: 2026-08-09
// usage_note: run through pnpm guard; locks the Ingredient -> Product -> Supplier Item entity and trusted relationship-writer contract.

import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const read = (repoRoot, relativePath) =>
  readFileSync(path.join(repoRoot, relativePath), 'utf8')

export async function run({ repoRoot = process.cwd() } = {}) {
  const ingredientModel = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/models/ingredient.model.ts'
  )
  const productModel = read(
    repoRoot,
    'packages/extensions/fireux-products/src/runtime/models/product.model.ts'
  )
  const supplierItemModel = read(
    repoRoot,
    'packages/extensions/fireux-suppliers/src/runtime/models/supplier/supplier-item.model.ts'
  )
  const serverWriter = read(
    repoRoot,
    'packages/extensions/fireux-suppliers/src/runtime/server/supplier/operations/items/item.ts'
  )

  assert.match(ingredientModel, /export const IngredientDefaults\b/)
  assert.match(productModel, /export const ProductEntity\s*=\s*defineFireuxEntity/)
  assert.match(productModel, /export const ProductDefaults\b/)
  assert.match(supplierItemModel, /export const SupplierItemRecord\s*=\s*defineFireuxEntity/)
  assert.match(supplierItemModel, /parent:\s*'Supplier'/)
  assert.match(supplierItemModel, /product_id:\s*''/)
  assert.match(serverWriter, /FIRESTORE_MUTATION_TARGETS\.products/)
  assert.match(serverWriter, /FIRESTORE_MUTATION_TARGETS\.ingredients/)
  assert.match(serverWriter, /serverSupplierItemsTarget/)
  assert.match(serverWriter, /runGuardedServerTransaction/)

  for (const retiredUmbrella of [
    'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/ingredient/useIngredient.ts',
    'packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/product/useProduct.ts',
  ]) {
    assert.equal(
      existsSync(path.join(repoRoot, retiredUmbrella)),
      false,
      `${retiredUmbrella} must not restore an all-in-one entity composable.`
    )
  }

  for (const clientWriter of [
    'packages/extensions/fireux-suppliers/src/runtime/composables/fireux/firestore/supplier/mutations/useSupplierItemCreate.ts',
    'packages/extensions/fireux-suppliers/src/runtime/composables/fireux/firestore/supplier/mutations/useSupplierItemUpdate.ts',
    'packages/extensions/fireux-suppliers/src/runtime/composables/fireux/firestore/supplier/mutations/useSupplierItemDelete.ts',
  ]) {
    const source = read(repoRoot, clientWriter)
    assert.match(source, /\$fetch/)
    assert.doesNotMatch(
      source,
      /firebase\/firestore|useFirestore(?:ClientCreate|Update|Delete)/,
      `${clientWriter} must use the trusted Supplier Item server command.`
    )
  }
}
