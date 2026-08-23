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
  const kitchenModel = read(repoRoot, `${kitchenBase}models/kitchen.model.ts`)
  const fulfilmentModel = read(
    repoRoot,
    `${kitchenBase}models/fulfilment.model.ts`
  )
  const fulfilmentReader = read(
    repoRoot,
    `${kitchenBase}server/core/fulfilment.ts`
  )
  const fulfilmentUpdate = read(
    repoRoot,
    `${kitchenBase}server/core/fulfilment-update.ts`
  )
  const sproochliReader = read(
    repoRoot,
    `${kitchenBase}server/core/sproochli-attachment.ts`
  )
  const sproochliUpdate = read(
    repoRoot,
    `${kitchenBase}server/identity/sproochli.ts`
  )
  const serverTargets = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/utils/firestore-mutations/server-targets.ts'
  )
  const kitchenRules = read(
    repoRoot,
    'packages/ecosystem/fireux-misebox/src/config/firebase/rules/kitchen-operations.rules'
  )
  const fulfilmentMigration = read(
    repoRoot,
    'scripts/migrate-misebox-kitchen-fulfilment.mjs'
  )
  const sproochliMigration = read(
    repoRoot,
    'scripts/migrate-misebox-kitchen-sproochli.mjs'
  )
  const fulfilmentDeletion = read(
    repoRoot,
    'scripts/delete-misebox-kitchen-root-fulfilment.mjs'
  )
  const kitchenOwnershipMigration = read(
    repoRoot,
    'scripts/migrate-misebox-kitchen-ownership.mjs'
  )
  const entityCanonMigration = read(
    repoRoot,
    'scripts/migrate-firestore-entity-canon.mjs'
  )
  const fulfilmentUpdateApi = read(
    repoRoot,
    `${base}server/api/workspace/kitchen/fulfilment.patch.ts`
  )
  const fulfilmentUpdateComposable = read(
    repoRoot,
    `${kitchenBase}composables/workspace/identity/mutations/useKitchenFulfilmentUpdate.ts`
  )
  const deliveryEditor = read(
    repoRoot,
    `${kitchenBase}components/Workspace/Identity/Sections/Delivery/useKitchenDeliveryEditor.ts`
  )
  const paymentEditor = read(
    repoRoot,
    `${kitchenBase}components/Workspace/Identity/Sections/Payments.vue`
  )
  const kitchenUpdateInput = read(
    repoRoot,
    `${kitchenBase}server/identity/update-input.ts`
  )
  const fulfilmentApi = read(
    repoRoot,
    `${base}server/api/kitchens/[kitchen]/fulfilment.get.ts`
  )
  const workspaceKitchen = read(
    repoRoot,
    `${kitchenBase}server/core/workspace.ts`
  )
  const menuKitchenScope = read(
    repoRoot,
    `${base}menu/server/ownership/kitchen-scope.ts`
  )
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
  const detailApi = read(
    repoRoot,
    `${base}server/api/kitchens/[kitchen].get.ts`
  )
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
    kitchenModel.replace(/\s+/g, ' ').trim(),
    "export type Kitchen = { id: string name: string slug: string status: 'active' | 'inactive' | 'archived' visibility: boolean }",
    'Kitchen must retain only its minimal shell identity; Place and capability data belong to their own models.'
  )
  assert.match(
    fulfilmentModel,
    /export type KitchenFulfilment = \{\s*delivery_zones: KitchenDeliveryZone\[\]\s*payment_methods: KitchenFulfilmentPaymentPolicy\[\]\s*\}/
  )
  assert.doesNotMatch(
    fulfilmentModel,
    /kitchen_id|created|updated|Storage|registry/i
  )
  assert.match(
    fulfilmentReader,
    /kitchens\/\$\{kitchenId\}\/fulfilment\/policy/
  )
  assert.match(fulfilmentReader, /delivery_zones: \[\], payment_methods: \[\]/)
  assert.doesNotMatch(
    fulfilmentReader,
    /rootKitchenData|db\.doc\(`kitchens\/\$\{kitchenId\}`\)/
  )
  assert.match(fulfilmentUpdate, /requireKitchenMutationAuthority\(/)
  assert.match(fulfilmentUpdate, /serverKitchenFulfilmentTarget\(/)
  assert.match(fulfilmentUpdate, /mutations\.read\(target, 'policy'\)/)
  assert.doesNotMatch(fulfilmentUpdate, /authority\.rootData/)
  assert.match(fulfilmentUpdate, /mutations\.update\(target, 'policy', next\)/)
  assert.match(fulfilmentUpdate, /mutations\.create\(target, 'policy', next\)/)
  assert.doesNotMatch(fulfilmentUpdate, /FIRESTORE_MUTATION_TARGETS\.kitchens/)
  assert.match(
    sproochliReader,
    /kitchens\/\$\{kitchenId\}\/integrations\/sproochli/
  )
  assert.match(sproochliReader, /readKitchenSproochliConfig\(root\)/)
  assert.match(sproochliUpdate, /requireKitchenMutationAuthority\(/)
  assert.match(sproochliUpdate, /serverKitchenIntegrationsTarget\(/)
  assert.match(sproochliUpdate, /mutations\.read\(target, 'sproochli'\)/)
  assert.match(
    sproochliUpdate,
    /mutations\.update\(target, 'sproochli', next\)/
  )
  assert.match(
    sproochliUpdate,
    /mutations\.create\(target, 'sproochli', next\)/
  )
  assert.doesNotMatch(
    sproochliUpdate,
    /FIRESTORE_MUTATION_TARGETS\.kitchens|transaction\.update\(root|FieldValue|serverAuditStamp|management/i
  )
  assert.match(
    serverTargets,
    /serverKitchenIntegrationsTarget[\s\S]*'kitchens\.integrations', 'integrations'/
  )
  assert.match(kitchenRules, /match \/integrations\/\{integrationId\}/)
  assert.match(
    kitchenRules,
    /match \/integrations\/\{integrationId\} \{\s*allow get, list, create, update, delete: if false;/
  )
  assert.match(kitchenRules, /'ingredients',\s*'integrations',/)
  assert.match(fulfilmentUpdateApi, /updateKitchenFulfilment/)
  assert.match(fulfilmentUpdateComposable, /method: 'PATCH'/)
  assert.doesNotMatch(fulfilmentUpdateComposable, /firebase\/firestore/)
  assert.match(
    deliveryEditor,
    /changes: \{ delivery_zones: nextDeliveryZones \}/
  )
  assert.match(paymentEditor, /changes: \{ payment_methods: paymentMethods \}/)
  assert.doesNotMatch(deliveryEditor, /useKitchenUpdate|changes: patch/)
  assert.doesNotMatch(paymentEditor, /useKitchenUpdate|changes: patch/)
  assert.doesNotMatch(kitchenUpdateInput, /fulfilment/)
  assert.doesNotMatch(kitchenUpdateInput, /integrations|sproochli/i)
  assert.match(fulfilmentMigration, /EXPECTED_KITCHENS = 15/)
  assert.match(fulfilmentMigration, /readKitchenFulfilmentConfig\(rootData\)/)
  assert.match(fulfilmentMigration, /verbs: \['create'\]/)
  assert.match(fulfilmentMigration, /mcpSkillCreate\(/)
  assert.match(fulfilmentMigration, /writeProtectedJsonArtifact\(/)
  assert.doesNotMatch(fulfilmentMigration, /mcpSkillUpdate|mcpSkillDelete/)
  assert.match(sproochliMigration, /EXPECTED_KITCHENS = 15/)
  assert.match(sproochliMigration, /readSproochliAttachmentConfig\(/)
  assert.match(sproochliMigration, /normalizeValidAttachment\(/)
  assert.match(sproochliMigration, /verbs: \['create'\]/)
  assert.match(sproochliMigration, /mcpSkillCreate\(/)
  assert.match(sproochliMigration, /writeProtectedJsonArtifact\(/)
  assert.match(
    sproochliMigration,
    /kitchens\/\$\{root\.id\}\/integrations\/sproochli/
  )
  assert.doesNotMatch(
    sproochliMigration,
    /mcpSkillUpdate|mcpSkillDelete|FieldValue|transaction\.(?:set|update|delete)|\.doc\([^)]*\)\.(?:set|update|delete)/
  )
  assert.match(fulfilmentDeletion, /EXPECTED_DELETIONS = 2/)
  assert.match(fulfilmentDeletion, /rootPolicySha256 !== childSha256/)
  assert.match(fulfilmentDeletion, /retained managed export URI/)
  assert.match(fulfilmentDeletion, /writeProtectedJsonArtifact\(/)
  assert.match(
    kitchenOwnershipMigration,
    /CHILD_OWNED_FIELDS = \['fulfilment'\]/
  )
  assert.match(
    entityCanonMigration,
    /Kitchen fulfilment must use kitchens\/\{kitchenId\}\/fulfilment\/policy\./
  )
  assert.match(fulfilmentApi, /readMenuKitchenFulfilment\(kitchen\.id\)/)
  assert.match(workspaceKitchen, /readKitchenFulfilment\(db, id\)/)
  assert.match(
    menuKitchenScope,
    /readKitchenFulfilment\(getRuntimeFirestore\(\), kitchenId\)/
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
    existsSync(
      file(repoRoot, `${kitchenBase}models/kitchen-directory.model.ts`)
    ),
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
    /Team|Order|KitchenSale|MiseTask|PrepItem|Fulfilment|AuditStamp|private/i,
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
  assert.match(
    detail,
    /\/places\/\$\{encodeURIComponent\(kitchen\.id\)\}\/edit/
  )
  assert.match(detail, /KitchenDetailSproochli/)
  assert.match(detail, /\bisAdmin\.value\s*\|\|\s*isDeveloper\.value/)
  assert.doesNotMatch(identityReader, /readKitchenSproochliConfig/)
  assert.match(detailApi, /readKitchenSproochliAttachment/)
  assert.match(identityReader, /normalizeKitchen/)
  assert.match(identityReader, /normalizePlace/)
  assert.match(identityReader, /resolveKitchenDetailPresentation/)
  assert.match(identityReader, /requested_languages/)
  assert.match(
    identityReader,
    /const imageUrl = kitchen\.place\.cover_image \|\| kitchen\.place\.image_url/
  )
  assert.match(identityReader, /image_kind:\s*'photograph'/)
  assert.match(identityReader, /const placeId = document\.id/)
  assert.doesNotMatch(
    identityReader,
    /managementTarget|management_mode|management_app_id/
  )
  assert.doesNotMatch(identityReader, /profile_id/)
  assert.match(sproochli, /SproochliLanguageTrigger/)
  assert.match(sproochli, /resolveSproochliLanguageOptions/)
  assert.equal(
    existsSync(
      file(repoRoot, `${kitchenBase}components/Detail/IdentityEditor.vue`)
    ),
    false
  )
  assert.equal(
    existsSync(
      file(repoRoot, `${kitchenBase}server/identity/identity-edit.ts`)
    ),
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
  assert.match(operatorPanel, /\buseKitchenWorkspaceKitchens\s*\(/)
  assert.doesNotMatch(operatorPanel, /useKitchenFetch|firebase\/firestore/)
}
