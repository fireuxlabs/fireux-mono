// @fireux-script
// last_used: 2026-07-20
// usage_note: run through pnpm guard; locks canonical-root plus app-support entity boundaries.
// Concurrent edit — 2026-07-20 23:04 CEST — Both-Entity Authority: guard classification, fail-closed joins/queries, private support, and active publication.
// Concurrent edit — 2026-07-20 23:30 CEST — Entity Vocabulary + Matrix Pass: use explicit root identity and App access-support axes.
// Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: guard explicit root/App-support contracts and reject legacy access-overlay symbols.

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

const assertNoStorageSelectorsInApiTypes = (source, label) => {
  const apiTypeBlocks = [
    ...source.matchAll(
      /(?:export\s+)?type\s+[A-Za-z][A-Za-z0-9]*(?:Options|Input)\s*=\s*\{[\s\S]*?\n\}/g
    ),
  ].map((match) => match[0])

  for (const block of apiTypeBlocks) {
    assert.doesNotMatch(
      block,
      /\b(?:scope|shape|collectionPath)\s*\??:/,
      `${label} API types must not accept caller-selected storage paths.`
    )
  }
}

const files = {
  metaModel:
    'packages/core/fireux-core/src/runtime/models/core/meta.model.ts',
  sharedCreate:
    'packages/core/fireux-core/src/runtime/composables/fireux/firestore/system/console/mutations/useConsoleCreate.ts',
  entityModel:
    'packages/core/fireux-core/src/runtime/models/core/entity.model.ts',
  supplierModel:
    'packages/extensions/fireux-suppliers/src/runtime/models/supplier/Supplier.model.ts',
  supplierCollection:
    'packages/extensions/fireux-suppliers/src/runtime/composables/fireux/firestore/supplier/fetch/useSupplierCollection.ts',
  supplierFetch:
    'packages/extensions/fireux-suppliers/src/runtime/composables/fireux/firestore/supplier/fetch/useSupplierFetch.ts',
  supplierInterface:
    'packages/extensions/fireux-suppliers/src/runtime/composables/fireux/firestore/supplier/utils/view/useSupplierInterface.ts',
  supplierCreate:
    'packages/extensions/fireux-suppliers/src/runtime/composables/fireux/firestore/supplier/mutations/useSupplierCreate.ts',
  supplierUpdate:
    'packages/extensions/fireux-suppliers/src/runtime/composables/fireux/firestore/supplier/mutations/useSupplierUpdate.ts',
  supplierUse:
    'packages/extensions/fireux-suppliers/src/runtime/composables/fireux/firestore/supplier/useSupplier.ts',
  retiredSupplierDelete:
    'packages/extensions/fireux-suppliers/src/runtime/composables/fireux/firestore/supplier/mutations/useSupplierDelete.ts',
  portfolioModel:
    'packages/extensions/fireux-properties/src/runtime/models/portfolio.model.ts',
  portfolioCollection:
    'packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/portfolio/fetch/usePortfolioCollection.ts',
  portfolioFetch:
    'packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/portfolio/fetch/usePortfolioFetch.ts',
  portfolioInterface:
    'packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/portfolio/utils/view/usePortfolioInterface.ts',
  portfolioCreate:
    'packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/portfolio/mutations/usePortfolioCreate.ts',
  portfolioUpdate:
    'packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/portfolio/mutations/usePortfolioUpdate.ts',
  portfolioUse:
    'packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/portfolio/usePortfolio.ts',
  retiredPortfolioDelete:
    'packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/portfolio/mutations/usePortfolioDelete.ts',
  propertyModel:
    'packages/extensions/fireux-properties/src/runtime/models/property.model.ts',
  propertyCollection:
    'packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/property/fetch/usePropertyCollection.ts',
  propertyFetch:
    'packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/property/fetch/usePropertyFetch.ts',
  propertyInterface:
    'packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/property/utils/view/usePropertyInterface.ts',
  propertyCreate:
    'packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/property/mutations/usePropertyCreate.ts',
  propertyUpdate:
    'packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/property/mutations/usePropertyUpdate.ts',
  propertyUse:
    'packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/property/useProperty.ts',
  retiredPropertyDelete:
    'packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/property/mutations/usePropertyDelete.ts',
  propertyPublicModel:
    'packages/extensions/fireux-properties/src/runtime/models/property-index.model.ts',
  propertyPublicManager:
    'packages/extensions/fireux-properties/src/runtime/components/Property/Collection/Manager.vue',
  propertyPublicAdapter:
    'packages/extensions/fireux-properties/src/runtime/composables/fireux/property/usePublicPropertyIndex.ts',
  propertyPublicApi:
    'packages/extensions/fireux-properties/src/runtime/server/api/properties/index.get.ts',
  propertyServerConfig:
    'packages/extensions/fireux-properties/src/config/module/server-config.ts',
  activePortfolio:
    'packages/extensions/fireux-properties/src/runtime/composables/fireux/console/portfolio/operations/useActivePortfolio.ts',
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
      .filter(([key]) => !key.startsWith('retired'))
      .map(([key, relativePath]) => [key, read(repoRoot, relativePath)])
  )

  for (const [name, modelSource, modelName] of [
    ['Supplier', source.supplierModel, 'SupplierModel'],
    ['Portfolio', source.portfolioModel, 'PortfolioModel'],
    ['Property', source.propertyModel, 'PropertyModel'],
  ]) {
    assert.match(
      modelSource,
      /identity:\s*'root'[\s\S]*appSupport:\s*'access-record'/,
      `${name} must remain a root entity with an App access-support record.`
    )
    const rootModel = constBlock(modelSource, modelName)
    assert.doesNotMatch(
      rootModel,
      /FireuxConsoleAccessModel|operator_ids|team_ids|join_requests/,
      `${name} root must not contain app access fields.`
    )
    assert.match(modelSource, /appSupport:\s*'apps\/\{appId\}\//)
    assert.match(modelSource, /appSupportCollection:\s*'/)
    assert.doesNotMatch(
      modelSource,
      /FireuxAppOverlay|overlayCollection:/,
      `${name} access records must use explicit App support vocabulary.`
    )
  }

  assert.match(source.supplierModel, /export const AppSupplierModel/)
  assert.match(source.portfolioModel, /export const AppPortfolioModel/)
  assert.match(source.metaModel, /export const FireuxAppAccessRecordModel/)
  assert.match(source.metaModel, /export type FireuxAppAccessRecord/)
  assert.doesNotMatch(source.metaModel, /FireuxAppOverlay/)
  assert.match(source.propertyModel, /export const PropertyEntity = defineFireuxEntity/)
  assert.match(source.entityModel, /\| 'property'/)
  assert.match(source.propertyModel, /family:\s*\['property',\s*'console-entity'\]/)
  assert.match(source.propertyModel, /export const AppPropertyModel/)
  assert.match(source.propertyModel, /export type AppProperty = FireuxAppAccessRecord/)
  assert.match(
    source.propertyModel,
    /apps\/\{appId\}\/properties\/\{propertyId\}\/private\/manual/
  )
  assert.doesNotMatch(source.propertyModel, /AppProperty[^\n]*manual|manual\?: PropertyManual/)
  assert.doesNotMatch(constBlock(source.propertyModel, 'PropertyModel'), /manual:/)
  assert.match(constBlock(source.propertyModel, 'PropertyModel'), /portfolio_id:/)
  assert.match(constBlock(source.propertyModel, 'PropertyModel'), /place_id:/)
  assert.match(constBlock(source.propertyModel, 'PropertyModel'), /publication_state:/)
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

  for (const [name, collectionSource, appSupportType] of [
    ['Supplier', source.supplierCollection, 'AppSupplier'],
    ['Portfolio', source.portfolioCollection, 'AppPortfolio'],
    ['Property', source.propertyCollection, 'AppProperty'],
  ]) {
    assert.match(collectionSource, new RegExp(`type\\s+${appSupportType}`))
    assert.match(
      collectionSource,
      /targetedAppSupportSource\s*=\s*firestoreLoadDocsByIds/,
      `${name} id-target reads must exact-load same-id App access records.`
    )
    assert.match(
      collectionSource,
      /danglingAppSupport|missing canonical|missing canonical root/i,
      `${name} collection must report dangling app records.`
    )
    assert.match(
      collectionSource,
      /requestedTargetPairError/,
      `${name} collection must report an incomplete requested root/App pair.`
    )
    assert.match(
      collectionSource,
      /rootScopeError/,
      `${name} collection must report root/App scope drift.`
    )
    assert.doesNotMatch(
      collectionSource,
      /targetedOverlaySource|danglingOverlay|\.overlayCollection/,
      `${name} access joins must use explicit App support vocabulary.`
    )
  }
  assert.match(source.supplierCollection, /!appSupport[\s\S]*supplierRootBelongsToApp/)
  assert.match(source.portfolioCollection, /!appSupport[\s\S]*portfolioRootBelongsToApp/)
  assert.match(
    source.propertyCollection,
    /resolvedShape\.value === 'root-with-app-support'[\s\S]*!appSupport[\s\S]*root\.app_scope_app_id !== resolvedAppId\.value/
  )
  assert.doesNotMatch(
    source.propertyCollection,
    /:\s*fsq\(baseCollection\)/,
    'Property target reads must never list every AppProperty document.'
  )

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
      /\.\.\.\(parts\.appSupport|\.\.\.parts\.appSupport/,
      `${name} must not spread its app record over root identity.`
    )
  }

  for (const fixedPathSource of [
    source.supplierCreate,
    source.supplierFetch,
    source.supplierUpdate,
    source.portfolioCreate,
    source.portfolioFetch,
    source.portfolioUpdate,
    source.propertyCreate,
    source.propertyFetch,
    source.propertyUpdate,
  ]) {
    assertNoStorageSelectorsInApiTypes(fixedPathSource, 'Root/App-support read/create/update')
  }
  assert.doesNotMatch(source.supplierUpdate, /commitUpdate/)
  assert.doesNotMatch(source.supplierUpdate, /useRequireUser|SupplierMutationOptions = \{\}/)
  assert.match(source.supplierUpdate, /updateSupplierRoot/)
  assert.doesNotMatch(
    source.supplierUpdate,
    /updateSupplier(?:Overlay|AppSupport)|operator_ids|team_ids|join_requests/
  )
  assert.match(source.portfolioUpdate, /PortfolioStorage\.rootCollection/)
  assert.doesNotMatch(source.portfolioUpdate, /collectionPath/)
  assert.match(source.propertyCreate, /createPropertyConsole/)
  assert.match(source.propertyCreate, /validateRoot:/)
  assert.match(source.propertyCreate, /createPropertyManual/)
  assert.match(source.propertyUpdate, /updatePropertyRoot/)
  assert.match(source.propertyUpdate, /updatePropertyManual/)
  assert.doesNotMatch(source.propertyUpdate, /updateProperty(?:Overlay|AppSupport)/)

  for (const [name, retiredPath, useSource] of [
    ['Supplier', files.retiredSupplierDelete, source.supplierUse],
    ['Portfolio', files.retiredPortfolioDelete, source.portfolioUse],
    ['Property', files.retiredPropertyDelete, source.propertyUse],
  ]) {
    assert.equal(
      existsSync(path.join(repoRoot, retiredPath)),
      false,
      `${name} independent lifecycle delete helper must remain retired.`
    )
    assert.doesNotMatch(
      useSource,
      /use(?:Supplier|Portfolio|Property)Delete/,
      `${name} entry seam must not export an independent lifecycle delete.`
    )
  }

  assert.match(source.propertyFetch, /usePropertyManualFetch/)
  assert.match(source.propertyFetch, /PropertyManualStorage\.documentId/)
  assert.doesNotMatch(source.propertyInterface, /manual\?: PropertyManual/)
  assert.match(source.propertyInterface, /hasOnlyKeys/)
  assert.match(source.propertyInterface, /validStamp/)
  assert.match(source.propertyInterface, /typeof identity\.unit_count !== 'number'/)
  assert.match(source.propertyInterface, /Number\.isInteger\(unitCount\)/)
  assert.match(source.propertyCollection, /invalid canonical Property root/)
  assert.match(source.propertyFetch, /invalid canonical Property root/)
  assert.match(source.propertyCreate, /publication_state:\s*'draft'/)

  assert.equal(
    existsSync(path.join(repoRoot, files.retiredNestedProperty)),
    false,
    'The nested full-Property document reader must not return.'
  )
  assert.match(source.portfolioPropertyCollection, /where\('portfolio_id',\s*'=='/)
  assert.match(source.portfolioPropertyCollection, /where\('app_scope_app_id',\s*'=='/)
  assert.match(source.portfolioPropertyCollection, /PropertyStorage\.rootCollection/)
  assert.match(source.portfolioPropertyCollection, /authorizedPortfolioId/)
  assert.match(source.portfolioPropertyCollection, /runtimePortfolio\.canRead\.value/)
  assert.match(source.portfolioPropertyCollection, /runtimePortfolio\.consoleAppId\.value/)
  assert.match(source.portfolioPropertyCollection, /propertyBelongsToApp/)
  assert.match(source.portfolioPropertyCollection, /root\/App scope mismatch/)
  assert.match(source.portfolioPropertyCollection, /invalid Portfolio Property root/)
  assert.match(source.activePortfolio, /targetOutcome\.value === 'ready'/)

  assert.deepEqual(directTypeFields(source.propertyPublicModel, 'PublicPropertyIndexItem'), [
    'id',
    'image_url',
    'name',
    'property_type',
    'slug',
    'unit_count',
  ])
  assert.doesNotMatch(
    source.propertyPublicModel,
    /estimated_value|portfolio_id|place_id|operator_ids|team_ids|manual/,
    'Public Property DTO must remain a bounded card projection.'
  )
  assert.match(source.propertyPublicManager, /usePublicPropertyIndex/)
  assert.doesNotMatch(source.propertyPublicManager, /usePropertyCollection/)
  assert.match(source.propertyPublicManager, /to:\s*''/)
  assert.match(source.propertyPublicManager, /:link="false"/)
  assert.doesNotMatch(source.propertyPublicManager, /link\?:\s*boolean/)
  assert.match(source.propertyPublicAdapter, /\/api\/properties\?limit=/)
  assert.doesNotMatch(
    source.propertyPublicAdapter,
    /firebase\/firestore|usePropertyCollection/,
    'Public Property browse must use the bounded server projection.'
  )
  assert.match(source.propertyPublicApi, /canonicalPropertyRoot/)
  assert.match(source.propertyPublicApi, /Property directory source is invalid/)
  assert.match(source.propertyPublicApi, /id:\s*document\.id/)
  assert.match(source.propertyPublicApi, /canonical\.status !== 'active'/)
  assert.match(source.propertyPublicApi, /canonical\.publication_state !== 'published'/)
  assert.doesNotMatch(
    source.propertyPublicApi,
    /\.\.\.canonical/,
    'Public Property API must return an explicit allowlisted DTO, never the canonical root.'
  )
  assert.doesNotMatch(
    source.propertyPublicApi,
    /estimated_value|portfolio_id|place_id|operator_ids|team_ids|manual/,
    'Public Property API must not emit private or operational root fields.'
  )
  assert.match(source.propertyServerConfig, /route:\s*'\/api\/properties'/)
  assert.match(source.propertyServerConfig, /method:\s*'get'/)
  assert.match(source.propertyServerConfig, /runtime\/server\/api\/properties\/index\.get/)

  assert.match(
    source.sharedCreate,
    /const rootResult = await options\.createRoot\(\)[\s\S]*const rootSnap = await getDoc\(rootRef\)[\s\S]*existingRootData = rootSnap\.data\(\)/,
    'Console attachment must re-read the root returned by createRoot before ownership checks.'
  )
  assert.match(source.sharedCreate, /validateRoot\?:/)
  assert.match(source.sharedCreate, /await options\.validateRoot\(id, existingRootData\)/)
  assert.match(source.sharedCreate, /createAppSupport\?:/)
  assert.match(source.sharedCreate, /createdAppSupport:/)
  assert.doesNotMatch(
    source.sharedCreate,
    /createOverlay|createdOverlay|overlayId/,
    'Console creation must use App support vocabulary and fixed same-id records.'
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
