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
    'packages/extensions/fireux-kitchens/src/runtime/ingredient/models/ingredient.model.ts'
  )
  const ingredientRuntime = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/ingredient/utils/ingredient.ts'
  )
  const ingredientEntity = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/ingredient/models/ingredient.entity.ts'
  )
  const productModel = read(
    repoRoot,
    'packages/extensions/fireux-products/src/runtime/product/models/product.model.ts'
  )
  const productRuntime = read(
    repoRoot,
    'packages/extensions/fireux-products/src/runtime/product/utils/product.ts'
  )
  const productEntity = read(
    repoRoot,
    'packages/extensions/fireux-products/src/runtime/product/models/product.entity.ts'
  )
  const supplierItemModel = read(
    repoRoot,
    'packages/extensions/fireux-suppliers/src/runtime/supplier/models/supplier-item.model.ts'
  )
  const serverWriter = read(
    repoRoot,
    'packages/extensions/fireux-suppliers/src/runtime/supplier/server/operations/items/item.ts'
  )

  assert.match(ingredientRuntime, /export const IngredientDefaults\b/)
  assert.match(productEntity, /export const ProductEntity\s*=\s*defineFireuxEntity/)
  assert.match(productRuntime, /export const ProductDefaults\b/)
  assert.match(productRuntime, /export type ProductRead\s*=\s*\{\s*product:/)
  assert.doesNotMatch(
    productModel,
    /source_ecosystem_id|owner_type|owner_id|default_price|track_stock|\bstock:|prices:\s*\[\]/
  )
  const productNormalizer = read(
    repoRoot,
    'packages/extensions/fireux-products/src/runtime/product/utils/normalize-product.ts'
  )
  assert.match(productNormalizer, /export function normalizeProduct\(/)
  assert.match(productNormalizer, /export function normalizeProductPrice\(/)
  assert.match(productNormalizer, /export function joinProductRead\(/)
  const productDetailApi = read(
    repoRoot,
    'packages/extensions/fireux-products/src/runtime/server/api/products/[id].get.ts'
  )
  assert.match(productDetailApi, /joinProductRead\(product, prices\)/)
  assert.doesNotMatch(productDetailApi, /\.\.\.product,\s*prices/)
  const checkoutApi = read(
    repoRoot,
    'packages/extensions/fireux-products/src/runtime/server/api/stripe/create-checkout-session.post.ts'
  )
  assert.doesNotMatch(checkoutApi, /embeddedPrices|default_price|metadata\?\.stripe/)
  assert.match(supplierItemModel, /export const SupplierItemRecord\s*=\s*defineFireuxEntity/)
  assert.match(supplierItemModel, /parent:\s*'Supplier'/)
  assert.match(supplierItemModel, /product_id:\s*''/)
  assert.match(serverWriter, /FIRESTORE_MUTATION_TARGETS\.products/)
  assert.match(serverWriter, /FIRESTORE_MUTATION_TARGETS\.ingredients/)
  assert.match(serverWriter, /serverSupplierItemsTarget/)
  assert.match(serverWriter, /runGuardedServerTransaction/)

  for (const retiredUmbrella of [
    'packages/extensions/fireux-kitchens/src/runtime/ingredient/composables/firestore/useIngredient.ts',
    'packages/extensions/fireux-products/src/runtime/product/composables/firestore/useProduct.ts',
  ]) {
    assert.equal(
      existsSync(path.join(repoRoot, retiredUmbrella)),
      false,
      `${retiredUmbrella} must not restore an all-in-one entity composable.`
    )
  }

  for (const clientWriter of [
    'packages/extensions/fireux-suppliers/src/runtime/supplier/composables/firestore/mutations/useSupplierItemCreate.ts',
    'packages/extensions/fireux-suppliers/src/runtime/supplier/composables/firestore/mutations/useSupplierItemUpdate.ts',
    'packages/extensions/fireux-suppliers/src/runtime/supplier/composables/firestore/mutations/useSupplierItemDelete.ts',
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
