// @fireux-script
// last_used: 2026-07-24
// usage_note: locks the Kitchen public index/detail family to one bounded server projection.
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const file = (repoRoot, relativePath) => path.join(repoRoot, relativePath)
const read = (repoRoot, relativePath) =>
  readFileSync(file(repoRoot, relativePath), 'utf8')

export async function run({ repoRoot = process.cwd() } = {}) {
  const base = 'packages/extensions/fireux-kitchens/src/runtime/'
  const kitchenBase = `${base}kitchen/`
  const canonicalCollectionPath = `${kitchenBase}composables/firestore/fetch/useKitchenCollection.ts`
  const legacyPublicCollectionPath = `${base}composables/fireux/kitchen/usePublicKitchenIndex.ts`
  const manager = read(
    repoRoot,
    `${kitchenBase}components/Collection/Manager.vue`
  )
  const collection = read(repoRoot, canonicalCollectionPath)
  const detail = read(repoRoot, `${kitchenBase}components/Detail/Index.vue`)
  const identityEditor = read(
    repoRoot,
    `${kitchenBase}components/Detail/IdentityEditor.vue`
  )
  const detailPage = read(repoRoot, `${base}pages/kitchens/[slug]/index.vue`)
  const indexApi = read(repoRoot, `${base}server/api/kitchens/index.get.ts`)
  const detailApi = read(repoRoot, `${base}server/api/kitchens/[slug].get.ts`)
  const operatorPanel = read(
    repoRoot,
    `${kitchenBase}components/Detail/OperatorPanel.vue`
  )
  const publicIdentity = read(
    repoRoot,
    `${kitchenBase}server/identity/public-identity.ts`
  )
  const publicProjection = read(
    repoRoot,
    `${kitchenBase}server/identity/public-projection.ts`
  )
  const sproochli = read(
    repoRoot,
    `${kitchenBase}components/Detail/Sproochli.vue`
  )
  assert.equal(
    existsSync(file(repoRoot, legacyPublicCollectionPath)),
    false,
    'Kitchen must not restore a second public-index composable.'
  )
  assert.match(manager, /\buseKitchenCollection\s*\(/)
  assert.match(manager, /Root kitchens/)
  assert.match(manager, /Console kitchens/)
  assert.match(manager, /App kitchens/)
  assert.doesNotMatch(manager, /useKitchenFetch|firebase\/firestore/)
  assert.match(collection, /\/api\/kitchens\?limit=/)
  assert.match(collection, /includeHidden=true/)
  assert.match(collection, /getIdToken\(\)/)
  assert.match(collection, /watch\(\s*\[hasAuthState,\s*uid\]/)
  assert.doesNotMatch(
    collection,
    /requestPreview|privilegedPreview|firebase\/firestore/
  )
  assert.match(indexApi, /db\.collection\('kitchens'\)/)
  assert.match(
    indexApi,
    /document\.data\.visibility === false && !includeHidden/
  )
  assert.match(indexApi, /requireFirebaseBearerUser/)
  assert.match(indexApi, /apps\/\$\{appId\}\/users\/\$\{uid\}/)
  assert.match(indexApi, /!isDeveloper && !isAdmin/)
  assert.match(indexApi, /projectPublicKitchenIndexItem/)
  assert.match(
    indexApi,
    /where\(FieldPath\.documentId\(\), '==', requestedPlaceId\)/
  )
  assert.match(detailApi, /projectPublicKitchenDetail/)
  assert.match(indexApi, /public-projection\.ts/)
  assert.match(detailApi, /public-projection\.ts/)
  assert.doesNotMatch(detail, /useKitchenFetch|firebase\/firestore|ClientOnly/)
  assert.match(detail, /KitchenDetailIdentityEditor/)
  assert.match(detail, /KitchenDetailSproochli/)
  assert.match(detail, /\bisAdmin\.value\s*\|\|\s*isDeveloper\.value/)
  assert.match(publicProjection, /readKitchenSproochliConfig/)
  assert.match(publicProjection, /requested_languages/)
  assert.match(
    publicProjection,
    /cardImageUrl\s*\|\|\s*parts\.place\.coverImage\s*\|\|\s*parts\.place\.imageUrl/
  )
  assert.match(publicProjection, /image_kind:\s*imageKind/)
  assert.match(
    publicProjection,
    /management_mode:\s*parts\.managementTarget\?\.mode\s*\|\|\s*['"]root['"]/
  )
  assert.doesNotMatch(publicProjection, /profile_id/)
  assert.match(sproochli, /SproochliLanguageTrigger/)
  assert.match(sproochli, /resolveSproochliLanguageOptions/)
  assert.match(
    identityEditor,
    /\/api\/kitchens\/\$\{encodeURIComponent\(props\.kitchen\.slug\)\}\/identity/
  )
  assert.doesNotMatch(identityEditor, /firebase\/firestore|useKitchenUpdate/)
  assert.match(identityEditor, /\buseImageStorage\b/)
  assert.match(
    identityEditor,
    /kitchens\/\$\{props\.kitchen\.id\}\/identity\/logo\/current/
  )
  assert.match(
    identityEditor,
    /kitchens\/\$\{props\.kitchen\.id\}\/identity\/card\/current/
  )
  assert.doesNotMatch(
    identityEditor,
    /type="url"|Logo image URL|Card image URL/
  )
  assert.match(publicIdentity, /requireFirebaseBearerUser/)
  assert.match(publicIdentity, /requireFirebaseStorageDownloadUrl/)
  assert.match(publicIdentity, /identity\/card\/current/)
  assert.match(publicIdentity, /identity\/logo\/current/)
  assert.match(publicIdentity, /runtimeRole !== 'global'/)
  assert.match(publicIdentity, /readKitchenOnboardingSupport/)
  assert.match(publicIdentity, /runGuardedServerTransaction/)
  assert.match(publicIdentity, /FIRESTORE_MUTATION_TARGETS\.kitchens/)
  assert.match(publicIdentity, /mutations\.update\(/)
  assert.doesNotMatch(publicIdentity, /\.runTransaction\(/)
  assert.doesNotMatch(publicIdentity, /menus|menu_id|menuId/)
  assert.match(detailPage, /\buseKitchenDetail\s*\(/)
  assert.match(detailPage, /class="kitchen-detail-route"/)
  assert.match(detailPage, /setResponseStatus\(404\)/)
  assert.doesNotMatch(detailPage, /useKitchenFetch|firebase\/firestore/)
  assert.match(operatorPanel, /\buseKitchenConsoleTargetCollection\s*\(/)
  assert.doesNotMatch(operatorPanel, /useKitchenFetch|firebase\/firestore/)
}
