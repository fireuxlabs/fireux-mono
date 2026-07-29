// @fireux-script
// last_used: 2026-07-24
// usage_note: locks the Kitchen public index/detail family to one bounded server projection.
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const file = (repoRoot, relativePath) =>
  path.join(repoRoot, relativePath)
const read = (repoRoot, relativePath) =>
  readFileSync(file(repoRoot, relativePath), 'utf8')

export async function run({ repoRoot = process.cwd() } = {}) {
  const base =
    'packages/extensions/fireux-kitchens/src/runtime/'
  const canonicalCollectionPath =
    `${base}composables/fireux/firestore/kitchen/fetch/useKitchenCollection.ts`
  const legacyPublicCollectionPath =
    `${base}composables/fireux/kitchen/usePublicKitchenIndex.ts`
  const manager = read(
    repoRoot,
    `${base}components/Kitchen/Collection/Manager.vue`
  )
  const collection = read(repoRoot, canonicalCollectionPath)
  const detail = read(repoRoot, `${base}components/Kitchen/Detail/Index.vue`)
  const identityEditor = read(
    repoRoot,
    `${base}components/Kitchen/Detail/IdentityEditor.vue`
  )
  const detailPage = read(repoRoot, `${base}pages/kitchens/[slug]/index.vue`)
  const indexApi = read(repoRoot, `${base}server/api/kitchens/index.get.ts`)
  const detailApi = read(repoRoot, `${base}server/api/kitchens/[slug].get.ts`)
  const operatorPanel = read(
    repoRoot,
    `${base}components/Kitchen/Detail/OperatorPanel.vue`
  )
  const publicIdentity = read(
    repoRoot,
    `${base}server/kitchen/public-identity.ts`
  )
  const publicProjection = read(
    repoRoot,
    `${base}server/kitchen/public-projection.ts`
  )
  const sproochli = read(
    repoRoot,
    `${base}components/Kitchen/Detail/Sproochli.vue`
  )

  assert.equal(
    existsSync(file(repoRoot, legacyPublicCollectionPath)),
    false,
    'Kitchen must not restore a second public-index composable.'
  )
  assert.match(manager, /\buseKitchenCollection\s*\(/)
  assert.doesNotMatch(manager, /useKitchenFetch|firebase\/firestore/)
  assert.match(collection, /\/api\/kitchens\?limit=/)
  assert.match(collection, /visibility=all/)
  assert.match(collection, /getIdToken\(\)/)
  assert.match(collection, /watch\(\s*\[hasAuthState,\s*uid\]/)
  assert.match(collection, /void requestPreview\(\)/)
  assert.match(collection, /generation === previewGeneration/)
  assert.doesNotMatch(
    collection,
    /firebase\/firestore|useFirestoreRead|useDevKitchenCollection/
  )
  assert.match(indexApi, /projectPublicKitchenIndexItem/)
  assert.match(detailApi, /projectPublicKitchenDetail/)
  assert.match(indexApi, /public-projection\.ts/)
  assert.match(detailApi, /public-projection\.ts/)
  assert.doesNotMatch(detail, /useKitchenFetch|firebase\/firestore|ClientOnly/)
  assert.match(detail, /KitchenDetailIdentityEditor/)
  assert.match(detail, /KitchenDetailSproochli/)
  assert.match(detail, /\bisAdmin\.value\s*\|\|\s*isDeveloper\.value/)
  assert.match(publicProjection, /readKitchenSproochliConfig/)
  assert.match(publicProjection, /requested_languages/)
  assert.doesNotMatch(publicProjection, /profile_id/)
  assert.match(sproochli, /SproochliLanguageTrigger/)
  assert.match(sproochli, /resolveSproochliLanguageOptions/)
  assert.match(identityEditor, /\/api\/kitchens\/\$\{encodeURIComponent\(props\.kitchen\.slug\)\}\/identity/)
  assert.doesNotMatch(identityEditor, /firebase\/firestore|useKitchenUpdate/)
  assert.match(identityEditor, /\buseImageStorage\b/)
  assert.match(identityEditor, /kitchens\/\$\{props\.kitchen\.id\}\/identity\/logo\/current/)
  assert.match(identityEditor, /kitchens\/\$\{props\.kitchen\.id\}\/identity\/card\/current/)
  assert.doesNotMatch(identityEditor, /type="url"|Logo image URL|Card image URL/)
  assert.match(publicIdentity, /requireFirebaseBearerUser/)
  assert.match(publicIdentity, /requireFirebaseStorageDownloadUrl/)
  assert.match(publicIdentity, /identity\/card\/current/)
  assert.match(publicIdentity, /identity\/logo\/current/)
  assert.match(publicIdentity, /runtimeRole !== 'global'/)
  assert.match(publicIdentity, /readKitchenOnboardingSupport/)
  assert.match(publicIdentity, /runTransaction/)
  assert.doesNotMatch(publicIdentity, /menus|menu_id|menuId/)
  assert.match(detailPage, /\buseKitchenDetail\s*\(/)
  assert.match(detailPage, /class="kitchen-detail-route"/)
  assert.match(detailPage, /setResponseStatus\(404\)/)
  assert.doesNotMatch(detailPage, /useKitchenFetch|firebase\/firestore/)
  assert.match(operatorPanel, /\buseKitchenConsoleTargetCollection\s*\(/)
  assert.doesNotMatch(operatorPanel, /useKitchenFetch|firebase\/firestore/)
}
