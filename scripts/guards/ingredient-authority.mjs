// @fireux-script
// last_used: 2026-07-26
// usage_note: run through pnpm guard; locks the language-neutral server-projected Ingredient root and strict Kitchen reference boundary.

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { expandFirestoreRulesTemplate } from '../../packages/core/fireux-core/src/config/firebase/rules/compose.mjs'

const read = (repoRoot, relativePath) =>
  readFileSync(path.join(repoRoot, relativePath), 'utf8')

const nthIndex = (source, marker, occurrence) => {
  let index = -1
  for (let count = 0; count <= occurrence; count += 1) {
    index = source.indexOf(marker, index + 1)
    assert.notEqual(
      index,
      -1,
      `Missing occurrence ${occurrence + 1} of ${marker}.`
    )
  }
  return index
}

const balancedBlock = (source, marker, occurrence = 0) => {
  const markerIndex = nthIndex(source, marker, occurrence)
  const opening = source.indexOf('{', markerIndex + marker.length)
  assert.notEqual(opening, -1, `Missing opening block for ${marker}.`)

  let depth = 0
  for (let index = opening; index < source.length; index += 1) {
    if (source[index] === '{') depth += 1
    else if (source[index] === '}') depth -= 1
    if (depth === 0) return source.slice(markerIndex, index + 1)
  }
  assert.fail(`Unclosed block for ${marker}.`)
}

const arrayDeclaration = (source, name) => {
  const marker = `const ${name} = [`
  const start = source.indexOf(marker)
  assert.notEqual(start, -1, `Missing ${name}.`)
  const opening = source.indexOf('[', start)
  let depth = 0
  for (let index = opening; index < source.length; index += 1) {
    if (source[index] === '[') depth += 1
    else if (source[index] === ']') depth -= 1
    if (depth === 0) return source.slice(start, index + 1)
  }
  assert.fail(`Unclosed ${name}.`)
}

export async function run({ repoRoot = process.cwd() } = {}) {
  const runtimeBase = 'packages/extensions/fireux-kitchens/src/runtime/'
  const ingredientBase = `${runtimeBase}ingredient/`
  const kitchenBase = `${runtimeBase}kitchen/`
  const rules = await expandFirestoreRulesTemplate(
    read(
      repoRoot,
      'packages/ecosystem/fireux-misebox/src/config/firebase/firestore.template.rules'
    )
  )
  const deploy = read(repoRoot, 'scripts/deploy-misebox-firestore-rules.mjs')
  const model = read(repoRoot, `${ingredientBase}models/ingredient.model.ts`)
  const entity = read(repoRoot, `${ingredientBase}models/ingredient.entity.ts`)
  const foodGroupModel = read(
    repoRoot,
    `${ingredientBase}models/ingredient-food-group.ts`
  )
  const ingredientNormalizer = read(
    repoRoot,
    `${ingredientBase}server/normalize.ts`
  )
  const curation = [
    'curation.ts',
    'curation-authority.ts',
    'curation-input.ts',
    'curation-storage.ts',
  ]
    .map((fileName) => read(repoRoot, `${ingredientBase}server/${fileName}`))
    .join('\n')
  const createSystem = read(
    repoRoot,
    `${ingredientBase}components/Create/System.vue`
  )
  const curatorIndex = read(
    repoRoot,
    `${runtimeBase}server/api/internal/ingredients/index.get.ts`
  )
  const directoryApi = read(
    repoRoot,
    `${runtimeBase}server/api/ingredients/index.get.ts`
  )
  const detailApi = read(
    repoRoot,
    `${runtimeBase}server/api/ingredients/[id].get.ts`
  )
  const collection = read(
    repoRoot,
    `${ingredientBase}composables/firestore/fetch/useIngredientCollection.ts`
  )
  const detail = read(
    repoRoot,
    `${ingredientBase}composables/firestore/fetch/useIngredientFetch.ts`
  )
  const create = read(
    repoRoot,
    `${ingredientBase}composables/firestore/mutations/useIngredientCreate.ts`
  )
  const update = read(
    repoRoot,
    `${ingredientBase}composables/firestore/mutations/useIngredientUpdate.ts`
  )
  const kitchenDemoIngredients = read(
    repoRoot,
    `${kitchenBase}demo/operations/Ingredients/index.ts`
  )
  const kitchenDemoTypes = read(repoRoot, `${kitchenBase}demo/core/types.ts`)
  const kitchenWorkspaceIngredients = read(
    repoRoot,
    `${kitchenBase}composables/workspace/Ingredients/useKitchenWorkspaceIngredients.ts`
  )
  const kitchenWorkspaceIngredientRead = read(
    repoRoot,
    `${kitchenBase}components/Workspace/Ingredients/Read.vue`
  )
  const kitchenIngredientRoots = read(
    repoRoot,
    `${kitchenBase}composables/workspace/Ingredients/fetch/useKitchenIngredientRoots.ts`
  )
  const supplierWorkspaceIngredients = read(
    repoRoot,
    'packages/extensions/fireux-suppliers/src/runtime/supplier/composables/workspace/operations/Ingredients/useSupplierWorkspaceIngredients.ts'
  )
  const productDemoBase =
    'projects/misebox/misebox-app/app/composables/product-demo/'
  const productDemo = [
    'useMiseboxProductDemo.ts',
    'loadMiseboxProductDemo.ts',
    'projectMiseboxProductDemoWorkspaceFoundations.ts',
  ]
    .map((fileName) => read(repoRoot, `${productDemoBase}${fileName}`))
    .join('\n')
  const promotionManifest = JSON.parse(
    read(repoRoot, 'scripts/data/misebox-kitchen-ingredient-promotion.json')
  )
  const catalogAudit = read(
    repoRoot,
    'scripts/audit-misebox-ingredient-catalog.mjs'
  )
  const catalogCompletion = read(
    repoRoot,
    'scripts/complete-misebox-ingredient-catalog.mjs'
  )
  const catalogCompletionManifest = JSON.parse(
    read(repoRoot, 'scripts/data/misebox-ingredient-catalog-completion.json')
  )

  assert.match(entity, /identity:\s*'root'/)
  assert.match(foodGroupModel, /\bexport const INGREDIENT_FOOD_GROUP_OPTIONS\b/)
  assert.match(foodGroupModel, /\bexport const resolveIngredientFoodGroup\b/)
  assert.match(
    kitchenWorkspaceIngredientRead,
    /\bINGREDIENT_FOOD_GROUP_OPTIONS\b/
  )
  assert.match(kitchenWorkspaceIngredientRead, /\bresolveIngredientFoodGroup\b/)
  assert.doesNotMatch(
    kitchenWorkspaceIngredientRead,
    /\bconst (?:INGREDIENT_FOOD_GROUP_OPTIONS|resolveFoodGroup)\b/,
    'Kitchen Ingredient presentation must consume the shared food-group resolver.'
  )
  for (const [label, source] of [
    ['Ingredient model', model],
    ['Ingredient normalizer', ingredientNormalizer],
    ['Ingredient curator', curation],
  ]) {
    assert.doesNotMatch(
      source,
      /\b(?:source_language|default_language|names|translations|sproochli|locale|locales)\b/,
      `${label} must keep language and Sproochli fields outside Ingredient identity.`
    )
  }
  for (const [label, source] of [
    ['Ingredient collection', collection],
    ['Ingredient detail', detail],
    ['Ingredient create', create],
    ['Ingredient update', update],
  ]) {
    assert.doesNotMatch(
      source,
      /firebase\/firestore|useFirestoreRead|useFirestoreCreate|useFirestoreUpdate/,
      `${label} must not access canonical Ingredient roots through the browser Firestore SDK.`
    )
  }
  assert.match(collection, /\$fetch(?:<[^>]+>)?\(['"]\/api\/ingredients['"]\)/)
  assert.match(
    detail,
    /\$fetch(?:<[^>]+>)?\(\s*`\/api\/ingredients\/\$\{encodeURIComponent\(/
  )
  assert.match(
    create,
    /\$fetch(?:<[^>]+>)?\(\s*['"]\/api\/internal\/ingredients['"]/
  )
  assert.match(
    update,
    /\$fetch(?:<[^>]+>)?\(\s*`\/api\/internal\/ingredients\/\$\{encodeURIComponent\(/
  )
  assert.match(directoryApi, /\bgetRuntimeFirestore\s*\(/)
  assert.match(directoryApi, /\bnormalizeIngredient\b/)
  assert.match(directoryApi, /item\?\.status === 'active'/)
  assert.match(directoryApi, /MAX_EXACT_IDS\s*=\s*100/)
  assert.match(detailApi, /\bgetRuntimeFirestore\s*\(/)
  assert.match(detailApi, /\bnormalizeIngredient\b/)
  assert.match(detailApi, /ingredient\.status !== 'active'/)
  assert.doesNotMatch(
    `${directoryApi}\n${detailApi}`,
    /firebase\/firestore/,
    'Ingredient APIs must use the trusted Admin boundary.'
  )
  assert.match(ingredientNormalizer, /schema_version:\s*2/)
  assert.doesNotMatch(
    ingredientNormalizer,
    /\.\.\.source/,
    'Ingredient normalization must project canonical fields explicitly.'
  )
  assert.doesNotMatch(
    `${ingredientNormalizer}\n${directoryApi}\n${detailApi}\n${collection}\n${detail}`,
    /PublicIngredient|ingredient-public|public-projection|public-ingredient/
  )
  assert.match(curation, /return\s*{\s*schema_version:\s*2/)
  assert.match(curation, /Object\.hasOwn\(existing\.data \|\| {}, 'id'\)/)
  assert.match(curation, /assertUniqueActiveIngredientIdentity/)
  assert.match(curation, /candidateTerms/)
  assert.match(curation, /ingredient\.status !== 'active'/)
  assert.match(curation, /listIngredientsForCurator/)
  assert.match(curation, /status === 'active' && !canonicalImageUrl/)
  assert.match(curation, /An active Ingredient requires an image\./)
  assert.match(createSystem, /<UFormField label="Image" required>/)
  assert.match(createSystem, /imageUploading \|\| !form\.image_url/)
  assert.match(curatorIndex, /listIngredientsForCurator\(event\)/)
  assert.match(collection, /['"]\/api\/internal\/ingredients['"]/)
  assert.doesNotMatch(
    kitchenDemoIngredients,
    /\bIngredientModel\b|\bimage_url\s*:|\bname\s*:|\baliases\s*:|\bcategory\s*:|\bkind\s*:/,
    'Kitchen Demo Ingredient records must contain links, never copied root identity.'
  )
  assert.doesNotMatch(
    kitchenDemoTypes,
    /\bingredients\s*:\s*Ingredient\[\]/,
    'Kitchen Demo scenarios must not own root Ingredient records.'
  )
  assert.match(
    kitchenDemoIngredients,
    /\bingredient_id:\s*definition\.ingredientId/
  )
  assert.match(
    `${kitchenIngredientRoots}\n${kitchenWorkspaceIngredients}`,
    /\/api\/ingredients\?ids=\$\{encodeURIComponent\(/
  )
  assert.match(
    kitchenWorkspaceIngredients,
    /firestoreField:\s*['"]\/ingredients\/\{ingredientId\}\.image_url['"]/
  )
  assert.match(
    kitchenWorkspaceIngredients,
    /canonicalStorageObject:\s*['"]ingredients\/\{ingredientId\}\/image_url['"]/
  )
  assert.match(kitchenWorkspaceIngredients, /kitchenRecordOwnsImage:\s*false/)
  assert.match(supplierWorkspaceIngredients, /\buseSupplierIngredientRoots\b/)
  assert.match(productDemo, /\bloadIngredientRoots\b/)
  assert.match(productDemo, /\bingredientRoots:\s*workspaceIngredientRoots\b/)
  assert.match(productDemo, /\bconst workspaceIngredientRootById = new Map\b/)
  assert.match(
    productDemo,
    /imageUrl = String\(ingredient\.image_url \|\| ''\)\.trim\(\)/
  )
  assert.match(
    productDemo,
    /name = String\(ingredient\.name \|\| ''\)\.trim\(\)/
  )
  assert.match(productDemo, /foodGroup:\s*resolveIngredientFoodGroup\(\{/)
  assert.match(productDemo, /category:\s*ingredient\.category/)
  assert.match(productDemo, /kind:\s*ingredient\.kind/)
  assert.match(productDemo, /\bingredients:\s*workspaceIngredients\b/)
  assert.equal(
    promotionManifest.format,
    'fireux-misebox-kitchen-ingredient-promotion/1'
  )
  assert.equal(promotionManifest.entries?.length, 68)
  assert.equal(
    new Set(promotionManifest.entries.map((entry) => entry.ingredient_id)).size,
    68,
    'The reviewed Kitchen Ingredient promotion manifest must contain 68 unique canonical ids.'
  )
  const linkedIngredientIds = [
    ...kitchenDemoIngredients.matchAll(/\bingredientId:\s*'([^']+)'/g),
  ].map((match) => match[1])
  const promotedIngredientIds = promotionManifest.entries.map(
    (entry) => entry.ingredient_id
  )
  assert.deepEqual(
    [...new Set(linkedIngredientIds)].sort(),
    [...promotedIngredientIds].sort(),
    'Every Demo Kitchen Ingredient link must resolve through the reviewed canonical promotion manifest.'
  )
  assert.equal(
    catalogCompletionManifest.format,
    'fireux-misebox-ingredient-catalog-completion/1'
  )
  assert.equal(catalogCompletionManifest.expected_root_count, 141)
  assert.equal(catalogCompletionManifest.image_ids?.length, 51)
  assert.equal(
    new Set(catalogCompletionManifest.image_ids).size,
    51,
    'The global Ingredient completion manifest must contain 51 unique image repair ids.'
  )
  assert.equal(catalogCompletionManifest.created_by_repair_ids?.length, 18)
  assert.equal(
    new Set(catalogCompletionManifest.created_by_repair_ids).size,
    18,
    'The global Ingredient completion manifest must contain 18 unique stamp repair ids.'
  )
  assert.match(
    catalogCompletionManifest.policy,
    /complete canonical root catalog; independent of every Kitchen, Supplier, Demo world, menu, and use/
  )
  assert.match(
    catalogAudit,
    /complete canonical root catalog; independent of every Kitchen, Supplier, Demo world, menu, and use/
  )
  assert.match(
    catalogCompletion,
    /complete canonical Ingredient root collection; independent of Kitchen, Supplier, Demo, menu, and use/
  )
  assert.match(catalogCompletion, /root_creates:\s*0/)
  assert.match(catalogCompletion, /root_deletes:\s*0/)
  assert.match(catalogCompletion, /storage_overwrites:\s*0/)
  assert.match(catalogCompletion, /kitchen_or_supplier_writes:\s*0/)
  assert.match(catalogCompletion, /operational_writes:\s*0/)
  assert.match(
    catalogCompletion,
    /allowPendingRepairs && manifest\.created_by_repair_ids\.includes\(id\)/
  )
  assert.match(
    catalogCompletion,
    /validateRoot\(root, manifest, \{ allowPendingRepairs: !complete \}\)/
  )

  const rootIngredient = balancedBlock(
    rules,
    'match /ingredients/{ingredientId}'
  )
  assert.match(
    rootIngredient,
    /allow get, list, create, update, delete: if false;/
  )
  assert.match(rootIngredient, /match \/\{nested=\*\*\}/)

  const rootKitchen = balancedBlock(rules, 'match /kitchens/{kitchenId}')
  const scopedIngredient = balancedBlock(
    rootKitchen,
    'match /ingredients/{ingredientId}'
  )
  for (const token of [
    "data.keys().hasAll([\n                'ingredient_id',\n                'created',\n                'updated'",
    "data.keys().hasOnly([\n                'ingredient_id',\n                'created',\n                'updated'",
    'data.ingredient_id == ingredientId',
    "data.created.keys().hasAll(['at', 'by', 'app_id'])",
    'data.created.app_id == workspaceManagementAppId(',
    "workspaceRootPath('kitchens', kitchenId)",
    "data.updated.keys().hasAll(['at', 'by'])",
    '/documents/ingredients/$(ingredientId)',
    ".data.status == 'active'",
    'request.resource.data.created.at == request.time',
    'request.resource.data.created.by == request.auth.uid',
    'request.resource.data.updated.at == request.time',
    'request.resource.data.updated.by == request.auth.uid',
    'request.resource.data.created == resource.data.created',
    "affectedKeys().hasOnly([\n              'updated'",
  ]) {
    assert.ok(
      scopedIngredient.includes(token),
      `Kitchen Ingredient Rules must retain ${token}.`
    )
  }
  assert.match(
    scopedIngredient,
    /allow create: if \(canOperateWorkspace\('kitchens', kitchenId\)\)[\s\S]*hasActiveCanonicalIngredient\(\)/
  )
  assert.match(
    scopedIngredient,
    /allow delete: if canOperateWorkspace\('kitchens', kitchenId\);/
  )
  const scopedNested = balancedBlock(scopedIngredient, 'match /{nested=**}')
  assert.match(
    scopedNested,
    /allow get, list, create, update, delete: if false;/
  )

  const genericChild = balancedBlock(
    rootKitchen,
    'match /{childCollection}/{childId}'
  )
  const genericNestedIndex = genericChild.indexOf('match /{nested=**}')
  assert.notEqual(
    genericNestedIndex,
    -1,
    'Kitchen generic child Rules must retain their recursive branch.'
  )
  const genericDirect = genericChild.slice(0, genericNestedIndex)
  const genericNested = balancedBlock(genericChild, 'match /{nested=**}')
  for (const source of [genericDirect, genericNested]) {
    assert.match(source, /isGenericKitchenChildCollection\(\)/)
    assert.match(
      source,
      /allow get, list: if isGenericKitchenChildCollection\(\)/
    )
    assert.match(
      source,
      /allow create, update: if isGenericKitchenChildCollection\(\)/
    )
    assert.match(source, /allow delete: if isGenericKitchenChildCollection\(\)/)
  }
  const genericCollection = balancedBlock(
    genericChild,
    'function isGenericKitchenChildCollection()'
  )
  for (const protectedCollection of ['ingredients', 'orders', 'sales']) {
    assert.match(
      genericCollection,
      new RegExp(`['"]${protectedCollection}['"]`)
    )
  }

  const blockers = arrayDeclaration(deploy, 'BLOCKED_PRODUCTION_ROOTS')
  assert.doesNotMatch(
    blockers,
    /['"]ingredients['"]/,
    'Ingredient must not remain a production blocker after the server projection cutover.'
  )
  const defaultDenied = arrayDeclaration(deploy, 'defaultDeniedRoots')
  assert.match(
    defaultDenied,
    /['"]ingredients['"]/,
    'Rules security tests must keep raw Ingredient roots in the default-denied set.'
  )
  for (const testName of [
    'App admin must use the Ingredient projection API for root detail',
    'App admin cannot create a root Ingredient in the browser',
    'Kitchen operator can select an active canonical Ingredient',
    'Kitchen Ingredient id must match its document id',
    'Kitchen operator cannot select a missing canonical Ingredient',
    'Kitchen operator cannot select an inactive canonical Ingredient',
    'Kitchen Ingredient update cannot change its canonical reference',
    'Kitchen operator cannot create nested Ingredient data',
  ]) {
    assert.ok(
      deploy.includes(testName),
      `Misebox Rules harness must retain: ${testName}.`
    )
  }
}
