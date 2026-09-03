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
  const collectionView = read(
    repoRoot,
    `${kitchenBase}components/Collection.vue`
  )
  const collection = read(repoRoot, canonicalCollectionPath)
  const detail = read(repoRoot, `${kitchenBase}components/Detail.vue`)
  const detailHeader = read(
    repoRoot,
    `${kitchenBase}components/Detail/Header.vue`
  )
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
  const workspaceCreate = read(
    repoRoot,
    `${kitchenBase}components/Workspace/Crud.vue`
  )
  const workspaceCreateModal = read(
    repoRoot,
    `${kitchenBase}components/Workspace/Crud/Create.vue`
  )
  const shellCreate = read(
    repoRoot,
    `${kitchenBase}components/Onboarding/ShellCreate.vue`
  )
  const kitchenOnboarding = read(
    repoRoot,
    `${kitchenBase}components/Onboarding.vue`
  )
  const kitchenCreate = read(
    repoRoot,
    `${kitchenBase}composables/firestore/mutations/useKitchenCreate.ts`
  )
  const kitchenOnboardingController = read(
    repoRoot,
    `${kitchenBase}composables/useKitchenOnboarding.ts`
  )
  const onboardingCommands = read(
    repoRoot,
    `${kitchenBase}server/index/onboarding/commands.ts`
  )
  const kitchenMenuModel = read(
    repoRoot,
    `${base}menu/models/kitchen-menu.model.ts`
  )
  const kitchenSystemMenus = read(
    repoRoot,
    `${base}menu/utils/kitchen-system-menus.ts`
  )
  const kitchenOnboardingSystemMenus = read(
    repoRoot,
    `${kitchenBase}server/index/onboarding/system-menus.ts`
  )
  const menuRootEntry = read(repoRoot, `${base}menu/server/draft/root-entry.ts`)
  const systemMenuMigration = read(
    repoRoot,
    'scripts/ensure-misebox-kitchen-system-menus.mjs'
  )
  const primaryMenuMigration = read(
    repoRoot,
    'scripts/ensure-misebox-kitchen-primary-menu.mjs'
  )
  const onboardingActor = read(
    repoRoot,
    `${kitchenBase}server/index/onboarding/onboarding-actor.ts`
  )
  const onboardingLocator = read(
    repoRoot,
    `${kitchenBase}server/index/onboarding/locator.ts`
  )
  const creationIdentity = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/server/utils/workspace-entity/creation-identity.ts'
  )
  const identityReader = read(repoRoot, `${kitchenBase}server/identity/read.ts`)
  const sproochli = read(
    repoRoot,
    `${kitchenBase}components/Detail/Sproochli.vue`
  )
  assert.equal(
    kitchenModel.replace(/\s+/g, ' ').trim(),
    "export const KITCHEN_IDENTITY_SOURCES = ['user', 'place'] as const export type KitchenIdentitySource = (typeof KITCHEN_IDENTITY_SOURCES)[number] export type Kitchen = { id: string identity_source: KitchenIdentitySource slug: string status: 'active' | 'inactive' | 'archived' visibility: boolean }",
    'Kitchen must retain only its minimal shell identity and identity relationship source; Place and capability data belong to their own models.'
  )
  assert.match(workspaceCreate, /@create="createOpen = true"/)
  assert.match(workspaceCreate, /<WorkspaceKitchenCrudCreate/)
  assert.doesNotMatch(
    workspaceCreate,
    /navigateTo\('\/workspace\/kitchen\/create'\)/
  )
  assert.match(workspaceCreateModal, /<KitchenOnboarding/)
  const workspaceCreatePage = read(
    repoRoot,
    `${base}pages/workspace/kitchen/create.vue`
  )
  assert.match(
    workspaceCreatePage,
    /const returnTo = '\/'/,
    'Workspace Kitchen onboarding must return to the Kitchen Workspace index.'
  )
  assert.equal(
    existsSync(
      file(repoRoot, `${kitchenBase}components/Workspace/Create/Form.vue`)
    ),
    false,
    'Workspace Kitchen creation must use the explicit onboarding route.'
  )
  assert.equal(
    existsSync(
      file(repoRoot, `${base}server/api/kitchens/onboarding/shell.post.ts`)
    ),
    true,
    'Explicit UID-backed Kitchen shell creation must retain its server endpoint.'
  )
  assert.match(kitchenCreate, /createKitchenShell/)
  assert.match(kitchenCreate, /intent:\s*'create_shell'/)
  assert.match(kitchenCreate, /onboarding\/shell/)
  assert.match(
    onboardingCommands,
    /identity_source:\s*'place'/,
    'Place-selected Kitchen onboarding must persist place-owned identity provenance.'
  )
  assert.match(
    onboardingCommands,
    /identity_source:\s*'user'/,
    'Explicit Kitchen shell creation must persist user-owned identity provenance.'
  )
  assert.doesNotMatch(
    kitchenOnboardingController,
    /\/api\/places\//,
    'Kitchen onboarding preview must carry its bounded Place review projection without a second Place-detail request.'
  )
  assert.match(shellCreate, /@submit\.prevent="submit"/)
  assert.match(shellCreate, /intent:\s*'create_shell'/)
  assert.doesNotMatch(shellCreate, /watch\(|usePlaceSearch|currentUser\.uid/)
  assert.match(
    kitchenOnboarding,
    /appContext\.applyCommittedWorkspaceMembership\(result\.app_user\)[\s\S]*await router\.push\(resolvedReturnTo\.value\)/,
    'Completed Kitchen onboarding must reconcile its committed AppUser result before returning.'
  )
  assert.doesNotMatch(
    kitchenOnboarding,
    /appContext\.refresh\(\)|setKitchenWorkspaceSelection/,
    'Completed Kitchen onboarding must not add a full App-context refresh or temporary browser Workspace selection to its post-submit path.'
  )
  assert.equal(
    onboardingCommands.match(
      /app_user:\s*\{ id: ownerUserId, \.\.\.workspaceState \}/g
    )?.length,
    2,
    'Place and shell onboarding must return their exact committed AppUser Kitchen state.'
  )
  assert.equal(
    onboardingCommands.match(/actor\(event, \{ deferMembership: true \}\)/g)
      ?.length,
    2,
    'Kitchen completion commands must defer actor membership authority to their trusted transaction.'
  )
  assert.match(
    onboardingActor,
    /options\.deferMembership\s*\?\s*null\s*:\s*await membershipRef\.get\(\)/,
    'The Kitchen onboarding actor must skip its pre-transaction membership read when authority is transaction-bound.'
  )
  assert.match(onboardingCommands, /body\.intent !== 'create_shell'/)
  assert.match(
    onboardingCommands,
    /resolveWorkspaceEntityCreationId\(\{ intent: 'create_shell', ownerUserId \}\)/
  )
  assert.match(onboardingLocator, /intent:\s*'use_source'/)
  assert.match(creationIdentity, /intent:\s*'create_shell'/)
  assert.match(creationIdentity, /intent:\s*'use_source'/)
  assert.equal(
    existsSync(
      file(
        repoRoot,
        `${kitchenBase}server/index/onboarding/creation-identity.ts`
      )
    ),
    false,
    'Workspace Entity creation identity belongs to Core, not Kitchen.'
  )
  assert.equal(
    onboardingCommands.match(/resolveAppUserKitchenState\(/g)?.length,
    2,
    'Place and shell Kitchen onboarding must share the tested AppUser state projection.'
  )
  assert.match(kitchenMenuModel, /system_kind\?: 'food' \| 'drinks'/)
  assert.match(kitchenSystemMenus, /\['food', 'drinks'\] as const/)
  assert.match(kitchenSystemMenus, /status: 'draft'/)
  assert.match(kitchenSystemMenus, /inherit_kitchen_operation_hours: true/)
  assert.equal(
    onboardingCommands.match(/serverKitchenMenusTarget\(/g)?.length,
    2,
    'Place and shell Kitchen creation must own the same system Menu target.'
  )
  assert.equal(
    onboardingCommands.match(/createKitchenSystemMenus\(/g)?.length,
    2,
    'Place and shell Kitchen creation must atomically create the same system Menu pair.'
  )
  assert.equal(
    onboardingCommands.match(/menus: \{ primary_menu_id: 'food' \}/g)?.length,
    2,
    'Place and shell Kitchen creation must initially select Food as primary.'
  )
  assert.match(kitchenOnboardingSystemMenus, /buildKitchenSystemMenu\(/)
  assert.match(kitchenOnboardingSystemMenus, /input\.mutations\.create\(/)
  assert.match(
    menuRootEntry,
    /publicKitchenMenuId\(normalizeSlug\(kitchenSlug\), menuId\)/,
    'Every published Kitchen Menu projection must use the canonical Kitchen-qualified id.'
  )
  assert.match(systemMenuMigration, /verbs: \['create'\]/)
  assert.match(systemMenuMigration, /writeProtectedJsonArtifact\(/)
  assert.match(systemMenuMigration, /targetSnapshot\.exists/)
  assert.doesNotMatch(
    systemMenuMigration,
    /mcpSkillUpdate|mcpSkillDelete|transaction\.(?:set|update|delete)|\.doc\([^)]*\)\.(?:set|update|delete)/
  )
  assert.match(primaryMenuMigration, /verbs: \['update'\]/)
  assert.match(primaryMenuMigration, /writeProtectedJsonArtifact\(/)
  assert.match(
    primaryMenuMigration,
    /'menus\.primary_menu_id': PRIMARY_MENU_ID/
  )
  assert.doesNotMatch(primaryMenuMigration, /mcpSkillCreate|mcpSkillDelete/)
  assert.doesNotMatch(
    onboardingCommands,
    /collection\(['"]kitchens['"]\)\.doc\(\)\.id/
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
  assert.match(fulfilmentMigration, /EXPECTED_KITCHENS = 16/)
  assert.match(fulfilmentMigration, /readKitchenFulfilmentConfig\(rootData\)/)
  assert.match(fulfilmentMigration, /verbs: \['create'\]/)
  assert.match(fulfilmentMigration, /mcpSkillCreate\(/)
  assert.match(fulfilmentMigration, /writeProtectedJsonArtifact\(/)
  assert.doesNotMatch(fulfilmentMigration, /mcpSkillUpdate|mcpSkillDelete/)
  assert.match(sproochliMigration, /EXPECTED_KITCHENS = 16/)
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
  assert.match(collectionView, /kitchens:\s*KitchenCollectionRecord\[\]/)
  assert.doesNotMatch(collectionView, /\buseKitchenCollection\s*\(/)
  assert.match(collectionView, /<KitchenCollectionList :cards="cardsFiltered"/)
  assert.doesNotMatch(
    collectionView,
    /management_mode|Root kitchens|App kitchens/
  )
  assert.doesNotMatch(collectionView, /useKitchenFetch|firebase\/firestore/)
  assert.match(
    collection,
    /KitchenCollectionRecord = Kitchen & \{ place: Place \}/
  )
  assert.match(collection, /useAsyncData<KitchenCollectionRecord\[]>/)
  assert.match(
    collection,
    /collection:\s*ComputedRef<KitchenCollectionRecord\[]>/
  )
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
      file(repoRoot, `${kitchenBase}models/kitchen-collection.model.ts`)
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
  for (const handler of [
    '[kitchen].get.ts',
    '[kitchen]/fulfilment.get.ts',
    '[kitchen]/menu-presentation.get.ts',
  ]) {
    assert.equal(
      existsSync(file(repoRoot, `${base}server/api/kitchens/${handler}`)),
      true
    )
  }
  assert.doesNotMatch(detail, /useKitchenFetch|firebase\/firestore|ClientOnly/)
  assert.match(detail, /kitchen:\s*Kitchen/)
  assert.doesNotMatch(detail, /place:\s*Place/)
  assert.doesNotMatch(detail, /presentation:\s*KitchenDetailPresentation/)
  assert.doesNotMatch(detail, /fulfilment:\s*KitchenFulfilment/)
  assert.doesNotMatch(detail, /\buseKitchenDetail\s*\(/)
  assert.match(detail, /props\.kitchen/)
  assert.match(detail, /\buseKitchenSeo\s*\(/)
  assert.match(
    detailHeader,
    /\/places\/\$\{encodeURIComponent\(kitchen\.id\)\}\/edit/
  )
  assert.match(detailHeader, /KitchenDetailSproochli/)
  assert.match(detailHeader, /\bisAdmin\.value\s*\|\|\s*isDeveloper\.value/)
  assert.doesNotMatch(identityReader, /readKitchenSproochliConfig/)
  assert.match(detailApi, /readKitchenSproochliAttachment/)
  assert.match(identityReader, /normalizeKitchen/)
  assert.match(identityReader, /normalizePlace/)
  assert.match(identityReader, /resolveKitchenDetailPresentation/)
  assert.match(identityReader, /requested_languages/)
  assert.match(identityReader, /const imageUrl = kitchen\.place\.image_url/)
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
  assert.match(detailPage, /<KitchenDetail v-if="kitchen" :kitchen="kitchen"/)
  assert.doesNotMatch(detailPage, /useKitchenFetch|firebase\/firestore/)
  assert.doesNotMatch(detailPage, /:place=|:presentation=|:fulfilment=/)
  assert.doesNotMatch(detailReader, /firestoreFetchDoc<Kitchen>/)
  assert.doesNotMatch(detailReader, /firestoreFetchDoc<Place>/)
  assert.doesNotMatch(detailModel, /PublicKitchenDetail/)
  assert.match(operatorPanel, /\buseKitchenWorkspaceKitchens\s*\(/)
  assert.doesNotMatch(operatorPanel, /useKitchenFetch|firebase\/firestore/)
}
