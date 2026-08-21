// @fireux-script
// last_used: 2026-08-19
// usage_note: locks the Kitchen Directory and canonical Entity Detail reads.
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const file = (repoRoot, relativePath) => path.join(repoRoot, relativePath)
const read = (repoRoot, relativePath) =>
  readFileSync(file(repoRoot, relativePath), 'utf8')

export async function run({ repoRoot = process.cwd() } = {}) {
  const base = 'packages/extensions/fireux-kitchens/src/runtime/'
  const serverConfig = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/config/module/server-config.ts'
  )
  const kitchenBase = `${base}kitchen/`
  const canonicalCollectionPath = `${kitchenBase}composables/firestore/fetch/useKitchenCollection.ts`
  const retiredCollectionPath = `${base}composables/fireux/kitchen/usePublicKitchenIndex.ts`
  const retiredIdentityReadPath = `${kitchenBase}server/identity/public-projection.ts`
  const retiredDirectoryReadPath = `${kitchenBase}server/index/public-index.ts`
  const manager = read(
    repoRoot,
    `${kitchenBase}components/Collection/Manager.vue`
  )
  const collection = read(repoRoot, canonicalCollectionPath)
  const detail = read(repoRoot, `${kitchenBase}components/Detail/Index.vue`)
  const detailPage = read(repoRoot, `${base}pages/kitchens/[slug]/index.vue`)
  const detailReader = read(
    repoRoot,
    `${kitchenBase}composables/useKitchenDetail.ts`
  )
  const detailModel = read(
    repoRoot,
    `${kitchenBase}models/kitchen-detail.model.ts`
  )
  const indexApi = read(repoRoot, `${base}server/api/kitchens/index.get.ts`)
  const indexReader = read(repoRoot, `${kitchenBase}server/index/read.ts`)
  const detailApi = read(repoRoot, `${base}server/api/kitchens/[kitchen].get.ts`)
  const operatorPanel = read(
    repoRoot,
    `${kitchenBase}components/Detail/OperatorPanel.vue`
  )
  const identityReader = read(repoRoot, `${kitchenBase}server/identity/read.ts`)
  const sproochli = read(
    repoRoot,
    `${kitchenBase}components/Detail/Sproochli.vue`
  )
  assert.equal(
    existsSync(file(repoRoot, retiredCollectionPath)),
    false,
    'Kitchen must not restore the retired directory composable.'
  )
  assert.equal(existsSync(file(repoRoot, retiredIdentityReadPath)), false)
  assert.equal(existsSync(file(repoRoot, retiredDirectoryReadPath)), false)
  assert.match(manager, /\buseKitchenCollection\s*\(/)
  assert.match(manager, /<KitchenCollectionList :cards="cardsFiltered"/)
  assert.doesNotMatch(manager, /management_mode|Root kitchens|App kitchens/)
  assert.doesNotMatch(manager, /useKitchenFetch|firebase\/firestore/)
  assert.match(collection, /useAsyncData<Kitchen\[]>/)
  assert.match(collection, /collection:\s*ComputedRef<Kitchen\[]>/)
  assert.match(collection, /includeHidden=true/)
  assert.match(collection, /getIdToken\(\)/)
  assert.match(collection, /watch\(\s*\[hasAuthState,\s*uid\]/)
  assert.doesNotMatch(
    collection,
    /requestPreview|privilegedPreview|firebase\/firestore/
  )
  assert.match(indexApi, /requireFirebaseBearerUser/)
  assert.match(indexApi, /apps\/\$\{appId\}\/users\/\$\{uid\}/)
  assert.match(indexApi, /!isDeveloper && !isAdmin/)
  assert.match(indexApi, /Promise<Array<Kitchen & \{ place: Place \}>>/)
  assert.match(indexApi, /readKitchens/)
  assert.doesNotMatch(indexApi, /db\.collection|FieldPath|projectKitchen/)
  assert.match(indexReader, /db\.collection\('kitchens'\)/)
  assert.match(indexReader, /readKitchenRelatedRecords/)
  assert.match(indexReader, /Promise<Array<Kitchen & \{ place: Place \}>>/)
  assert.match(indexReader, /resolveKitchen/)
  assert.match(
    indexReader,
    /where\(FieldPath\.documentId\(\), '==', requestedPlaceId\)/
  )
  assert.equal(
    existsSync(file(repoRoot, `${kitchenBase}models/kitchen-directory.model.ts`)),
    false,
    'Kitchen collections must return Kitchen[] without a directory-entry model.'
  )
  assert.match(detailApi, /projectKitchenDetail/)
  assert.match(detailApi, /server\/identity\/read\.ts/)
  assert.match(detailModel, /kitchen:\s*Kitchen/)
  assert.match(detailModel, /place:\s*Place/)
  assert.match(detailModel, /presentation:\s*KitchenDetailPresentation/)
  assert.doesNotMatch(
    detailModel,
    /Team|Order|KitchenSale|MiseTask|PrepItem|private/i,
    'Kitchen Entity detail must not expose protected Workspace children.'
  )
  assert.doesNotMatch(
    identityReader,
    /collection\(['"](?:team|orders|sales|mise-tasks|prep-items|private)['"]\)/,
    'Kitchen Entity projection must not read protected Workspace children.'
  )
  for (const route of [
    '/api/kitchens/:kitchen',
    '/api/kitchens/:kitchen/fulfilment',
    '/api/kitchens/:kitchen/menu-presentation',
  ]) {
    assert.match(serverConfig, new RegExp(`route: ['"]${route}['"]`))
  }
  assert.ok(
    serverConfig.indexOf("route: '/api/kitchens/:kitchen/fulfilment'") <
      serverConfig.indexOf("route: '/api/kitchens/:kitchen'"),
    'Specific Kitchen routes must be registered before the generic Kitchen detail route.'
  )
  assert.doesNotMatch(detail, /useKitchenFetch|firebase\/firestore|ClientOnly/)
  assert.match(detail, /KitchenDetailState/)
  assert.match(detail, /:objects="\{ kitchen, place \}"/)
  assert.match(detail, /\/places\/\$\{encodeURIComponent\(kitchen\.id\)\}\/edit/)
  assert.match(detail, /KitchenDetailSproochli/)
  assert.match(detail, /\bisAdmin\.value\s*\|\|\s*isDeveloper\.value/)
  assert.match(identityReader, /readKitchenSproochliConfig/)
  assert.match(identityReader, /normalizeKitchen/)
  assert.match(identityReader, /normalizePlace/)
  assert.match(identityReader, /resolveKitchenDetailPresentation/)
  assert.match(identityReader, /requested_languages/)
  assert.match(
    identityReader,
    /const imageUrl = kitchen\.place\.cover_image \|\| kitchen\.place\.image_url/
  )
  assert.match(identityReader, /image_kind:\s*'photograph'/)
  assert.match(
    identityReader,
    /const placeId = document\.id/
  )
  assert.doesNotMatch(identityReader, /managementTarget|management_mode|management_app_id/)
  assert.doesNotMatch(identityReader, /profile_id/)
  assert.match(sproochli, /SproochliLanguageTrigger/)
  assert.match(sproochli, /resolveSproochliLanguageOptions/)
  assert.equal(
    existsSync(file(repoRoot, `${kitchenBase}components/Detail/IdentityEditor.vue`)),
    false
  )
  assert.equal(
    existsSync(file(repoRoot, `${kitchenBase}server/identity/identity-edit.ts`)),
    false
  )
  assert.match(detailPage, /\buseKitchenDetail\s*\(/)
  assert.match(detailPage, /class="kitchen-detail-route"/)
  assert.match(detailPage, /setResponseStatus\(404\)/)
  assert.doesNotMatch(detailPage, /useKitchenFetch|firebase\/firestore/)
  assert.match(detailPage, /:place="place"/)
  assert.match(detailPage, /:presentation="presentation"/)
  assert.match(detailReader, /firestoreFetchDoc<Kitchen>/)
  assert.match(detailReader, /firestoreFetchDoc<Place>/)
  assert.match(detailReader, /lastGoodKitchen/)
  assert.match(detailReader, /lastGoodPlace/)
  assert.doesNotMatch(detailModel, /PublicKitchenDetail/)
  assert.match(operatorPanel, /\buseKitchenWorkspaceTargetCollection\s*\(/)
  assert.doesNotMatch(operatorPanel, /useKitchenFetch|firebase\/firestore/)
}
