#!/usr/bin/env node
// @fireux-script
// manual_entrypoint: true
// last_used: 2026-08-09
// usage_note: read-only audit of Product -> Supplier Item and optional Ingredient relationship integrity in the Misebox owner database.

import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { parseArgs } from './_lib/args.mjs'
import {
  resolveEcosystemFirebaseTarget,
  resolveFirebaseAdminCredential,
} from './_lib/firebase-admin-credentials.mjs'

const args = parseArgs(process.argv.slice(2))
const ecosystem = String(args.ecosystem || 'misebox').trim()
const databaseId = String(args.database || 'misebox').trim()
const target = await resolveEcosystemFirebaseTarget(ecosystem)
const auth = await resolveFirebaseAdminCredential({
  args,
  scope: ecosystem,
  projectId: target.projectId,
})
const app = initializeApp(
  {
    credential: auth.credential,
    projectId: target.projectId || auth.projectId,
  },
  `product-supplier-items-${ecosystem}-${databaseId}`
)
const db = getFirestore(app, databaseId)

const text = value => String(value ?? '').trim()
const issues = []
const issue = (kind, context = {}) => issues.push({ kind, ...context })

const [ingredientSnapshot, productSnapshot, supplierSnapshot] = await Promise.all([
  db.collection('ingredients').get(),
  db.collection('products').get(),
  db.collection('suppliers').get(),
])
const ingredientIds = new Set(ingredientSnapshot.docs.map(doc => doc.id))
const productIds = new Set(productSnapshot.docs.map(doc => doc.id))

for (const doc of productSnapshot.docs) {
  const product = doc.data() || {}
  if (text(product.id) && text(product.id) !== doc.id) {
    issue('product_id_mismatch', {
      product_id: doc.id,
      stored_id: text(product.id),
      name: text(product.name),
      product_type: text(product.product_type),
      keys: Object.keys(product).sort(),
    })
  }
  if (text(product.slug) && text(product.slug) !== doc.id) {
    issue('product_slug_mismatch', {
      product_id: doc.id,
      stored_slug: text(product.slug),
    })
  }
  if (!text(product.name)) issue('product_name_missing', { product_id: doc.id })
}

let supplierIngredientCount = 0
let supplierItemCount = 0
for (const supplierDoc of supplierSnapshot.docs) {
  const supplierId = supplierDoc.id
  const supplier = supplierDoc.data() || {}
  const [supplierIngredientSnapshot, supplierItemSnapshot] = await Promise.all([
    supplierDoc.ref.collection('ingredients').get(),
    supplierDoc.ref.collection('items').get(),
  ])
  supplierIngredientCount += supplierIngredientSnapshot.size
  supplierItemCount += supplierItemSnapshot.size

  for (const ingredientId of Array.isArray(supplier.linked_ingredient_ids)
    ? supplier.linked_ingredient_ids.map(text).filter(Boolean)
    : []) {
    if (!ingredientIds.has(ingredientId)) {
      issue('supplier_linked_ingredient_missing', { supplier_id: supplierId, ingredient_id: ingredientId })
    }
  }

  for (const doc of supplierIngredientSnapshot.docs) {
    const value = doc.data() || {}
    const ingredientId = text(value.ingredient_id || doc.id)
    if (text(value.supplier_id) !== supplierId) {
      issue('supplier_ingredient_supplier_mismatch', {
        supplier_id: supplierId,
        supplier_ingredient_id: doc.id,
        stored_supplier_id: text(value.supplier_id),
      })
    }
    if (ingredientId !== doc.id) {
      issue('supplier_ingredient_id_mismatch', {
        supplier_id: supplierId,
        supplier_ingredient_id: doc.id,
        stored_ingredient_id: ingredientId,
      })
    }
    if (!ingredientIds.has(ingredientId)) {
      issue('supplier_ingredient_root_missing', { supplier_id: supplierId, ingredient_id: ingredientId })
    }
    const preferredProductId = text(value.preferred_product_id)
    if (preferredProductId && !productIds.has(preferredProductId)) {
      issue('supplier_ingredient_preferred_product_missing', {
        supplier_id: supplierId,
        ingredient_id: ingredientId,
        product_id: preferredProductId,
      })
    }
  }

  for (const doc of supplierItemSnapshot.docs) {
    const value = doc.data() || {}
    const productId = text(value.product_id)
    const ingredientId = text(value.ingredient_id)
    if (text(value.id) && text(value.id) !== doc.id) {
      issue('supplier_item_id_mismatch', {
        supplier_id: supplierId,
        supplier_item_id: doc.id,
        stored_id: text(value.id),
      })
    }
    if (text(value.supplier_id) !== supplierId) {
      issue('supplier_item_supplier_mismatch', {
        supplier_id: supplierId,
        supplier_item_id: doc.id,
        stored_supplier_id: text(value.supplier_id),
      })
    }
    if (!productId) {
      issue('supplier_item_product_missing', { supplier_id: supplierId, supplier_item_id: doc.id })
    } else if (!productIds.has(productId)) {
      issue('supplier_item_product_root_missing', {
        supplier_id: supplierId,
        supplier_item_id: doc.id,
        product_id: productId,
      })
    }
    if (ingredientId && !ingredientIds.has(ingredientId)) {
      issue('supplier_item_ingredient_root_missing', {
        supplier_id: supplierId,
        supplier_item_id: doc.id,
        ingredient_id: ingredientId,
      })
    }
  }
}

console.log(JSON.stringify({
  project_id: target.projectId || auth.projectId,
  database_id: databaseId,
  read_only: true,
  counts: {
    ingredients: ingredientSnapshot.size,
    products: productSnapshot.size,
    suppliers: supplierSnapshot.size,
    supplier_ingredients: supplierIngredientCount,
    supplier_items: supplierItemCount,
    issues: issues.length,
  },
  issues,
}, null, 2))

if (issues.length) process.exitCode = 2
