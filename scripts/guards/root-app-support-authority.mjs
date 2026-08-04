// @fireux-script
// last_used: 2026-07-21
// usage_note: run through pnpm guard; locks canonical-root plus app-support entity boundaries.
// Concurrent edit — 2026-07-20 23:04 CEST — Both-Entity Authority: guard classification, fail-closed joins/queries, private support, and active publication.
// Concurrent edit — 2026-07-20 23:30 CEST — Entity Vocabulary + Matrix Pass: use explicit root identity and App access-support axes.
// Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: guard explicit root/App-support contracts and reject legacy access-overlay symbols.
// Concurrent edit — 2026-07-21 20:57 CEST — Kitchen Console targets: lock the authenticated exact-root projection and selected-target reuse.
// Concurrent edit — 2026-07-21 21:41 CEST — Kitchen target outcome: lock the sole authenticated target authority and complete AppKitchen writes.
// Concurrent edit — 2026-07-21 22:05 CEST — Kitchen onboarding repair: lock trusted absent-array normalization without weakening target reads.
// Concurrent edit — 2026-07-21 22:38 CEST — Console authority alignment: guard exact Blank targets and atomic writable-family onboarding.
// Concurrent edit — 2026-07-21 23:22 CEST — Console authority hardening: guard strict support reads and support-only Blank roots.

import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const read = (repoRoot, relativePath) =>
  readFileSync(path.join(repoRoot, relativePath), 'utf8')
const readFamily = (repoRoot, relativePaths) =>
  relativePaths.map((relativePath) => read(repoRoot, relativePath)).join('\n')

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

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const findMatchingDelimiter = (source, open, opening, closing) => {
  let depth = 0
  let quote = ''
  let escaped = false
  let lineComment = false
  let blockComment = false

  for (let index = open; index < source.length; index += 1) {
    const char = source[index]
    const next = source[index + 1]

    if (lineComment) {
      if (char === '\n') lineComment = false
      continue
    }
    if (blockComment) {
      if (char === '*' && next === '/') {
        blockComment = false
        index += 1
      }
      continue
    }
    if (quote) {
      if (escaped) {
        escaped = false
        continue
      }
      if (char === '\\') {
        escaped = true
        continue
      }
      if (char === quote) quote = ''
      continue
    }
    if (char === '/' && next === '/') {
      lineComment = true
      index += 1
      continue
    }
    if (char === '/' && next === '*') {
      blockComment = true
      index += 1
      continue
    }
    if (char === "'" || char === '"' || char === '`') {
      quote = char
      continue
    }
    if (char === opening) depth += 1
    if (char !== closing) continue
    depth -= 1
    if (depth === 0) return index
  }

  return -1
}

const functionBlock = (source, name) => {
  const marker = new RegExp(
    `\\basync\\s+function\\s+${escapeRegex(name)}\\s*\\(`
  ).exec(source)
  assert.ok(marker, `Missing async function ${name}.`)
  const parametersOpen = source.indexOf('(', marker.index)
  const parametersClose = findMatchingDelimiter(
    source,
    parametersOpen,
    '(',
    ')'
  )
  assert.notEqual(parametersClose, -1, `Unclosed parameters for ${name}.`)
  const bodyOpen = source.indexOf('{', parametersClose)
  const bodyClose = findMatchingDelimiter(source, bodyOpen, '{', '}')
  assert.notEqual(bodyClose, -1, `Unclosed body for ${name}.`)
  return source.slice(marker.index, bodyClose + 1)
}

const callBlocks = (source, callee) => {
  const calls = []
  const pattern = new RegExp(`\\b${escapeRegex(callee)}\\s*\\(`, 'g')
  let match

  while ((match = pattern.exec(source))) {
    const open = source.indexOf('(', match.index)
    const close = findMatchingDelimiter(source, open, '(', ')')
    assert.notEqual(close, -1, `Unclosed ${callee} call.`)
    calls.push(source.slice(match.index, close + 1))
    pattern.lastIndex = close + 1
  }

  return calls
}

const assertAtomicConsoleOnboarding = ({
  name,
  clientSource,
  clientFunction,
  route,
  handlerSource,
  completionFunction,
  onboardingSource,
  targetField,
  serverConfigSource,
  handlerPath,
}) => {
  const clientOnboarding = functionBlock(clientSource, clientFunction)
  const endpointPattern = new RegExp(`['\"]${escapeRegex(route)}['\"]`)
  const endpointCaller = endpointPattern.test(clientOnboarding)
    ? clientOnboarding
    : functionBlock(clientSource, completionFunction)
  if (endpointCaller !== clientOnboarding) {
    assert.match(
      clientOnboarding,
      new RegExp(`\\b${escapeRegex(completionFunction)}\\s*\\(`),
      `${name} live Console creation must delegate to its trusted onboarding client.`
    )
  }
  assert.match(
    endpointCaller,
    endpointPattern,
    `${name} live Console creation must call its trusted onboarding endpoint.`
  )
  assert.match(endpointCaller, /getIdToken\(\)|authHeaders\(\)/)
  assert.match(
    endpointCaller,
    /Authorization:\s*`Bearer \$\{token\}`|headers:\s*await authHeaders\(\)/
  )
  assert.doesNotMatch(
    clientOnboarding,
    /\buseConsoleCreate\s*\(/,
    `${name} live Console creation must not use the generic multi-step client writer.`
  )
  assert.doesNotMatch(
    clientOnboarding,
    /\bcreate[A-Za-z0-9]*Root(?:Result)?\s*\(|\b(?:setDocument|setDoc|updateDoc|addDoc)\s*\(|createAppSupport\s*:/,
    `${name} live Console creation must not perform a root or App-support write around the endpoint.`
  )

  assert.match(handlerSource, /defineEventHandler/)
  assert.match(handlerSource, /readBody\(event\)/)
  assert.match(
    handlerSource,
    new RegExp(`\\b${escapeRegex(completionFunction)}\\s*\\(`),
    `${name} onboarding route must delegate to its trusted transaction.`
  )

  assert.match(onboardingSource, /requireFirebaseBearerUser\(event\)/)
  assert.match(onboardingSource, /getRuntimeFirestore\(\)/)
  const transactions = callBlocks(onboardingSource, 'runTransaction')
  assert.equal(
    transactions.length,
    1,
    `${name} onboarding must use exactly one Firestore transaction.`
  )
  const transactionSource = transactions[0]
  assert.match(transactionSource, /^runTransaction\s*\(\s*async\s+transaction\s*=>/)
  assert.match(
    transactionSource,
    /transaction\.get\([^\n]*(?:membershipRef|current\.membershipRef)/,
    `${name} onboarding must read current UserApp authority inside the transaction.`
  )
  assert.match(
    transactionSource,
    /transaction\.create\(\s*rootRef,/,
    `${name} onboarding must create its canonical root inside the transaction.`
  )
  assert.match(
    transactionSource,
    /transaction\.create\(supportRef,[\s\S]*operator_ids:[\s\S]*team_ids:[\s\S]*join_requests:/,
    `${name} onboarding must create a complete same-id App support record inside the transaction.`
  )
  assert.match(
    transactionSource,
    new RegExp(
      `transaction\\.update\\((?:current\\.)?membershipRef,[\\s\\S]*['\"]console_targets\\.${escapeRegex(targetField)}['\"]`
    ),
    `${name} onboarding must update the UserApp target index in the same transaction.`
  )

  if (!serverConfigSource) return
  assert.match(
    serverConfigSource,
    new RegExp(
      `route:\\s*['\"]${escapeRegex(route)}['\"][\\s\\S]*method:\\s*['\"]post['\"][\\s\\S]*handler:\\s*['\"]${escapeRegex(handlerPath)}['\"]`
    ),
    `${name} trusted onboarding route must remain registered by its owning package.`
  )
}

const files = {
  metaModel:
    'packages/core/fireux-core/src/runtime/models/core/meta.model.ts',
  consoleAccess:
    'packages/core/fireux-core/src/runtime/composables/fireux/app/console/useConsoleAccess.ts',
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
  supplierServerConfig:
    'packages/extensions/fireux-suppliers/src/config/module/server-config.ts',
  supplierOnboardingHandler:
    'packages/extensions/fireux-suppliers/src/runtime/server/api/suppliers/onboarding/complete.post.ts',
  supplierOnboarding:
    'packages/extensions/fireux-suppliers/src/runtime/server/supplier/onboarding.ts',
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
  portfolioOnboardingHandler:
    'packages/extensions/fireux-properties/src/runtime/server/api/portfolios/onboarding/complete.post.ts',
  portfolioOnboarding:
    'packages/extensions/fireux-properties/src/runtime/server/portfolio/onboarding.ts',
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
  propertyCreateUtility:
    'packages/extensions/fireux-properties/src/runtime/utils/property-create.ts',
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
  propertyOnboardingHandler:
    'packages/extensions/fireux-properties/src/runtime/server/api/properties/onboarding/complete.post.ts',
  propertyOnboarding:
    'packages/extensions/fireux-properties/src/runtime/server/property/onboarding.ts',
  activePortfolio:
    'packages/extensions/fireux-properties/src/runtime/composables/fireux/console/portfolio/operations/useActivePortfolio.ts',
  portfolioPropertyCollection:
    'packages/extensions/fireux-properties/src/runtime/composables/fireux/console/portfolio/operations/Properties/fetch/usePortfolioPropertyCollection.ts',
  retiredNestedProperty:
    'packages/extensions/fireux-properties/src/runtime/composables/fireux/console/portfolio/operations/Properties/fetch/usePropertyDocument.ts',
  kitchenModel:
    'packages/extensions/fireux-kitchens/src/runtime/models/kitchen.model.ts',
  kitchenSpine:
    'packages/extensions/fireux-kitchens/src/runtime/utils/kitchen-spine.ts',
  kitchenDemoTargets:
    'packages/extensions/fireux-kitchens/src/runtime/demo/kitchen/core/targets.ts',
  kitchenTargetModel:
    'packages/extensions/fireux-kitchens/src/runtime/models/kitchen/kitchen-index.model.ts',
  kitchenTargetCollection:
    'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/console/kitchen/index/useKitchenConsoleTargetCollection.ts',
  kitchenInterface:
    'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/kitchen/utils/view/useKitchenInterface.ts',
  kitchenConsoleIndex:
    'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/console/kitchen/index/useKitchenConsoleIndex.ts',
  kitchenConsole:
    'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/console/kitchen/core/useKitchenConsole.ts',
  kitchenTargetApi:
    'packages/extensions/fireux-kitchens/src/runtime/server/api/console/kitchen/targets.get.ts',
  kitchenPublicProjection:
    'packages/extensions/fireux-kitchens/src/runtime/server/kitchen/public-projection.ts',
  kitchenTargetResolver:
    'packages/extensions/fireux-kitchens/src/runtime/server/kitchen/console-targets.ts',
  kitchenCreate:
    'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/kitchen/mutations/useKitchenCreate.ts',
  kitchenUpdate:
    'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/kitchen/mutations/useKitchenUpdate.ts',
  kitchenOnboardingHandler:
    'packages/extensions/fireux-kitchens/src/runtime/server/api/kitchens/onboarding/complete.post.ts',
  kitchenOnboarding:
    'packages/extensions/fireux-kitchens/src/runtime/server/kitchen/onboarding.ts',
  kitchenOnboardingPolicy:
    'packages/extensions/fireux-kitchens/src/runtime/server/kitchen/onboarding-policy.ts',
  kitchenTestCreate:
    'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/kitchen/mutations/useKitchenTestCreate.ts',
  kitchenTestScenario:
    'packages/extensions/fireux-kitchens/src/runtime/test/kitchen/scenario.ts',
  kitchenServerConfig:
    'packages/extensions/fireux-kitchens/src/config/module/server-config.ts',
  blankCollection:
    'projects/fireux/fireux-blank/app/composables/fireux/firestore/blank/useBlank.ts',
  blankModel:
    'projects/fireux/fireux-blank/app/models/blank.model.ts',
  blankOnboardingHandler:
    'projects/fireux/fireux-blank/server/api/console/blank/onboarding.post.ts',
  blankOnboarding:
    'projects/fireux/fireux-blank/server/utils/blank/onboarding.ts',
  miseboxRules:
    'packages/ecosystem/fireux-misebox/src/config/firebase/firestore.template.rules',
}

const sourceFamilies = {
  propertyCollection: [
    files.propertyCollection,
    'packages/extensions/fireux-properties/src/runtime/composables/fireux/firestore/property/fetch/property-collection-contract.ts',
  ],
  kitchenDemoTargets: [
    'packages/extensions/fireux-kitchens/src/runtime/demo/kitchen/core/target-builders.ts',
    files.kitchenDemoTargets,
  ],
  miseboxRules: [
    files.miseboxRules,
    'packages/ecosystem/fireux-misebox/src/config/firebase/rules/kitchen-operations.rules',
  ],
}

export async function run({ repoRoot = process.cwd() } = {}) {
  const source = Object.fromEntries(
    Object.entries(files)
      .filter(([key]) => !key.startsWith('retired'))
      .map(([key, relativePath]) => [
        key,
        readFamily(repoRoot, sourceFamilies[key] ?? [relativePath]),
      ])
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
  assert.match(
    source.consoleAccess,
    /export function readConsoleTargetAuthority[\s\S]*operator_ids[\s\S]*team_ids[\s\S]*join_requests/,
    'Shared Console access must retain strict validation for every complete App-support authority array.'
  )
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
    assert.match(
      collectionSource,
      /readConsoleTargetAuthority[\s\S]*malformedAppSupport/,
      `${name} target reads must fail closed on malformed App-support authority.`
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
  assert.match(
    source.propertyOnboarding,
    /canonicalPropertyRoot/,
    'Trusted Property onboarding must validate an existing or newly planned canonical root.'
  )
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
  assert.match(source.propertyCreateUtility, /publication_state:\s*'draft'/)

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

  assert.match(
    source.blankCollection,
    /const targetIds = computed\([\s\S]*unref\(options\.targetIds\)/,
    'Blank live targets must be bounded by the UserApp target ids supplied by the family core.'
  )
  assert.match(
    source.blankCollection,
    /firestoreLoadDocsByIds<AppBlank>\(\{[\s\S]*collectionPath:\s*appCollectionPath,[\s\S]*ids:\s*targetIds/,
    'Blank must exact-load App support records by UserApp target id.'
  )
  assert.match(
    source.blankCollection,
    /firestoreLoadDocsByIds<Blank>\(\{[\s\S]*collectionPath:\s*rootCollectionPath,[\s\S]*ids:\s*targetIds/,
    'Blank must exact-load canonical roots by UserApp target id.'
  )
  assert.doesNotMatch(
    source.blankCollection,
    /\b(?:firestoreBindCollection|useFirestoreCollection)\s*\(|\bfsq\s*\(/,
    'Blank target loading must not restore a full root or App-support collection listener.'
  )
  assert.match(source.blankCollection, /malformed App support authority/)
  assert.match(source.blankCollection, /App support id mismatch/)
  assert.match(source.blankCollection, /root\/App scope mismatch/)

  assertAtomicConsoleOnboarding({
    name: 'Blank',
    clientSource: source.blankCollection,
    clientFunction: 'createBlank',
    route: '/api/console/blank/onboarding',
    handlerSource: source.blankOnboardingHandler,
    completionFunction: 'completeBlankOnboarding',
    onboardingSource: source.blankOnboarding,
    targetField: 'blank_ids',
  })
  assertAtomicConsoleOnboarding({
    name: 'Kitchen',
    clientSource: source.kitchenCreate,
    clientFunction: 'createKitchenConsole',
    route: '/api/kitchens/onboarding/complete',
    handlerSource: source.kitchenOnboardingHandler,
    completionFunction: 'completeKitchenOnboarding',
    onboardingSource: source.kitchenOnboarding,
    targetField: 'kitchen_ids',
    serverConfigSource: source.kitchenServerConfig,
    handlerPath: './runtime/server/api/kitchens/onboarding/complete.post',
  })
  assertAtomicConsoleOnboarding({
    name: 'Supplier',
    clientSource: source.supplierCreate,
    clientFunction: 'createSupplierConsole',
    route: '/api/suppliers/onboarding/complete',
    handlerSource: source.supplierOnboardingHandler,
    completionFunction: 'completeSupplierOnboarding',
    onboardingSource: source.supplierOnboarding,
    targetField: 'supplier_ids',
    serverConfigSource: source.supplierServerConfig,
    handlerPath: './runtime/server/api/suppliers/onboarding/complete.post',
  })
  assertAtomicConsoleOnboarding({
    name: 'Portfolio',
    clientSource: source.portfolioCreate,
    clientFunction: 'createPortfolioConsole',
    route: '/api/portfolios/onboarding/complete',
    handlerSource: source.portfolioOnboardingHandler,
    completionFunction: 'completePortfolioOnboarding',
    onboardingSource: source.portfolioOnboarding,
    targetField: 'portfolio_ids',
    serverConfigSource: source.propertyServerConfig,
    handlerPath: './runtime/server/api/portfolios/onboarding/complete.post',
  })
  assertAtomicConsoleOnboarding({
    name: 'Property',
    clientSource: source.propertyCreate,
    clientFunction: 'createPropertyConsole',
    route: '/api/properties/onboarding/complete',
    handlerSource: source.propertyOnboardingHandler,
    completionFunction: 'completePropertyOnboarding',
    onboardingSource: source.propertyOnboarding,
    targetField: 'property_ids',
    serverConfigSource: source.propertyServerConfig,
    handlerPath: './runtime/server/api/properties/onboarding/complete.post',
  })

  const blankRootType = source.blankModel.slice(
    source.blankModel.indexOf('export type Blank ='),
    source.blankModel.indexOf('export type AppBlank =')
  )
  assert.doesNotMatch(
    blankRootType,
    /operator_ids|team_ids|join_requests/,
    'Blank root identity must not duplicate App-support access authority.'
  )
  assert.match(
    source.blankModel,
    /export const BlankModel[\s\S]*export const AppBlankModel[\s\S]*export type BlankSurface[\s\S]*Pick<AppBlank, 'operator_ids' \| 'team_ids' \| 'join_requests'>/,
    'Blank Console surfaces must project access explicitly from AppBlank support.'
  )
  const blankRootCreate = callBlocks(
    source.blankOnboarding,
    'transaction.create'
  ).find(call => /transaction\.create\(rootRef,/.test(call))
  assert.ok(blankRootCreate, 'Blank onboarding must create its root in the transaction.')
  assert.doesNotMatch(
    blankRootCreate,
    /operator_ids|team_ids|join_requests/,
    'Blank onboarding must keep access authority out of the canonical root.'
  )
  assert.doesNotMatch(
    source.portfolioOnboarding,
    /TrustedRepair|missingFields|app_scope:\s*FieldValue\.delete/,
    'Portfolio onboarding must reject malformed support/scope instead of adding a compatibility repair seam.'
  )

  assert.deepEqual(directTypeFields(source.kitchenModel, 'AppKitchen'), [
    'created',
    'id',
    'join_requests',
    'operator_ids',
    'team_ids',
    'updated',
  ])
  assert.match(
    source.kitchenModel,
    /Omit<[\s\S]*FireuxConsoleEntityIdentity,[\s\S]*'image_url' \| 'gallery'[\s\S]*>/,
    'Kitchen identity must exclude Place-owned media.'
  )
  assert.match(
    source.kitchenModel,
    /card_image_url\?: string[\s\S]*card_image_url: ''/,
    'Kitchen identity must declare one sparse card-image override without copying Place media.'
  )
  assert.match(
    source.kitchenInterface,
    /cardImageUrl = safeString\(identity\.cardImageUrl\)[\s\S]*cardImageUrl \|\|[\s\S]*placeImageUrl \|\|[\s\S]*identity\.logoImageUrl/,
    'Kitchen cards must prefer the explicit Kitchen card image, then inherit Place media, then fall back to the Kitchen logo.'
  )
  assert.match(
    source.kitchenInterface,
    /function consoleTarget\([\s\S]*kitchenIdentity\.logoImageUrl \|\| target\.logo_image_url[\s\S]*imageKind:\s*'brand'/,
    'Kitchen Console targets must use the Kitchen-owned logo as brand identity without substituting Place photography.'
  )
  assert.match(
    source.kitchenPublicProjection,
    /cardImageUrl\s*\|\|\s*parts\.place\.coverImage\s*\|\|\s*parts\.place\.imageUrl/,
    'The public Kitchen directory must resolve the Kitchen card override, then Place cover, then Place image.'
  )
  assert.match(
    source.kitchenUpdate,
    /moveString\('identity\.card_image_url', 'identity\.card_image_url'\)/,
    'An empty Kitchen card-image override must delete itself so the card inherits Place again.'
  )
  assert.doesNotMatch(
    source.kitchenSpine,
    /normalizeFireuxAppScopeState|dedicated_app/,
    'Kitchen readers must accept only current exact App scope vocabulary.'
  )
  assert.match(
    source.kitchenDemoTargets,
    /app_scope:\s*\{\s*state:\s*'parent_app',\s*app_id:\s*input\.identity\.appId/,
    'Every Demo Kitchen must carry the same explicit App relationship as its access-only Demo support.'
  )
  assert.match(
    source.kitchenDemoTargets,
    /publicPlace:\s*PublicPlaceProjection[\s\S]*normalizePublicPlaceProjection[\s\S]*hasExactPublicPlaceProjectionShape\(item\.publicPlace\)/,
    'Every Demo Kitchen target must expose its Place through the exact shared public collection-row projection.'
  )
  assert.match(
    source.kitchenDemoTargets,
    /logoImageUrl:\s*string[\s\S]*!logoImageUrl[\s\S]*placeMedia\.includes\(logoImageUrl\)/,
    'Every Demo Kitchen must provide Kitchen-owned logo media distinct from its Place photography.'
  )

  assert.match(source.kitchenTargetModel, /KITCHEN_CONSOLE_TARGET_LIMIT = 50/)
  assert.match(source.kitchenTargetModel, /type KitchenConsoleTargetsResponse/)
  assert.doesNotMatch(
    source.kitchenTargetCollection,
    /firebase\/firestore|useKitchenCollection|useKitchenFetch/,
    'Kitchen live Console targets must not regress to browser Firestore reads.'
  )
  assert.match(
    source.kitchenTargetCollection,
    /\/api\/console\/kitchen\/targets/
  )
  assert.match(source.kitchenTargetCollection, /getIdToken\(\)/)
  assert.match(source.kitchenTargetCollection, /Authorization:\s*`Bearer/)
  assert.match(
    source.kitchenTargetCollection,
    /kitchen-console-targets-\$\{appId\}-\$\{uid\.value/
  )
  assert.match(source.kitchenTargetCollection, /dedupe:\s*'defer'/)
  assert.match(source.kitchenTargetCollection, /useFirestoreCollectionState/)
  assert.match(source.kitchenTargetCollection, /value\.requestUid !== uid\.value/)
  assert.match(source.kitchenTargetCollection, /value\.response\.appId !== appId/)
  assert.match(source.kitchenConsoleIndex, /targets:\s*targetCollection/)
  assert.doesNotMatch(
    source.kitchenConsoleIndex,
    /useConsoleTargets|resolveOutcome/,
    'Kitchen Console index must not overlay the authenticated projection with a second browser membership outcome.'
  )
  assert.doesNotMatch(
    source.kitchenConsoleIndex,
    /useKitchenCollection|KitchenCollectionFilter/,
    'Kitchen Console index must consume the authenticated target projection.'
  )
  assert.match(source.kitchenConsole, /useKitchenConsoleTargetCollection/)
  assert.match(source.kitchenConsole, /targets:\s*liveTargetCollection/)
  assert.match(source.kitchenConsole, /source:\s*directFetchSource/)
  assert.match(
    source.kitchenConsole,
    /kitchenSource\.value === 'test' \? 'test' : 'demo'/,
    'Selected live Kitchens must reuse the server projection instead of useKitchenFetch.'
  )

  assert.match(source.kitchenTargetApi, /requireFirebaseBearerUser/)
  assert.match(source.kitchenTargetApi, /useFireUXConfig\(\)/)
  assert.match(source.kitchenTargetApi, /getRuntimeFirestore\(\)/)
  assert.match(
    source.kitchenTargetApi,
    /resolveKitchenConsoleTargetIds\(event,\s*currentMembership\)/
  )
  assert.match(source.kitchenTargetResolver, /KITCHEN_CONSOLE_TARGET_LIMIT/)
  assert.match(
    source.kitchenTargetResolver,
    /ids\.length > KITCHEN_CONSOLE_TARGET_LIMIT/
  )
  assert.match(source.kitchenTargetApi, /readCanonicalKitchenScope/)
  assert.match(source.kitchenTargetApi, /keys\.length !== 2/)
  assert.match(source.kitchenTargetApi, /state !== 'parent_app'/)
  assert.match(source.kitchenTargetApi, /state !== 'tenant_app'/)
  assert.match(source.kitchenTargetApi, /'app_scope_state'/)
  assert.match(source.kitchenTargetApi, /'app_scope_app_id'/)
  assert.match(source.kitchenTargetApi, /db\.getAll/)
  assert.match(source.kitchenTargetApi, /readKitchenOnboardingSupport/)
  assert.match(source.kitchenTargetApi, /authority\.operatorIds\.includes\(uid\)/)
  assert.match(source.kitchenTargetApi, /authority\.teamIds\.includes\(uid\)/)
  assert.match(source.kitchenTargetApi, /Cache-Control': 'private, no-store'/)
  assert.doesNotMatch(
    source.kitchenTargetApi,
    /getQuery|readBody|\.\.\.root\b|\.\.\.support\b/,
    'Kitchen target projection must accept no caller scope and emit no raw record spreads.'
  )
  assert.match(
    source.kitchenServerConfig,
    /route:\s*'\/api\/console\/kitchen\/targets'[\s\S]*method:\s*'get'[\s\S]*runtime\/server\/api\/console\/kitchen\/targets\.get/
  )
  assert.match(
    source.kitchenCreate,
    /\/api\/kitchens\/onboarding\/complete/
  )
  assert.match(source.kitchenCreate, /getIdToken\(\)/)
  assert.match(source.kitchenCreate, /Authorization:\s*`Bearer/)
  assert.doesNotMatch(
    source.kitchenCreate,
    /\buseConsoleCreate\s*\(|createAppSupport|normalizeKitchenRootScope|createKitchenPayload|createKitchenRoot|setDocument/,
    'Kitchen Console creation must use the atomic trusted onboarding transaction.'
  )
  assert.match(
    source.kitchenCreate,
    /function createKitchen\([\s\S]*return createKitchenConsole\(input, createOptions\)/,
    'Every Live Kitchen create entrypoint must delegate to trusted onboarding.'
  )
  assert.match(
    source.kitchenOnboarding,
    /transaction\.create\(supportRef,[\s\S]*operator_ids:[\s\S]*team_ids:[\s\S]*join_requests:/,
    'Trusted Kitchen onboarding must seed every AppKitchen authority array.'
  )
  assert.doesNotMatch(
    source.kitchenOnboarding,
    /readKitchenOnboardingSupportForTrustedRepair|missingFields|app_scope_state:\s*FieldValue\.delete|app_scope_app_id:\s*FieldValue\.delete/,
    'Pre-release Kitchen onboarding must reject malformed roots/support instead of repairing legacy shapes.'
  )
  assert.doesNotMatch(
    source.kitchenOnboardingPolicy,
    /const flatState|const flatAppId|app_scope_state\)\s*\|\||app_scope_app_id\)\s*\|\||normalizeFireuxAppScopeState|dedicated_app/,
    'Kitchen scope authority must read only the exact current nested App scope.'
  )
  assert.match(
    source.kitchenOnboardingPolicy,
    /unsupported field:[\s\S]*boundedIds\(value\.operator_ids[\s\S]*boundedIds\(value\.team_ids[\s\S]*value\.join_requests/,
    'AppKitchen support must reject domain payload and require the three access arrays.'
  )
  for (const pattern of [
    /PlaceStorage\.collection/,
    /KitchenStorage\.rootCollection/,
    /KitchenStorage\.scopeCollection/,
    /writeBatch\(simulationDb\)/,
    /batch\.set\(placeRef/,
    /batch\.set\(kitchenRef/,
    /batch\.set\(supportRef/,
  ]) {
    assert.match(
      source.kitchenTestCreate,
      pattern,
      'A Test Kitchen must atomically create its canonical Place, Kitchen root, and access-only App support.'
    )
  }
  assert.match(
    source.kitchenTestScenario,
    /state:\s*'parent_app'[\s\S]*appSupport:\s*\{[\s\S]*scenario\.kitchen\.id !== scenario\.place\.id[\s\S]*scenario\.kitchen\.id !== scenario\.appSupport\.id/,
    'The static Kitchen Test seed must retain its same-App Kitchen, Place, and access-only AppKitchen relationship.'
  )
  assert.doesNotMatch(
    source.kitchenTestScenario,
    /state:\s*'root_only'/,
    'A Test Kitchen associated with App support must not claim root_only scope.'
  )
  for (const [name, sources, retiredPath] of [
    [
      'Supplier',
      [source.supplierCollection, source.supplierFetch, source.supplierCreate],
      'test-suppliers',
    ],
    [
      'Portfolio',
      [source.portfolioCollection, source.portfolioCreate],
      'test-portfolios',
    ],
    [
      'Property',
      [source.propertyCollection],
      'test-properties',
    ],
  ]) {
    for (const testSource of sources) {
      assert.doesNotMatch(
        testSource,
        new RegExp(retiredPath),
        `${name} Test must not use an ad hoc default-database collection.`
      )
    }
    assert.ok(
      sources.some(testSource =>
        testSource.includes('no canonical simulation producer exists')
      ),
      `${name} Test must fail closed until a canonical simulation producer exists.`
    )
  }
  assert.match(
    source.miseboxRules,
    /function hasBoundedKitchenAuthority\(\)[\s\S]*operator_ids is list[\s\S]*team_ids is list[\s\S]*join_requests is list[\s\S]*join_requests\.size\(\) <= 100;/,
    'Misebox Rules must reject AppKitchen records missing any authority array.'
  )
  assert.match(
    source.miseboxRules,
    /function kitchenAuthorityUnchanged\(\)[\s\S]*operator_ids == resource\.data\.operator_ids[\s\S]*team_ids == resource\.data\.team_ids[\s\S]*join_requests == resource\.data\.join_requests;/,
    'Non-admin Kitchen writers must not change AppKitchen authority arrays.'
  )
}
