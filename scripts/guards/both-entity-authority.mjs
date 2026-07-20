// @fireux-script
// last_used: 2026-07-20
// usage_note: run through pnpm guard; locks canonical-root plus app-support entity boundaries.
// Concurrent edit — 2026-07-20 22:24 CEST — Both-Entity Authority: guard Supplier, Portfolio, Property, and Kitchen root/app separation.

import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const read = (repoRoot, relativePath) =>
  readFileSync(path.join(repoRoot, relativePath), 'utf8')

const constBlock = (source, name) => {
  const marker = `export const ${name} = {`
  const start = source.indexOf(marker)
  assert.notEqual(start, -1, `Missing ${name}.`)
  const end = source.indexOf('\n} as const', start + marker.length)
  assert.notEqual(end, -1, `Unclosed ${name}.`)
  return source.slice(start, end)
}

const directTypeFields = (source, name) => {
  const marker = `export type ${name} = {`
  const start = source.indexOf(marker)
  assert.notEqual(start, -1, `Missing ${name}.`)
  const end = source.indexOf('\n}', start + marker.length)
  assert.notEqual(end, -1, `Unclosed ${name}.`)
  return [
    ...source.slice(start + marker.length, end).matchAll(/^  ([A-Za-z][A-Za-z0-9_]*)\??:/gm),
  ].map((match) => match[1]).sort()
}

const files = {
  sharedCreate:
    'packages/core/fireux-core/src/runtime/composables/fireux/firestore/system/console/mutations/useConsoleCreate.ts',
  supplierModel:
    'packages/extensions/fireux-suppliers/src/runtime/models/supplier/Supplier.model.ts',
  supplierCollection:
    'packages/extensions/fireux-suppliers/src/runtime/composables/fireux/firestore/supplier/fetch/useSupplierCollection.ts',
  supplierInterface:
    'packages/extensions/fireux-suppliers/src/runtime/composables/fireux/firestore/supplier/utils/view/useSupplierInterface.ts',
  supplierUpdate:
    'packages/extensions/fireux-suppliers/src/runtime/composables/fireux/firestore/supplier/mutations/useSupplierUpdate.ts',
  supplierDelete:
    'packages/extensions/fireux-suppliers/src/runtime/composables/fireux/firestore/supplier/mutations/useSupplierDelete.ts',
  portfolioModel:
    'packages/extensions/fireux-properties/src/runtime/models/portfolio.model.ts',
  portfolioCollection:
    'packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/portfolio/fetch/usePortfolioCollection.ts',
  portfolioInterface:
    'packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/portfolio/utils/view/usePortfolioInterface.ts',
  portfolioUpdate:
    'packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/portfolio/mutations/usePortfolioUpdate.ts',
  propertyModel:
    'packages/extensions/fireux-properties/src/runtime/models/property.model.ts',
  propertyCollection:
    'packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/property/fetch/usePropertyCollection.ts',
  propertyInterface:
    'packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/property/utils/view/usePropertyInterface.ts',
  propertyCreate:
    'packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/property/mutations/usePropertyCreate.ts',
  propertyUpdate:
    'packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/property/mutations/usePropertyUpdate.ts',
  propertyDelete:
    'packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/property/mutations/usePropertyDelete.ts',
  portfolioPropertyCollection:
    'packages/extensions/fireux-properties/src/runtime/composables/fireux/console/portfolio/operations/Properties/fetch/usePortfolioPropertyCollection.ts',
  retiredNestedProperty:
    'packages/extensions/fireux-properties/src/runtime/composables/fireux/console/portfolio/operations/Properties/fetch/usePropertyDocument.ts',
  kitchenModel:
    'packages/extensions/fireux-kitchens/src/runtime/models/kitchen.model.ts',
}

export async function run({ repoRoot = process.cwd() } = {}) {
  const source = Object.fromEntries(
    Object.entries(files)
      .filter(([key]) => key !== 'retiredNestedProperty')
      .map(([key, relativePath]) => [key, read(repoRoot, relativePath)])
  )

  for (const [name, modelSource, modelName] of [
    ['Supplier', source.supplierModel, 'SupplierModel'],
    ['Portfolio', source.portfolioModel, 'PortfolioModel'],
    ['Property', source.propertyModel, 'PropertyModel'],
  ]) {
    assert.match(modelSource, /storage:\s*'both'/, `${name} must remain a both entity.`)
    const rootModel = constBlock(modelSource, modelName)
    assert.doesNotMatch(
      rootModel,
      /FireuxConsoleAccessModel|operator_ids|team_ids|join_requests/,
      `${name} root must not contain app access fields.`
    )
  }

  assert.match(source.supplierModel, /export const AppSupplierModel/)
  assert.match(source.portfolioModel, /export const AppPortfolioModel/)
  assert.match(source.propertyModel, /export const PropertyEntity = defineFireuxEntity/)
  assert.match(source.propertyModel, /export const AppPropertyModel/)
  assert.match(source.propertyModel, /manual\?: PropertyManual/)
  assert.doesNotMatch(constBlock(source.propertyModel, 'PropertyModel'), /manual:/)
  assert.match(constBlock(source.propertyModel, 'PropertyModel'), /portfolio_id:/)
  assert.match(constBlock(source.propertyModel, 'PropertyModel'), /place_id:/)
  assert.doesNotMatch(
    constBlock(source.propertyModel, 'PropertyIdentityModel'),
    /address_line|city|postcode|country|place_id/,
    'Property identity must reference canonical Place instead of copying Place truth.'
  )
  assert.doesNotMatch(
    constBlock(source.portfolioModel, 'PortfolioStorage'),
    /properties:/,
    'Portfolio must not own a nested duplicate Property collection.'
  )

  for (const [name, collectionSource, overlayType] of [
    ['Supplier', source.supplierCollection, 'AppSupplier'],
    ['Portfolio', source.portfolioCollection, 'AppPortfolio'],
    ['Property', source.propertyCollection, 'AppProperty'],
  ]) {
    assert.match(collectionSource, new RegExp(`type\\s+${overlayType}`))
    assert.match(
      collectionSource,
      /danglingOverlay|missing canonical|missing canonical root/i,
      `${name} collection must report dangling app records.`
    )
  }

  for (const [name, interfaceSource] of [
    ['Supplier', source.supplierInterface],
    ['Portfolio', source.portfolioInterface],
    ['Property', source.propertyInterface],
  ]) {
    assert.match(interfaceSource, /canonicalPropertyRoot|_legacy|_rootOperatorIds/)
    assert.match(interfaceSource, /operator_ids:\s*safeStringArray/)
    assert.match(interfaceSource, /team_ids:\s*safeStringArray/)
    assert.match(interfaceSource, /join_requests:\s*safeStringArray/)
    assert.doesNotMatch(
      interfaceSource,
      /\.\.\.\(parts\.overlay|\.\.\.parts\.overlay/,
      `${name} must not spread its app record over root identity.`
    )
  }

  for (const mutationSource of [
    source.supplierUpdate,
    source.supplierDelete,
    source.propertyCreate,
    source.propertyUpdate,
    source.propertyDelete,
  ]) {
    assert.doesNotMatch(mutationSource, /scope\?:|shape\?:|collectionPath\?:/)
  }
  assert.doesNotMatch(source.supplierUpdate, /commitUpdate/)
  assert.doesNotMatch(source.supplierUpdate, /useRequireUser|SupplierMutationOptions = \{\}/)
  assert.match(source.supplierUpdate, /updateSupplierRoot/)
  assert.match(source.supplierUpdate, /updateSupplierOverlay/)
  assert.match(source.supplierDelete, /deleteSupplierRoot/)
  assert.match(source.supplierDelete, /deleteSupplierOverlay/)
  assert.match(source.portfolioUpdate, /PortfolioStorage\.rootCollection/)
  assert.doesNotMatch(source.portfolioUpdate, /collectionPath/)
  assert.match(source.propertyCreate, /createPropertyConsole/)
  assert.match(source.propertyUpdate, /updatePropertyRoot/)
  assert.match(source.propertyUpdate, /updatePropertyOverlay/)
  assert.match(source.propertyDelete, /deletePropertyRoot/)
  assert.match(source.propertyDelete, /deletePropertyOverlay/)

  assert.equal(
    existsSync(path.join(repoRoot, files.retiredNestedProperty)),
    false,
    'The nested full-Property document reader must not return.'
  )
  assert.match(source.portfolioPropertyCollection, /where\('portfolio_id',\s*'=='/)
  assert.match(source.portfolioPropertyCollection, /PropertyStorage\.rootCollection/)

  assert.match(
    source.sharedCreate,
    /const rootResult = await options\.createRoot\(\)[\s\S]*const rootSnap = await getDoc\(rootRef\)[\s\S]*existingRootData = rootSnap\.data\(\)/,
    'Console attachment must re-read the root returned by createRoot before ownership checks.'
  )

  assert.deepEqual(directTypeFields(source.kitchenModel, 'AppKitchen'), [
    'created',
    'id',
    'join_requests',
    'operator_ids',
    'team_ids',
    'updated',
  ])
}
