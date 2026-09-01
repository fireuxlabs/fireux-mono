// @fireux-script
// last_used: 2026-08-04
// usage_note: run through pnpm guard; locks App/Ecosystem/Project authority boundaries.

import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const read = (repoRoot, relativePath) =>
  readFileSync(path.join(repoRoot, relativePath), 'utf8')

const filesBelow = (rootPath) => {
  if (!existsSync(rootPath)) return []
  return readdirSync(rootPath, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(rootPath, entry.name)
    return entry.isDirectory() ? filesBelow(entryPath) : [entryPath]
  })
}

const typeScriptFilesIn = (rootPath) => {
  if (!existsSync(rootPath)) return []
  return readdirSync(rootPath)
    .filter((name) => name.endsWith('.ts'))
    .sort()
}

const typeFields = (source, typeName) => {
  const marker = `export type ${typeName} = {`
  const start = source.indexOf(marker)
  assert.notEqual(start, -1, `Missing ${typeName} contract.`)
  const bodyStart = start + marker.length
  const end = source.indexOf('\n}', bodyStart)
  assert.notEqual(end, -1, `Unclosed ${typeName} contract.`)
  return [
    ...source
      .slice(bodyStart, end)
      .matchAll(/^  ([A-Za-z][A-Za-z0-9_]*)\??:/gm),
  ]
    .map((match) => match[1])
    .sort()
}

const PROJECT_MODEL =
  'packages/core/fireux-core/src/runtime/project/models/project.model.ts'
const APP_MODEL =
  'packages/core/fireux-core/src/runtime/app/models/app.model.ts'
const ECOSYSTEM_MODEL =
  'packages/core/fireux-core/src/runtime/ecosystem/models/ecosystem.model.ts'
const USER_MODEL =
  'packages/core/fireux-core/src/runtime/user/models/user.model.ts'
const DIRECTORY_MODEL =
  'packages/core/fireux-core/src/runtime/models/utils/directory.ts'
const PROFILE_PROVISIONING_MODEL =
  'packages/core/fireux-core/src/runtime/models/operations/profile-provisioning.ts'
const PROFILE_INDEX_UTIL =
  'packages/core/fireux-core/src/runtime/utils/profile-index.ts'

export async function run({ repoRoot = process.cwd() } = {}) {
  const coreModelFiles = typeScriptFilesIn(
    path.join(repoRoot, 'packages/core/fireux-core/src/runtime/models/core')
  )
  assert.deepEqual(coreModelFiles, [])

  const systemModelFiles = typeScriptFilesIn(
    path.join(repoRoot, 'packages/core/fireux-core/src/runtime/models/system')
  )
  assert.deepEqual(systemModelFiles, [])

  const utilityModelFiles = typeScriptFilesIn(
    path.join(repoRoot, 'packages/core/fireux-core/src/runtime/models/utils')
  )
  assert.deepEqual(utilityModelFiles, [
    'collection-cell.ts',
    'directory.ts',
    'entity-create.model.ts',
    'entity.model.ts',
    'profile.model.ts',
    'scope.model.ts',
    'stamps.model.ts',
    'style.model.ts',
    'workspace-entity.model.ts',
  ])

  assert.deepEqual(
    filesBelow(
      path.join(
        repoRoot,
        'packages/core/fireux-core/src/runtime/composables/fireux/firestore/system/module'
      )
    ),
    [],
    'Module composition is source-controlled; the orphaned Firestore Module stack must not return.'
  )

  const placeModel = read(
    repoRoot,
    'packages/extensions/fireux-places/src/runtime/place/models/place.model.ts'
  )
  const kitchenModel = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/models/kitchen.model.ts'
  )
  const kitchenLogoEditorPath =
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Edit/Logo.vue'
  const kitchenIdentityEditorPath =
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Edit/Identity.vue'
  const kitchenWorkspaceIdentity = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Identity/Sections/Index.vue'
  )
  assert.match(placeModel, /media_backdrop_color/)
  assert.deepEqual(typeFields(placeModel, 'Place'), [
    'about',
    'address',
    'brand_palette',
    'business_hours',
    'claimed_by',
    'cover_image',
    'created',
    'default_currency_code',
    'email',
    'entity_families',
    'formatted_address',
    'gallery_images',
    'google_maps_url',
    'id',
    'image_url',
    'lat',
    'lng',
    'logo_image',
    'media_backdrop_color',
    'name',
    'phone',
    'place_type',
    'price_level',
    'search_term',
    'short_address',
    'short_name',
    'slug',
    'social_links',
    'tagline',
    'tags',
    'timezone',
    'types',
    'updated',
    'verified',
    'website',
    'wordmark_image',
  ])
  assert.doesNotMatch(
    kitchenModel,
    /\n\s{2}(?:backdrop_color|logo_image|assets):/
  )
  assert.deepEqual(typeFields(kitchenModel, 'Kitchen'), [
    'id',
    'identity_source',
    'slug',
    'status',
    'visibility',
  ])
  assert.equal(existsSync(path.join(repoRoot, kitchenLogoEditorPath)), false)
  assert.equal(
    existsSync(path.join(repoRoot, kitchenIdentityEditorPath)),
    false
  )
  assert.match(kitchenWorkspaceIdentity, /<WorkspaceKitchenIdentityPlace/)
  assert.doesNotMatch(
    kitchenWorkspaceIdentity,
    /<KitchenEditIdentity|<KitchenEditLogo/
  )
  const appModel = read(repoRoot, APP_MODEL)
  const ecosystemModel = read(repoRoot, ECOSYSTEM_MODEL)
  const projectModel = read(repoRoot, PROJECT_MODEL)
  const userModel = read(repoRoot, USER_MODEL)
  const directoryModel = read(repoRoot, DIRECTORY_MODEL)
  const profileIndex = await import(
    pathToFileURL(path.join(repoRoot, PROFILE_INDEX_UTIL)).href
  )

  for (const [name, source] of [
    ['App', appModel],
    ['Ecosystem', ecosystemModel],
    ['Project', projectModel],
    ['User', userModel],
  ]) {
    assert.match(
      source,
      new RegExp(`export type ${name}\\s*=\\s*\\{`),
      `${name} must expose one direct singular document type.`
    )
    assert.doesNotMatch(
      source,
      /defineFireuxEntity|\b\w+Storage\b|\b\w+Defaults\b|\b\w+(?:Create|Update)Input\b|FireuxStamped|WidenLiteral/,
      `${name} canonical model must contain data fields, not infrastructure.`
    )
  }

  assert.match(appModel, /project_id:\s*string/)
  assert.match(appModel, /ecosystem_id\?:\s*string/)
  assert.match(
    appModel,
    /created:\s*\{[\s\S]*at:\s*FirebaseTimestamp[\s\S]*by\?:\s*string[\s\S]*updated:\s*\{[\s\S]*at:\s*FirebaseTimestamp[\s\S]*by\?:\s*string/
  )
  for (const field of [
    'tagline',
    'description',
    'short_bio',
    'long_bio',
    'social_links',
    'media',
  ]) {
    assert.match(
      appModel,
      new RegExp(`\\b${field}\\?:`),
      `App must contain its ${field} public identity field.`
    )
  }
  assert.doesNotMatch(appModel, /theme|AppMeta|AppSocialLinks|AppDerived/)
  assert.doesNotMatch(appModel, /^  (team|ecosystem):/m)

  assert.match(ecosystemModel, /project_id:\s*string/)
  assert.doesNotMatch(ecosystemModel, /^  (apps|team|source_url|slug):/m)

  assert.doesNotMatch(projectModel, /^  slug:/m)
  assert.match(
    projectModel,
    /created:\s*\{[\s\S]*at:\s*FirebaseTimestamp[\s\S]*updated:\s*\{[\s\S]*at:\s*FirebaseTimestamp/
  )
  assert.doesNotMatch(
    projectModel,
    /^  (app_id|ecosystem_id|operator_ids|owner_user_id|firebase_project_id|workspace_endpoint_url|project_type|primary_project):/m
  )
  const projectReader = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/project/utils/readProject.ts'
  )
  assert.match(projectReader, /return \{ \.\.\.raw, id \} as Project/)
  assert.doesNotMatch(
    projectReader,
    /PROJECT_FIELDS\s*=\s*new Set\(\[[\s\S]*?['"]id['"]/,
    'Stored canonical Project must take id from its Firestore path.'
  )

  assert.doesNotMatch(
    userModel,
    /app_ids|project_ids|kitchen_ids|workspace_enabled|profiles\??:\s*string\[\]|UserAccount|UserNotification|rootCollection/
  )
  assert.deepEqual(typeFields(userModel, 'User'), [
    'avatar',
    'bio',
    'display_name',
    'handle',
    'id',
  ])
  const userNormalizer = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/user/utils/normalize-user.ts'
  )
  assert.match(userNormalizer, /export function normalizeUser/)
  assert.match(userNormalizer, /export function isUserDirectoryEligible/)
  assert.match(userNormalizer, /A User may legitimately be incomplete/)
  for (const readerPath of [
    'packages/core/fireux-core/src/runtime/server/api/users/index.get.ts',
    'packages/core/fireux-core/src/runtime/server/api/users/[handle].get.ts',
    'packages/core/fireux-core/src/runtime/user/server/identity/summary.ts',
    'packages/core/fireux-core/src/runtime/user/composables/firestore/fetch/useUserFetch.ts',
  ]) {
    assert.match(
      read(repoRoot, readerPath),
      /normalizeUser/,
      `${readerPath} must return the canonical normalized User.`
    )
  }
  const userDirectoryModel = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/user/models/user-directory.model.ts'
  )
  assert.match(userDirectoryModel, /UserIdentitySummary\s*=\s*Pick</)
  assert.doesNotMatch(userDirectoryModel, /UserDirectoryEntry/)

  const appUserModel = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/app/models/app-user.model.ts'
  )
  assert.match(appUserModel, /export type AppUser\s*=\s*\{/)
  assert.doesNotMatch(
    appUserModel,
    /\n\s{2}id:\s*string/,
    'Stored AppUser identity comes from apps/{appId}/users/{uid}.'
  )
  assert.match(appUserModel, /role:\s*AppUserRole/)
  assert.match(appUserModel, /subscription:\s*AppUserSubscription/)
  assert.doesNotMatch(
    appUserModel,
    /defineFireuxEntity|Storage|Defaults|FireuxStamped/
  )
  assert.match(
    appUserModel,
    /created:\s*\{[\s\S]*at:\s*FirebaseTimestamp[\s\S]*updated:\s*\{[\s\S]*at:\s*FirebaseTimestamp/
  )

  const projectTeamMemberModel = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/project/models/project-team-member.model.ts'
  )
  assert.match(projectTeamMemberModel, /export type ProjectTeamMember\s*=\s*\{/)
  assert.match(projectTeamMemberModel, /user_id:\s*string/)
  assert.doesNotMatch(
    projectTeamMemberModel,
    /defineFireuxEntity|Storage|Defaults|FireuxStamped|FirebaseTimestamp/
  )

  assert.doesNotMatch(
    read(repoRoot, PROFILE_PROVISIONING_MODEL),
    /export function/,
    'Profile provisioning models must contain contracts, not runtime behavior.'
  )
  const { canonicalProfileIndex, isRuntimeProfileEnabled } = profileIndex
  assert.equal(typeof isRuntimeProfileEnabled, 'function')
  assert.equal(isRuntimeProfileEnabled(['chef'], 'chef'), true)
  assert.equal(isRuntimeProfileEnabled(['professional'], 'agent'), false)
  assert.equal(isRuntimeProfileEnabled(undefined, 'chef'), false)
  assert.equal(isRuntimeProfileEnabled(['Chef'], 'chef'), false)
  assert.deepEqual(
    canonicalProfileIndex(
      ['chef'],
      ['agent', 'chef', 'driver', 'professional'],
      'agent'
    ),
    ['agent', 'chef']
  )

  const profileProvisioner = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/server/utils/profile/provision.ts'
  )
  assert.match(
    profileProvisioner,
    /function runtimeDatabaseContext\(definition:[\s\S]*isRuntimeProfileEnabled\(fireux\?\.profiles, definition\.kind\)[\s\S]*runGuardedServerTransaction/
  )
  assert.doesNotMatch(
    profileProvisioner,
    /\.runTransaction\(|transaction\.(?:create|set|update|delete)\(/
  )
  assert.doesNotMatch(profileProvisioner, /arrayUnion\(definition\.id\)/)
  const profileCreate = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/profile/mutations/useProfileCreate.ts'
  )
  assert.match(profileCreate, /const createProfile = async \(\)/)
  assert.doesNotMatch(profileCreate, /targetUid|userId:\s*uid/)
  for (const [endpoint, profileId] of [
    [
      'packages/extensions/fireux-jobs/src/runtime/server/api/internal/profiles/agent.post.ts',
      'agent',
    ],
    [
      'packages/extensions/fireux-jobs/src/runtime/server/api/internal/profiles/professional.post.ts',
      'professional',
    ],
    [
      'packages/extensions/fireux-kitchens/src/runtime/server/api/internal/profiles/chef.post.ts',
      'chef',
    ],
    [
      'packages/extensions/fireux-kitchens/src/runtime/server/api/internal/profiles/customer.post.ts',
      'customer',
    ],
    [
      'packages/extensions/fireux-kitchens/src/runtime/server/api/internal/profiles/driver.post.ts',
      'driver',
    ],
  ]) {
    const source = read(repoRoot, endpoint)
    assert.match(source, new RegExp(`kind:\\s*['"]${profileId}['"]`))
    assert.match(source, /createProfileProvisionHandler/)
    assert.doesNotMatch(source, /readBody|getQuery|getRouterParam/)
  }

  const profileUpdateBase = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/profile/mutations/useProfileUpdateBase.ts'
  )
  assert.match(profileUpdateBase, /export function useProfileUpdateBase/)
  assert.match(
    profileUpdateBase,
    /export function useProfileAppStateUpdateBase/
  )
  assert.doesNotMatch(profileUpdateBase, /scope\?:|scope ===/)

  for (const rootUpdater of [
    'packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Agent/mutations/useAgentUpdate.ts',
    'packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Professional/mutations/useProfessionalUpdate.ts',
    'packages/extensions/fireux-kitchens/src/runtime/user/composables/firestore/profiles/Chef/mutations/useChefUpdate.ts',
  ]) {
    const source = read(repoRoot, rootUpdater)
    assert.match(source, /useProfileUpdateBase/)
    assert.doesNotMatch(source, /useProfileAppStateUpdateBase|updateAppState/)
  }

  for (const retiredProfileSurface of [
    'packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Agent/fetch/useAgentCollection.ts',
    'packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Professional/fetch/useProfessionalCollection.ts',
    'packages/extensions/fireux-kitchens/src/runtime/user/composables/firestore/profiles/Chef/fetch/useChefCollection.ts',
    'packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Agent/mutations/useAgentDelete.ts',
    'packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Professional/mutations/useProfessionalDelete.ts',
    'packages/extensions/fireux-kitchens/src/runtime/user/composables/firestore/profiles/Chef/mutations/useChefDelete.ts',
    'packages/extensions/fireux-jobs/src/runtime/pages/agents/admin/[id].vue',
    'packages/extensions/fireux-jobs/src/runtime/pages/professionals/admin/[id].vue',
    'packages/extensions/fireux-kitchens/src/runtime/pages/chefs/admin/[id].vue',
  ]) {
    assert.equal(
      existsSync(path.join(repoRoot, retiredProfileSurface)),
      false,
      `${retiredProfileSurface} must not return.`
    )
  }

  for (const [fetchPath, retiredNames] of [
    [
      'packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Agent/fetch/useAgentFetch.ts',
      /appAgents|appAgent|useCollectionById/,
    ],
    [
      'packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Professional/fetch/useProfessionalFetch.ts',
      /appProfessionals|appProfessional|useCollectionById/,
    ],
    [
      'packages/extensions/fireux-kitchens/src/runtime/user/composables/firestore/profiles/Chef/fetch/useChefFetch.ts',
      /appChefs|appChef|useCollectionById/,
    ],
  ]) {
    assert.doesNotMatch(read(repoRoot, fetchPath), retiredNames)
  }

  for (const [managerPath, directoryType, storedType] of [
    [
      'packages/extensions/fireux-jobs/src/runtime/components/Agent/Collection/Manager.vue',
      'AgentDirectoryProfile',
      'Agent',
    ],
    [
      'packages/extensions/fireux-jobs/src/runtime/components/Professional/Collection/Manager.vue',
      'ProfessionalDirectoryProfile',
      'Professional',
    ],
    [
      'packages/extensions/fireux-kitchens/src/runtime/user/components/Chef/Collection/Manager.vue',
      'ChefDirectoryProfile',
      'Chef',
    ],
  ]) {
    const source = read(repoRoot, managerPath)
    assert.match(source, new RegExp(`type \\w+Entry = ${directoryType}`))
    assert.doesNotMatch(source, new RegExp(`as ${storedType}\\b`))
  }

  const professionalUpdater = read(
    repoRoot,
    'packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Professional/mutations/useProfessionalUpdate.ts'
  )
  assert.doesNotMatch(
    professionalUpdater,
    /^    (commitUpdate|updateCoreProfile),$/m
  )

  const profileDetail = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/user/composables/profile/useProfileDetail.ts'
  )
  assert.match(profileDetail, /useAsyncData/)
  assert.match(profileDetail, /server:\s*true/)
  for (const [pagePath, collection, kind] of [
    [
      'packages/extensions/fireux-jobs/src/runtime/pages/agents/[handle].vue',
      'agents',
      'agent',
    ],
    [
      'packages/extensions/fireux-jobs/src/runtime/pages/professionals/[handle].vue',
      'professionals',
      'professional',
    ],
    [
      'packages/extensions/fireux-kitchens/src/runtime/pages/chefs/[handle].vue',
      'chefs',
      'chef',
    ],
    [
      'packages/extensions/fireux-kitchens/src/runtime/pages/drivers/[handle].vue',
      'drivers',
      'driver',
    ],
  ]) {
    const source = read(repoRoot, pagePath)
    assert.match(source, /await useProfileDetail/)
    assert.match(source, /useRouteParam\(['"]handle['"]\)/)
    assert.match(source, /redirectCode:\s*301/)
    assert.match(
      source,
      new RegExp(
        `collection:\\s*['"]${collection}['"][\\s\\S]*kind:\\s*['"]${kind}['"]`
      )
    )
    assert.doesNotMatch(
      source,
      /useProfileFetch|useUserFetch|<ClientOnly|\/admin\//
    )
  }

  assert.match(userModel, /avatar:\s*string/)
  assert.doesNotMatch(userModel, /USER_ECOSYSTEM_AVATAR_SRC/)
  const professionalExperienceEditor = read(
    repoRoot,
    'packages/extensions/fireux-jobs/src/runtime/components/Professional/Fields/ExperienceSection.vue'
  )
  const ensurePlaceIndex = professionalExperienceEditor.indexOf(
    'await ensurePlaceExists'
  )
  const assignPlaceIndex = professionalExperienceEditor.indexOf(
    'item.place_id = normalizedId'
  )
  assert.ok(ensurePlaceIndex >= 0, 'Professional experience must ensure Place.')
  assert.ok(
    assignPlaceIndex > ensurePlaceIndex,
    'Professional experience must assign place_id only after Place exists.'
  )

  assert.doesNotMatch(directoryModel, /AppDirectoryEntry/)
  assert.deepEqual(typeFields(directoryModel, 'EcosystemDirectoryEntry'), [
    'app_count',
    'description',
    'detail_url',
    'id',
    'image_url',
    'name',
    'project_id',
    'status',
    'website_url',
  ])

  const appCollection = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/app/components/Collection.vue'
  )
  const ecosystemCollectionView = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/ecosystem/components/Collection.vue'
  )
  const ecosystemInterface = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/ecosystem/composables/useEcosystemInterface.ts'
  )
  const ecosystemFetch = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/ecosystem/composables/firestore/fetch/useEcosystemFetch.ts'
  )
  const ecosystemCollectionSource = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/ecosystem/composables/firestore/fetch/useEcosystemCollection.ts'
  )
  assert.match(ecosystemFetch, /\/api\/ecosystems\//)
  assert.doesNotMatch(ecosystemFetch, /\buseFirestore\s*\(|\bfirestoreFetch\b/)
  assert.match(appCollection, /apps:\s*App\[\]/)
  assert.doesNotMatch(appCollection, /useAppCollection/)
  assert.match(
    ecosystemCollectionView,
    /ecosystems:\s*EcosystemDirectoryEntry\[\]/
  )
  assert.doesNotMatch(ecosystemCollectionView, /useEcosystemCollection/)
  assert.doesNotMatch(ecosystemInterface, /\b(team|apps)\?:/)
  assert.doesNotMatch(ecosystemInterface, /target\.(team|apps)/)
  assert.doesNotMatch(ecosystemInterface, /\bslug\b|source_url/)
  for (const legacyMutation of [
    'useEcosystemCreate.ts',
    'useEcosystemPublish.ts',
  ]) {
    assert.equal(
      existsSync(
        path.join(
          repoRoot,
          'packages/core/fireux-core/src/runtime/ecosystem/composables/firestore/mutations',
          legacyMutation
        )
      ),
      false,
      `Ecosystem client mutation must not return: ${legacyMutation}`
    )
  }

  const userProfile = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/user/components/IdentitySummary.vue'
  )
  const appProfileView = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/app/composables/useAppProfileView.ts'
  )
  assert.doesNotMatch(userProfile, /useAppCollection/)
  assert.doesNotMatch(appProfileView, /useAppUserCollection|useUserFetch/)

  const coreAppsPage = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/pages/apps/index.vue'
  )
  const fireuxAppsPage = read(
    repoRoot,
    'projects/fireux/fireux-app/app/pages/apps/index.vue'
  )
  const fireuxEcosystemsPage = read(
    repoRoot,
    'projects/fireux/fireux-app/app/pages/ecosystems/index.vue'
  )
  const fireuxEcosystemDetailPage = read(
    repoRoot,
    'projects/fireux/fireux-app/app/pages/ecosystems/[id].vue'
  )
  const fireuxEcosystemDetailReader = read(
    repoRoot,
    'projects/fireux/fireux-app/app/composables/usePlatformEcosystemDetail.ts'
  )
  const fireuxEcosystemDetail = read(
    repoRoot,
    'projects/fireux/fireux-app/app/components/Ecosystem/Detail.vue'
  )
  const fireuxEcosystemDetailApps = read(
    repoRoot,
    'projects/fireux/fireux-app/app/components/Ecosystem/Detail/Apps.vue'
  )
  assert.match(coreAppsPage, /useApps\(\)/)
  assert.match(fireuxAppsPage, /useApps\('\/api\/platform\/apps'\)/)
  assert.match(fireuxEcosystemsPage, /usePublishedPlatformEcosystemDirectory/)
  assert.match(fireuxEcosystemDetailPage, /\busePlatformEcosystemDetail\s*\(/)
  assert.match(fireuxEcosystemDetailReader, /usePlatformDirectory\(\)/)
  assert.match(fireuxEcosystemDetailReader, /computed<Ecosystem \| null>/)
  assert.match(fireuxEcosystemDetailPage, /<EcosystemDetail/)
  assert.match(fireuxEcosystemDetailPage, /:ecosystem="ecosystem"/)
  assert.doesNotMatch(
    fireuxEcosystemDetailPage,
    /EcosystemDirectoryEntry|PlatformDirectoryResponse|:apps=|:project=/
  )
  assert.match(fireuxEcosystemDetail, /ecosystem:\s*Ecosystem/)
  assert.match(fireuxEcosystemDetailApps, /useApps\('\/api\/platform\/apps'\)/)
  assert.match(
    fireuxEcosystemDetailApps,
    /allApps\.value\.filter\(\(app\) => app\.ecosystem_id === props\.ecosystem\.id\)/
  )

  const ownerAppDetailApi = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/server/api/apps/[id].get.ts'
  )
  const platformAppDetailPage = read(
    repoRoot,
    'projects/fireux/fireux-app/app/pages/apps/[id].vue'
  )
  const platformAppDetailComponent = read(
    repoRoot,
    'projects/fireux/fireux-app/app/components/App/Detail.vue'
  )
  const platformAppDetailProject = read(
    repoRoot,
    'projects/fireux/fireux-app/app/components/App/Detail/Project.vue'
  )
  const platformAppDetailEcosystem = read(
    repoRoot,
    'projects/fireux/fireux-app/app/components/App/Detail/Ecosystem.vue'
  )
  const platformAppDetailReader = read(
    repoRoot,
    'projects/fireux/fireux-app/app/composables/usePlatformAppDetail.ts'
  )
  assert.match(ownerAppDetailApi, /belongsToOwner/)
  assert.match(ownerAppDetailApi, /ecosystem_id/)
  assert.match(platformAppDetailPage, /usePlatformAppDetail/)
  assert.match(platformAppDetailReader, /DetailResponse<App>/)
  assert.match(platformAppDetailReader, /\/api\/platform\/apps\//)
  assert.match(platformAppDetailPage, /<AppDetail/)
  assert.match(platformAppDetailPage, /:app="app"/)
  assert.doesNotMatch(platformAppDetailPage, /:project=|:ecosystem=/)
  assert.match(platformAppDetailComponent, /app:\s*App/)
  assert.match(platformAppDetailProject, /useProjects\(\)/)
  assert.match(platformAppDetailEcosystem, /usePlatformDirectory\(\)/)
  assert.doesNotMatch(
    platformAppDetailPage,
    /AppDirectoryEntry|PlatformDirectoryResponse/
  )
  assert.doesNotMatch(ownerAppDetailApi, /PublicApp|\/api\/public\/apps/)

  const appInitialization = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/app/server/initialization/initialize.ts'
  )
  const appInitializationEndpoint = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/server/api/internal/app/initialize.post.ts'
  )
  assert.match(appInitialization, /runGuardedServerTransaction/)
  assert.match(appInitialization, /FIRESTORE_MUTATION_TARGETS\.runtimeApps/)
  assert.match(appInitialization, /serverAppUsersTarget/)
  assert.doesNotMatch(appInitialization, /AppMeta|projection/)
  assert.match(appInitializationEndpoint, /requireDevDeveloper\(event\)/)
  const appInitializationState = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/app/composables/utils/useAppInitialization.ts'
  )
  assert.match(
    appInitializationState,
    /const canProceed = computed\(\(\) => Boolean\(env\.value\?\.isValid\)\)/
  )
  assert.doesNotMatch(appInitializationState, /devMode/)
  const appEnvironmentCheck = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/app/server/onboarding/environment-check.ts'
  )
  assert.match(appEnvironmentCheck, /\.bucket\(storageBucket\)\s*\.exists\(\)/)
  assert.match(appEnvironmentCheck, /storage\.reachable/)
  const appSettingsEndpoint = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/app/server/settings/update.ts'
  )
  assert.match(appSettingsEndpoint, /requireFirebaseBearerUser/)
  assert.match(appSettingsEndpoint, /App admin access is required/)
  assert.doesNotMatch(
    appSettingsEndpoint,
    /AppMeta|projection|wordmark_url:\s*FieldValue\.delete|avatar_url:\s*FieldValue\.delete|thumbnail_url:\s*FieldValue\.delete|logo_url:\s*FieldValue\.delete|cover_url:\s*FieldValue\.delete/,
    'Canonical App settings must not retain a legacy-field cleanup adapter.'
  )
  const appContextReader = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/app/server/context/read.ts'
  )
  assert.doesNotMatch(
    appContextReader,
    /coalescing legacy|value\.app_id/,
    'Canonical App context must reject invalid memberships rather than coalesce a legacy shape.'
  )
  const appUserJoinedPublisher = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/app/server/events/publishAppUserJoinedEvent.ts'
  )
  assert.doesNotMatch(appUserJoinedPublisher, /app\.ecosystem_id/)
  assert.match(appUserJoinedPublisher, /serverUserNotificationsTarget/)
  assert.match(appUserJoinedPublisher, /mutations\.query<AppUser>/)
  assert.match(appUserJoinedPublisher, /mutations\.create\(events, eventId/)
  assert.match(appUserJoinedPublisher, /New user joined/)
  const notificationClient = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/user/composables/firestore/fetch/useUserNotifications.ts'
  )
  const notificationMutation = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/user/composables/firestore/mutations/useUserNotificationRead.ts'
  )
  const notificationReadEndpoint = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/server/api/internal/user/notifications.get.ts'
  )
  const notificationUpdateEndpoint = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/server/api/internal/user/notifications/[notificationId].patch.ts'
  )
  for (const [source, endpoint] of [
    [notificationClient, '/api/internal/user/notifications'],
    [notificationMutation, '/api/internal/user/notifications/'],
  ]) {
    assert.match(source, new RegExp(endpoint))
    assert.doesNotMatch(source, /useFirestore|readRuntime.*FirestoreDatabaseId/)
  }
  for (const source of [notificationReadEndpoint, notificationUpdateEndpoint]) {
    assert.match(source, /requireFirebaseBearerUser/)
    assert.match(source, /getRuntimeFirestore/)
    assert.doesNotMatch(source, /getRuntimeIdentityFirestore/)
  }
  const ecosystemDetail = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/ecosystem/composables/useEcosystemDetail.ts'
  )
  const ecosystemDetailApi = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/server/api/ecosystems/[id].get.ts'
  )
  const ecosystemCollection = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/ecosystem/composables/firestore/fetch/useEcosystemCollection.ts'
  )
  const ecosystemReader = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/ecosystem/server/identity/read.ts'
  )
  assert.match(ecosystemDetail, /\{ ecosystem: Ecosystem \}/)
  assert.match(ecosystemDetail, /\/api\/ecosystems\//)
  assert.match(ecosystemDetail, /EcosystemDetailOutcome/)
  assert.match(ecosystemDetailApi, /readEcosystem/)
  assert.match(ecosystemCollectionSource, /\/api\/ecosystems/)
  assert.doesNotMatch(
    ecosystemCollectionSource,
    /\buseFirestore\s*\(|\bfirestoreFetch\b/
  )
  assert.match(ecosystemReader, /getRuntimeIdentityFirestore/)
  assert.doesNotMatch(
    [ecosystemDetail, ecosystemDetailApi, ecosystemCollectionSource].join('\n'),
    /PublicEcosystem|\/api\/public\/ecosystems/
  )
  for (const mutation of [
    'useProjectBootstrapCreate.ts',
    'useProjectCreate.ts',
    'useProjectUpdate.ts',
    'useProjectDelete.ts',
  ]) {
    assert.equal(
      existsSync(
        path.join(
          repoRoot,
          'packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/project/mutations',
          mutation
        )
      ),
      false,
      `Project client mutation must not return: ${mutation}`
    )
  }

  const projectDirectoryPages = filesBelow(
    path.join(repoRoot, 'projects/fireux/fireux-app/app/pages/projects')
  ).filter((file) => file.endsWith('.vue'))
  assert.deepEqual(
    projectDirectoryPages.map((file) => path.basename(file)).sort(),
    ['[id].vue', 'index.vue'],
    'Project discovery must provide canonical index and detail routes.'
  )
  const projectDirectory = read(
    repoRoot,
    'projects/fireux/fireux-app/app/pages/projects/index.vue'
  )
  assert.doesNotMatch(
    projectDirectory,
    /requiresAuth|roles:\s*\[/,
    'The Project Directory must not carry an authentication or role gate.'
  )
  const projectDirectoryDetail = read(
    repoRoot,
    'projects/fireux/fireux-app/app/pages/projects/[id].vue'
  )
  const projectDirectoryDetailComponent = read(
    repoRoot,
    'projects/fireux/fireux-app/app/components/Project/Detail.vue'
  )
  const projectDirectoryDetailApps = read(
    repoRoot,
    'projects/fireux/fireux-app/app/components/Project/Detail/Apps.vue'
  )
  const projectDirectoryDetailReader = read(
    repoRoot,
    'projects/fireux/fireux-app/app/composables/usePlatformProjectDetail.ts'
  )
  assert.match(projectDirectoryDetail, /usePlatformProjectDetail/)
  assert.match(projectDirectoryDetailReader, /DetailResponse<Project>/)
  assert.match(projectDirectoryDetailReader, /\/api\/projects\//)
  assert.match(projectDirectoryDetail, /<ProjectDetail/)
  assert.match(projectDirectoryDetail, /:project="project"/)
  assert.doesNotMatch(projectDirectoryDetail, /:apps=/)
  assert.match(projectDirectoryDetailApps, /app\.project_id/)
  assert.doesNotMatch(projectDirectoryDetail, /requiresAuth|roles:\s*\[/)
  assert.match(projectDirectory, /useProjects\(\)/)
  assert.doesNotMatch(projectDirectory, /\/workspace\/project/)
  const projectDirectoryApi = read(
    repoRoot,
    'projects/fireux/fireux-app/server/api/projects/index.get.ts'
  )
  const projectDirectoryReader = read(
    repoRoot,
    'projects/fireux/fireux-app/server/project/index/directory.ts'
  )
  assert.match(projectDirectoryApi, /readProjects/)
  assert.match(projectDirectoryApi, /CollectionResponse<Project>/)
  assert.doesNotMatch(projectDirectoryApi, /ProjectStorage|\.collection\(/)
  assert.match(projectDirectoryReader, /collection\(['"]projects['"]\)/)
  assert.match(projectDirectoryReader, /readProjectDocument/)
  assert.match(projectDirectoryReader, /Invalid canonical Project/)
  assert.doesNotMatch(
    projectDirectoryReader,
    /filter\(\(project\).*Boolean\(project\)/,
    'Project collection must fail on an invalid canonical record rather than silently omit it.'
  )
  assert.match(projectDirectoryReader, /project\.status === 'active'/)
  assert.equal(
    existsSync(
      path.join(
        repoRoot,
        'packages/core/fireux-core/src/runtime/project/models/project-directory.model.ts'
      )
    ),
    false,
    'ProjectDirectoryEntry must not duplicate canonical Project.'
  )
  assert.doesNotMatch(
    projectDirectoryReader,
    /operator_ids|team_ids|private\/targets|requireFirebaseBearerUser/
  )
  assert.doesNotMatch(
    [projectDirectory, projectDirectoryApi, projectDirectoryReader].join('\n'),
    /PublicProject|\/api\/public\/projects/
  )

  for (const retiredWorkspacePage of ['create.vue']) {
    assert.equal(
      existsSync(
        path.join(
          repoRoot,
          'packages/ecosystem/fireux-fireux/src/runtime/pages/workspace/project',
          retiredWorkspacePage
        )
      ),
      false,
      `Project workspace surface must not return: ${retiredWorkspacePage}`
    )
  }

  for (const page of [
    'index',
    'overview',
    'identity',
    'apps',
    'ecosystem',
    'team',
  ]) {
    const pagePath =
      page === 'team'
        ? 'packages/ecosystem/fireux-fireux/src/runtime/pages/workspace/project/team/index.vue'
        : `packages/ecosystem/fireux-fireux/src/runtime/pages/workspace/project/${page}.vue`
    const source = read(repoRoot, pagePath)
    assert.match(
      source,
      /requiresAuth:\s*true/,
      `${page} must require authentication.`
    )
    assert.doesNotMatch(
      source,
      /roles:\s*\[/,
      `${page} must defer App and Project membership authority to the Server.`
    )
  }

  const projectCollection = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/project/composables/useProjectCollection.ts'
  )
  const projectDetail = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/project/composables/useProjectDetail.ts'
  )
  const projectInterface = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/project/composables/useProjectInterface.ts'
  )
  const projectControlApi = read(
    repoRoot,
    'projects/fireux/fireux-app/server/project/index/read.ts'
  )
  const projectTeamApi = read(
    repoRoot,
    'projects/fireux/fireux-app/server/project/team/read.ts'
  )
  const projectCreateApi = read(
    repoRoot,
    'projects/fireux/fireux-app/server/project/index/create.ts'
  )
  const projectPrimaryApi = read(
    repoRoot,
    'projects/fireux/fireux-app/server/project/index/primary.ts'
  )
  const projectCreateClient = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/project/composables/workspace/index/useProjectWorkspaceCreate.ts'
  )
  const projectCreateComponent = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/project/components/Workspace/Crud.vue'
  )
  const projectSelector = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/project/components/Workspace/Selector/Choices.vue'
  )
  const kitchenSelector = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Selector/Choices.vue'
  )
  const kitchenOnboardingCommands = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/server/index/onboarding/commands.ts'
  )
  const kitchenOnboardingLocator = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/server/index/onboarding/locator.ts'
  )
  const workspaceEntityCreationIdentity = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/server/utils/workspace-entity/creation-identity.ts'
  )
  assert.doesNotMatch(
    projectCollection,
    /useFirestoreRead|firestoreFetchCollection/
  )
  assert.match(projectCollection, /\/api\/internal\/control\/projects/)
  assert.match(projectDetail, /\/api\/internal\/control\/projects/)
  assert.match(projectDetail, /project_id:\s*requestedId/)
  assert.doesNotMatch(projectDetail, /useFirestoreRead|firestoreFetch/)
  assert.match(projectInterface, /\/projects\/\$\{encodeURIComponent\(id\)\}/)
  for (const retiredProjectComposable of [
    'packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/project/useProject.ts',
    'packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/project/fetch/useProjectFetch.ts',
    'packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/project/fetch/useProjectCollection.ts',
  ]) {
    assert.equal(
      existsSync(path.join(repoRoot, retiredProjectComposable)),
      false,
      `Retired Project composable must not return: ${retiredProjectComposable}`
    )
  }
  assert.match(projectControlApi, /requireFirebaseBearerUser/)
  assert.match(projectControlApi, /appRef\.collection\(['"]users['"]\)/)
  assert.match(projectControlApi, /membershipSnapshot/)
  assert.match(projectControlApi, /membership\.role/)
  assert.match(projectControlApi, /requireWorkspaceEntityMemberRole/)
  assert.doesNotMatch(projectControlApi, /admin_ids/)
  assert.match(projectControlApi, /membership\.projects/)
  assert.match(projectControlApi, /membership\.primary_project/)
  assert.doesNotMatch(projectControlApi, /collectionGroup\(['"]team['"]\)/)
  assert.match(projectControlApi, /collection\(['"]projects['"]\)/)
  assert.doesNotMatch(
    projectControlApi,
    /test-projects|getQuery\(event\)\.source/
  )
  assert.doesNotMatch(projectControlApi, /operator_ids|team_ids/)
  assert.match(projectTeamApi, /requireFirebaseBearerUser/)
  assert.match(projectTeamApi, /appRef\.collection\(['"]users['"]\)/)
  assert.match(projectTeamApi, /membership\.data\(\)\?\.role/)
  assert.match(projectTeamApi, /!==\s*['"]admin['"]/)
  assert.match(projectTeamApi, /!==\s*['"]user['"]/)
  assert.match(projectTeamApi, /projectRef\.collection\(['"]team['"]\)/)
  assert.match(projectTeamApi, /currentTeamMember\.data\(\)\?\.user_id/)
  assert.match(projectTeamApi, /currentTeamMember\.data\(\)\?\.status/)
  assert.match(projectTeamApi, /teamRole !== 'owner'/)
  assert.match(projectTeamApi, /teamRole !== 'operator'/)
  assert.doesNotMatch(projectTeamApi, /project_ids|operator_ids|team_ids/)
  assert.match(projectTeamApi, /collection\(['"]users['"]\)/)

  assert.match(projectCreateApi, /requireFirebaseBearerUser/)
  assert.match(projectCreateApi, /requireWorkspaceEntityMemberRole/)
  assert.match(projectCreateApi, /runGuardedServerTransaction/)
  assert.match(
    projectCreateApi,
    /kind:\s*['"]named['"],\s*databaseId:\s*['"]fireux['"]/
  )
  assert.match(projectCreateApi, /FIRESTORE_MUTATION_TARGETS\.fireuxProjects/)
  assert.match(projectCreateApi, /fireuxProjectTeamMembersTarget\(projectId\)/)
  assert.match(projectCreateApi, /membership\.data\?\.projects/)
  assert.match(projectCreateApi, /projects\.length === 0/)
  assert.match(
    projectCreateApi,
    /resolveWorkspaceEntityCreationId\(\{[\s\S]*intent:\s*['"]create_shell['"][\s\S]*ownerUserId:\s*uid/
  )
  assert.match(projectCreateApi, /primary_project:\s*projectId/)
  assert.match(projectCreateApi, /transaction\.update\(memberships/)
  assert.doesNotMatch(projectCreateApi, /queryCollectionGroup/)
  assert.match(projectCreateApi, /hasAppSubscriptionCapacity/)
  assert.match(projectCreateApi, /'project'/)
  assert.match(projectCreateApi, /role:\s*['"]owner['"]/)
  assert.match(projectCreateApi, /status:\s*['"]inactive['"]/)
  assert.match(
    projectCreateApi,
    /transaction\.create\(FIRESTORE_MUTATION_TARGETS\.fireuxProjects/
  )
  assert.match(projectCreateApi, /transaction\.create\(teamMembers/)
  assert.doesNotMatch(
    projectCreateApi,
    /\.runTransaction\(|useFirestore|setDoc|addDoc/
  )
  assert.match(projectPrimaryApi, /subscription === ['"]business['"]/)
  assert.match(projectPrimaryApi, /primary_project:\s*projectId/)
  assert.match(projectPrimaryApi, /fireuxUserNotificationsTarget\(admin\.id\)/)
  assert.match(projectPrimaryApi, /Primary Project change requested/)
  assert.match(projectPrimaryApi, /updated:\s*true/)
  assert.match(projectCreateClient, /\/api\/internal\/control\/projects/)
  assert.doesNotMatch(
    projectCreateClient,
    /useWorkspace\(|workspace\.activate\(/
  )
  assert.doesNotMatch(projectCreateClient, /useProjectWorkspace\(/)
  assert.match(projectCreateComponent, /await props\.refresh\(\)/)
  assert.doesNotMatch(
    projectCreateClient,
    /useFirestore|setDoc|addDoc|updateDoc/
  )
  assert.match(
    projectSelector,
    /\/api\/internal\/control\/projects\/primary[\s\S]*response\.updated[\s\S]*await props\.refresh\(\)/
  )
  assert.match(
    kitchenSelector,
    /\/api\/workspace\/kitchen\/request-primary-change[\s\S]*response\.updated[\s\S]*await props\.refresh\(\)/
  )
  assert.doesNotMatch(projectSelector, /workspace\.activate\(selected/)
  assert.doesNotMatch(kitchenSelector, /workspace\.activate\(selected/)

  const kitchenWorkspaceCreate = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Crud.vue'
  )
  assert.match(kitchenWorkspaceCreate, /navigateTo\('\/workspace\/kitchen\/create'\)/)
  assert.doesNotMatch(
    kitchenWorkspaceCreate,
    /useKitchenCreate|usePlaceUpdate|useFirestore|watch\(/
  )
  const kitchenWorkspaceIndex = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Workspace/Index.vue'
  )
  assert.match(kitchenWorkspaceCreate, /['"]create['"],/)
  assert.doesNotMatch(kitchenWorkspaceIndex, /incompleteKitchen|placeId/)
  assert.equal(
    kitchenOnboardingCommands.match(/resolveAppUserKitchenState\(/g)?.length,
    2
  )
  assert.match(kitchenOnboardingCommands, /createKitchenShell/)
  assert.match(kitchenOnboardingCommands, /body\.intent !== 'create_shell'/)
  assert.match(kitchenOnboardingLocator, /intent:\s*'use_source'/)
  assert.match(kitchenOnboardingLocator, /resolveWorkspaceEntityCreationId/)
  assert.match(
    kitchenOnboardingCommands,
    /const workspaceState = resolveAppUserKitchenState\([\s\S]*?if \(createdRoot\)/,
    'Place-backed onboarding must resolve AppUser capacity before scheduling Kitchen creation.'
  )
  assert.match(
    kitchenOnboardingCommands,
    /const workspaceState = resolveAppUserKitchenState\([\s\S]*?if \(anyShellRecord\)/,
    'Shell onboarding must resolve AppUser capacity before scheduling shell writes.'
  )
  assert.doesNotMatch(
    kitchenOnboardingCommands,
    /collection\(['"]kitchens['"]\)\.doc\(\)\.id/
  )
  assert.match(workspaceEntityCreationIdentity, /intent:\s*'create_shell'/)
  assert.match(workspaceEntityCreationIdentity, /intent:\s*'use_source'/)
  assert.match(
    workspaceEntityCreationIdentity,
    /input\.ownerUserId[\s\S]*input\.sourceId/
  )

  for (const method of ['get', 'post']) {
    const registrySource = read(
      repoRoot,
      `projects/fireux/fireux-app/server/api/registry.${method}.ts`
    )
    assert.match(registrySource, /statusCode:\s*410/)
    assert.doesNotMatch(
      registrySource,
      /firebase|getFirestore|collection\(|setDoc|addDoc|updateDoc|\.set\(|\.add\(|\.update\(/
    )
  }

  const configValidation = read(
    repoRoot,
    'packages/core/fireux-core/src/config/app/validate.ts'
  )
  assert.doesNotMatch(configValidation, /ecosystemId\s*!==\s*app\.ecosystem/)
  const appConfigs = filesBelow(path.join(repoRoot, 'projects')).filter(
    (file) => file.endsWith('/nuxt.config.ts')
  )
  assert.ok(appConfigs.length > 0, 'No project App configs found.')
  for (const configPath of appConfigs) {
    const source = readFileSync(configPath, 'utf8')
    assert.match(
      source,
      /\bprojectId:\s*['"][^'"]+['"]/,
      `${configPath} needs projectId.`
    )
  }

  const jobModelPath =
    'packages/extensions/fireux-jobs/src/runtime/job/models/job.model.ts'
  const jobAuthorModelPath =
    'packages/extensions/fireux-jobs/src/runtime/job/models/job-author.model.ts'
  const jobDirectoryModelPath =
    'packages/extensions/fireux-jobs/src/runtime/job/models/job-collection.model.ts'
  const jobAuthorServerPath =
    'packages/extensions/fireux-jobs/src/runtime/job/server/identity/author.ts'
  const jobValidationPath =
    'packages/extensions/fireux-jobs/src/runtime/job/server/core/validation.ts'
  const jobReadPath =
    'packages/extensions/fireux-jobs/src/runtime/job/server/identity/read.ts'
  const jobRuntimeScopePath =
    'packages/extensions/fireux-jobs/src/runtime/job/server/core/runtime.ts'
  const jobPermissionsPath =
    'packages/extensions/fireux-jobs/src/runtime/job/composables/useJobPermissions.ts'
  const jobPublishSurfacePath =
    'packages/extensions/fireux-jobs/src/runtime/job/components/Author/Publish.vue'
  const agentProvisionSurfacePath =
    'packages/extensions/fireux-jobs/src/runtime/components/Agent/Create/System.vue'
  const jobModel = read(repoRoot, jobModelPath)
  const jobAuthorModel = read(repoRoot, jobAuthorModelPath)
  const jobDirectoryModel = read(repoRoot, jobDirectoryModelPath)
  const jobAuthorServer = read(repoRoot, jobAuthorServerPath)
  const jobValidation = read(repoRoot, jobValidationPath)
  const jobRead = read(repoRoot, jobReadPath)
  const jobPermissions = read(repoRoot, jobPermissionsPath)
  const jobPublishSurface = read(repoRoot, jobPublishSurfacePath)
  const agentProvisionSurface = read(repoRoot, agentProvisionSurfacePath)
  const placeMediaMutation = read(
    repoRoot,
    'packages/extensions/fireux-places/src/runtime/place/server/identity/mutate.ts'
  )
  const placeMutationAuthority = read(
    repoRoot,
    'packages/extensions/fireux-places/src/runtime/place/server/identity/mutation-authority.ts'
  )

  assert.match(
    placeMutationAuthority,
    /readFireuxEntityManagement\(kitchen\.management\)/
  )
  assert.match(
    placeMutationAuthority,
    /resolveFireuxEntityManagementAppId\(management, ecosystem\)/
  )
  assert.match(placeMediaMutation, /readRootKitchenManagement\(/)
  assert.match(
    placeMediaMutation,
    /rootKitchenManagement\?\.appId\s*===\s*kitchenAuthority\.appId/
  )
  assert.match(
    placeMediaMutation,
    /kitchenAuthority\.appId\s*!==\s*runtimeAppId/
  )
  assert.match(
    placeMediaMutation,
    /localDeveloper\s*=\s*import\.meta\.dev\s*&&\s*uid\s*===\s*configuredDeveloperId/
  )
  assert.match(
    placeMediaMutation,
    /!runtimeAdmin\s*&&\s*!localDeveloper\s*&&\s*!kitchenAccess/
  )
  assert.doesNotMatch(
    placeMutationAuthority,
    /app_scope|app_scope_state|app_scope_app_id/
  )

  assert.deepEqual(typeFields(jobModel, 'Job'), [
    'category_id',
    'company_id',
    'compensation',
    'contract_type',
    'created',
    'description',
    'end_at',
    'id',
    'management_mode',
    'openings_count',
    'owner_id',
    'owner_type',
    'place_id',
    'source_app_id',
    'source_ecosystem_id',
    'start_at',
    'status',
    'title',
    'updated',
    'visibility',
  ])
  assert.match(jobModel, /owner_type:\s*['"]user['"]/)
  assert.match(jobModel, /owner_id:\s*string/)
  assert.match(
    jobModel,
    /import type \{ FinancialMoney \} from ['"]fireux-finance\/runtime\/models\/money\.model['"]/
  )
  assert.match(
    jobModel,
    /export type JobCompensation = FinancialMoney\s*&\s*\{[\s\S]*unit:\s*JobPayUnit[\s\S]*\}/
  )
  assert.match(jobModel, /compensation:\s*JobCompensation\s*\|\s*null/)
  const jobCreateInput = jobModel.match(
    /export type JobCreateInput = Pick<[\s\S]*?\n>/
  )?.[0]
  assert.ok(jobCreateInput, 'Job must declare its caller-safe create input.')
  assert.match(jobCreateInput, /['"]place_id['"]/)
  assert.match(jobCreateInput, /['"]compensation['"]/)
  assert.doesNotMatch(
    jobCreateInput,
    /owner_(?:id|type)|source_(?:app|ecosystem)_id|visibility|created|updated|status/
  )
  assert.match(jobAuthorModel, /JobCreateIntent\s*=\s*JobCreateInput/)
  assert.match(jobAuthorModel, /JobPatchIntent\s*=\s*JobUpdateInput/)
  assert.deepEqual(typeFields(jobDirectoryModel, 'JobDetailResponse'), [
    'applicationDoorway',
    'company',
    'companyPlace',
    'job',
    'place',
  ])
  assert.deepEqual(typeFields(jobDirectoryModel, 'JobDirectoryEntry'), [
    'application_doorway',
    'category_id',
    'company',
    'company_id',
    'compensation',
    'contract_type',
    'description',
    'end_at',
    'id',
    'management_mode',
    'openings_count',
    'place',
    'place_id',
    'start_at',
    'status',
    'title',
    'visibility',
  ])
  assert.doesNotMatch(jobDirectoryModel, /\bPublicJob/)
  assert.match(
    jobPermissions,
    /appUser\.value\?\.profiles\.includes\(['"]agent['"]\)/
  )
  assert.doesNotMatch(jobPermissions, /resolvedAgent\.value\?\.app\?\.id/)
  assert.match(jobPermissions, /authorReadiness\.value\s*===\s*['"]ready['"]/)
  assert.match(jobPublishSurface, /useJobPublish/)
  assert.match(jobPublishSurface, /Publish job/)
  assert.match(agentProvisionSurface, /target\.startsWith\(['"]\/['"]\)/)
  assert.match(agentProvisionSurface, /!target\.startsWith\(['"]\/\/['"]\)/)

  assert.match(jobAuthorServer, /job\.owner_type\s*!==\s*['"]user['"]/)
  assert.match(jobAuthorServer, /job\.owner_id\s*!==\s*uid/)
  assert.match(
    jobAuthorServer,
    /\.where\(\s*['"]owner_id['"]\s*,\s*['"]==['"]\s*,\s*uid\s*\)/
  )
  assert.match(
    jobAuthorServer,
    /transaction\.create\(jobRef,\s*\{[\s\S]*?owner_type:\s*['"]user['"][\s\S]*?owner_id:\s*uid/
  )
  assert.doesNotMatch(jobAuthorServer, /\bcreated\.by\b/)
  assert.doesNotMatch(jobAuthorServer, /owner_id:\s*scope\.appId/)

  assert.match(jobValidation, /export function canonicalJobRoot\s*\(/)
  assert.match(
    jobValidation,
    /requireExactKeys\(source, storedJobKeys, ['"]Job root['"]\)/
  )
  assert.match(jobValidation, /requireFinancialMoney/)
  assert.match(
    jobValidation,
    /category_id:\s*canonicalDocumentId\(source\.category_id, ['"]category_id['"]\)/
  )
  assert.match(jobValidation, /path:\s*`places\/\$\{job\.place_id\}`/)
  assert.match(
    jobAuthorServer,
    /return canonicalJobRoot\(snapshot\.id, snapshot\.data\(\)\)/
  )
  assert.match(jobRead, /const job = canonicalJobRoot\(id, data\)/)
  assert.match(
    jobRead,
    /const eligible\s*=\s*validRole\s*&&\s*\(role\s*!==\s*['"]tenant['"]\s*\|\|\s*isFirestoreDocumentId\(appId\)\)/
  )
  assert.match(
    jobRead,
    /categoryScope:\s*eligible\s*&&\s*jobs\.categoryScope\s*===\s*['"]all['"]\s*\?\s*['"]all['"]\s*:\s*['"]allowlist['"]/
  )

  const jobRootSurfacePaths = new Set([
    jobModelPath,
    jobAuthorModelPath,
    jobDirectoryModelPath,
    jobAuthorServerPath,
    jobValidationPath,
    jobReadPath,
    jobRuntimeScopePath,
    'packages/extensions/fireux-jobs/src/runtime/job/composables/useJobPermissions.ts',
    'packages/extensions/fireux-jobs/src/runtime/server/api/internal/jobs.get.ts',
    'packages/extensions/fireux-jobs/src/runtime/server/api/internal/jobs.post.ts',
    'packages/extensions/fireux-jobs/src/runtime/server/api/jobs.get.ts',
  ])
  for (const relativeRoot of [
    'packages/extensions/fireux-jobs/src/runtime/job/components',
    'packages/extensions/fireux-jobs/src/runtime/job/composables/firestore',
    'packages/extensions/fireux-jobs/src/runtime/job/composables',
    'packages/extensions/fireux-jobs/src/runtime/pages/jobs',
    'packages/extensions/fireux-jobs/src/runtime/server/api/internal/jobs',
    'packages/extensions/fireux-jobs/src/runtime/server/api/jobs',
  ]) {
    for (const file of filesBelow(path.join(repoRoot, relativeRoot))) {
      if (!/\.(?:ts|vue)$/.test(file)) continue
      jobRootSurfacePaths.add(path.relative(repoRoot, file))
    }
  }
  for (const relativePath of jobRootSurfacePaths) {
    const source = read(repoRoot, relativePath)
    assert.doesNotMatch(
      source,
      /\bworkplace_[a-z0-9_]*\b/i,
      `${relativePath} must use canonical Place fields, not workplace_* compatibility fields.`
    )
    assert.doesNotMatch(
      source,
      /\b(?:job_type|pay_currency|pay_rate|pay_unit)\b/,
      `${relativePath} must use contract/management and minor-unit compensation fields.`
    )
    assert.doesNotMatch(
      source,
      /materializeJobWorkplace|fireux:jobs:workplace:materialize|from\s+['"]fireux-kitchens|['"`]kitchens\//,
      `${relativePath} must not restore a Job-specific Kitchen/workplace materializer.`
    )
  }

  for (const provenanceWriter of [
    'packages/extensions/fireux-blogs/src/runtime/composables/fireux/blog/editor/useBlogDraftState.ts',
    'packages/extensions/fireux-blogs/src/runtime/composables/fireux/firestore/blog/mutations/useBlogCreate.ts',
    'packages/extensions/fireux-products/src/runtime/product/composables/create/useCreateProductState.ts',
    'packages/extensions/fireux-products/src/runtime/product/composables/firestore/mutations/useProductCreate.ts',
    'packages/extensions/fireux-jobs/src/runtime/job/composables/firestore/mutations/useJobCreate.ts',
  ]) {
    assert.doesNotMatch(
      read(repoRoot, provenanceWriter),
      /(?:fireux|useFireUXConfig\(\))\.ecosystem\b/,
      `${provenanceWriter} must use ecosystemId for entity provenance.`
    )
  }

  assert.equal(
    existsSync(path.join(repoRoot, 'scripts/migrate.mjs')),
    false,
    'Generic cross-domain migration recipes must not return.'
  )
  const thisGuard = path.join(repoRoot, 'scripts/guards/entity-authority.mjs')
  const retiredMigrationTokens = [
    'apply-drift-payload',
    'apps-canonical-shape',
    'ecosystem-project-id-fix',
    'runApplyDriftPayload',
    'users-canonical-shape',
  ]
  for (const file of filesBelow(path.join(repoRoot, 'scripts'))) {
    if (file === thisGuard || !file.endsWith('.mjs')) continue
    const source = readFileSync(file, 'utf8')
    for (const token of retiredMigrationTokens) {
      assert.equal(
        source.includes(token),
        false,
        `${path.relative(repoRoot, file)} must not restore retired generic migration behavior (${token}).`
      )
    }
  }
  const driftToolbar = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/components/dev/DriftToolbar.vue'
  )
  assert.doesNotMatch(driftToolbar, /useDevDriftCopyMeta|migration\s*[,}]/)

  const placeReadModel = read(
    repoRoot,
    'packages/extensions/fireux-places/src/runtime/place/models/place-read.model.ts'
  )
  const placeNormalizer = read(
    repoRoot,
    'packages/extensions/fireux-places/src/runtime/place/utils/normalize-place.ts'
  )
  const placeReader = read(
    repoRoot,
    'packages/extensions/fireux-places/src/runtime/place/server/identity/read.ts'
  )
  const placeDetail = read(
    repoRoot,
    'packages/extensions/fireux-places/src/runtime/place/composables/usePlaceDetail.ts'
  )
  const placeStoryEditor = read(
    repoRoot,
    'packages/extensions/fireux-places/src/runtime/place/components/Edit/Story.vue'
  )
  assert.match(placeStoryEditor, /\buseImageStorage\b/)
  assert.match(placeStoryEditor, /places\/\$\{placeId\.value\}\/cover/)
  assert.match(placeStoryEditor, /places\/\$\{placeId\.value\}\/gallery\//)
  assert.doesNotMatch(
    placeStoryEditor,
    /Cover image URL|Gallery image URL|type="url"/
  )
  assert.match(placeMediaMutation, /requireFirebaseStorageDownloadUrl/)
  assert.match(placeMediaMutation, /places\/\$\{target\.placeId\}\/image/)
  assert.match(placeMediaMutation, /places\/\$\{target\.placeId\}\/logo/)
  assert.match(placeMediaMutation, /places\/\$\{target\.placeId\}\/wordmark/)
  assert.match(placeMediaMutation, /places\/\$\{target\.placeId\}\/cover/)
  assert.match(placeMediaMutation, /places\/\$\{target\.placeId\}\/gallery\//)
  assert.match(
    placeReadModel,
    /export type PlaceIndexPage\s*=\s*\{[\s\S]*items:\s*Place\[\]/,
    'Place index transport must page canonical Place records.'
  )
  assert.match(
    placeReadModel,
    /export type PlaceDetailResponse\s*=\s*\{[\s\S]*place:\s*Place/,
    'Place detail transport must name the canonical Place directly.'
  )
  assert.match(
    placeNormalizer,
    /id,[\s\S]*slug:\s*text\(source\.slug\)[\s\S]*name,[\s\S]*place_type:\s*placeType[\s\S]*created:\s*stamp\(source\.created\)[\s\S]*updated:\s*stamp\(source\.updated\)/,
    'The shared Place normalizer must explicitly select the canonical Entity fields.'
  )
  assert.doesNotMatch(
    placeNormalizer,
    /\.\.\.source/,
    'Place reads must not leak undeclared Firestore fields into the canonical Entity.'
  )
  assert.match(
    placeReader,
    /latest\.exists\s*\?\s*normalizePlace\(latest\.id,\s*latest\.data\(\)\)\s*:\s*null/,
    'The server Place reader must return the same canonical Place normalization.'
  )
  assert.doesNotMatch(placeReadModel, /PublicPlace|Projection/)
  assert.doesNotMatch(placeNormalizer, /PublicPlace|Projection/)
  assert.doesNotMatch(placeReader, /PublicPlace|Projection/)
  assert.match(
    placeDetail,
    /const liveLocator = computed\(\(\) =>[\s\S]*?import\.meta\.client\s*\?\s*locator\.value\s*:\s*''[\s\S]*?\)/,
    'Place detail must subscribe every browser visitor to the exact canonical Place.'
  )
  assert.match(
    placeDetail,
    /watch\(\s*loadedPlace,[\s\S]*?if \(value\) lastGoodPlace\.value = value/,
    'Place detail must retain the server-loaded Place as its initial and fallback value.'
  )
  assert.match(
    placeDetail,
    /watch\(\s*livePlace,[\s\S]*?if \(value\) lastGoodPlace\.value = value/,
    'Place detail must publish successful listener updates without clearing the last good Place.'
  )
  assert.doesNotMatch(
    placeDetail,
    /isDeveloper/,
    'Place detail reactivity must not be restricted to developer or admin visitors.'
  )
  for (const ecosystem of ['bringli', 'misebox', 'werkbox']) {
    const packageName = `fireux-${ecosystem}`
    const rules = read(
      repoRoot,
      `packages/ecosystem/${packageName}/src/config/firebase/rules/place-identity.rules`
    )
    const template = read(
      repoRoot,
      `packages/ecosystem/${packageName}/src/config/firebase/firestore.template.rules`
    )
    assert.match(template, /@fireux-ecosystem-rules place-identity/)
    assert.match(
      rules,
      /match \/places\/\{placeId\}\s*\{[\s\S]*?allow get:\s*if resource != null;[\s\S]*?allow list, create, update, delete:\s*if false;[\s\S]*?\}/,
      `${packageName} must allow only exact Place reads for browser detail subscriptions.`
    )
    assert.doesNotMatch(
      rules,
      /allow (?:read|list|create|update|delete):\s*if true;/
    )
  }
  for (const retiredPlacePath of [
    'packages/extensions/fireux-places/src/runtime/place/models/place-public.model.ts',
    'packages/extensions/fireux-places/src/runtime/place/utils/public-place-projection.ts',
    'packages/extensions/fireux-places/src/runtime/place/server/identity/public-projection.ts',
  ]) {
    assert.equal(
      existsSync(path.join(repoRoot, retiredPlacePath)),
      false,
      `${retiredPlacePath} must not restore a duplicate Place Entity.`
    )
  }
  for (const placeFile of filesBelow(
    path.join(repoRoot, 'packages/extensions/fireux-places/src/runtime/place')
  )) {
    if (!/\.(?:ts|vue)$/.test(placeFile)) continue
    assert.doesNotMatch(
      readFileSync(placeFile, 'utf8'),
      /\bPublicPlace[A-Za-z0-9_]*\b/,
      `${path.relative(repoRoot, placeFile)} must use canonical Place or a named presentation contract.`
    )
  }

  const companyModel = read(
    repoRoot,
    'packages/extensions/fireux-companies/src/runtime/place/models/company.model.ts'
  )
  const companyEntity = read(
    repoRoot,
    'packages/extensions/fireux-companies/src/runtime/place/models/company.entity.ts'
  )
  const canonicalCompany = read(
    repoRoot,
    'packages/extensions/fireux-companies/src/runtime/place/server/company/canonical.ts'
  )
  const companyMaterializer = read(
    repoRoot,
    'packages/extensions/fireux-companies/src/runtime/place/server/company/materialize.ts'
  )
  const companyDirectoryModel = read(
    repoRoot,
    'packages/extensions/fireux-companies/src/runtime/place/models/company-collection.model.ts'
  )
  const companyProjection = read(
    repoRoot,
    'packages/extensions/fireux-companies/src/runtime/place/server/company/projection.ts'
  )
  assert.match(
    companyModel,
    /export type Company\s*=\s*\{[\s\S]*id:\s*string[\s\S]*created:\s*CompanyStamp[\s\S]*updated:\s*CompanyStamp/
  )
  assert.doesNotMatch(
    companyModel,
    /CompanyStorage|defineFireuxEntity|Defaults/
  )
  assert.match(companyEntity, /kind:\s*'record'/)
  assert.match(companyEntity, /parent:\s*'Place'/)
  assert.match(companyEntity, /root:\s*CompanyStorage\.path/)
  assert.doesNotMatch(companyModel, /export const CompanyModel\s*=/)
  assert.doesNotMatch(companyModel, /CompanyUpdateInput/)
  assert.match(
    canonicalCompany,
    /hasExactKeys\(company,\s*\['created', 'updated'\]\)/
  )
  assert.match(canonicalCompany, /hasExactKeys\(stamp,\s*\['at'\]\)/)
  assert.match(
    companyMaterializer,
    /normalizePlace\(id,\s*placeSnapshot\.data \|\| \{\}\)/
  )
  assert.match(
    companyMaterializer,
    /canonicalCompanyRole\(id,\s*companySnapshot\.data\)/
  )
  assert.match(companyDirectoryModel, /companies:\s*Company\[\]/)
  assert.match(companyDirectoryModel, /places:\s*Place\[\]/)
  assert.match(companyProjection, /canonicalCompanyRole\(id,\s*companyValue\)/)
  assert.match(
    companyProjection,
    /return \{ company: companyRecord, place: placeRecord \}/
  )
  assert.match(
    companyProjection,
    /normalizePlace\(id, place\.data\(\) \|\| \{\}\)/
  )
  assert.doesNotMatch(
    companyProjection,
    /\.\.\.\(place\./,
    'Company reads must not maintain a second optional copy of the canonical Place.'
  )
  assert.doesNotMatch(
    [companyDirectoryModel, companyProjection].join('\n'),
    /PublicCompany|public-projection/
  )

  const userIndexPage = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/pages/users/index.vue'
  )
  const userCollection = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/user/components/Collection.vue'
  )
  const userDetailPage = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/pages/users/[handle]/index.vue'
  )
  const userEditPage = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/pages/users/[handle]/edit.vue'
  )
  const userAppMembership = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/user/components/AppMembership.vue'
  )
  const userDetail = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/user/components/Detail.vue'
  )
  const miseboxUserDetail = read(
    repoRoot,
    'projects/misebox/misebox-app/app/components/User/Detail.vue'
  )
  const userAppMembershipEdit = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/user/components/AppMembership/Edit.vue'
  )
  const miseboxUserDetailPage = read(
    repoRoot,
    'projects/misebox/misebox-app/app/pages/users/[handle]/index.vue'
  )
  const kitchenAdminProvision = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/Admin/Provision.vue'
  )
  const kitchenUserMemberships = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/components/UserMemberships.vue'
  )
  const kitchenUserMembershipsServer = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/server/core/user-memberships.ts'
  )
  const kitchenAdminPage = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/pages/dashboard/admin/kitchens.vue'
  )
  const appUserCollection = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/user/composables/firestore/fetch/useAppUserCollection.ts'
  )
  assert.match(userIndexPage, /\buseUsers\s*\(/)
  assert.match(userIndexPage, /<UserCollection :users="users"/)
  assert.match(userCollection, /users:\s*User\[\]/)
  assert.doesNotMatch(userCollection, /\buseFetch\s*\(|<DevDebugPanel/)
  assert.match(userDetailPage, /\buseUserDetail\s*\(/)
  assert.match(userDetailPage, /<UserDetail v-if="user" :user="user"/)
  assert.doesNotMatch(
    userDetailPage,
    /\buseUserAppMembership\s*\(|:membership=/
  )
  assert.doesNotMatch(
    userDetailPage,
    /:can-edit|:can-manage|:edit-to|:on-set-subscription/
  )
  assert.doesNotMatch(userDetailPage, /<UserProfile|<UserAppMembership/)
  assert.match(userDetail, /<UserProfile :user="user"/)
  assert.match(userDetail, /<UserAppMembership/)
  assert.match(userDetail, /user:\s*User/)
  assert.match(userDetail, /\buseUserAppMembership\s*\(/)
  assert.match(userDetail, /\buseSeo\s*\(/)
  assert.doesNotMatch(
    userDetail,
    /membership:\s*UserAppMembershipRecord \| null/
  )
  assert.match(userEditPage, /<UserAppMembershipEdit/)
  assert.match(userEditPage, /roles:\s*\['admin'\]/)
  assert.match(userAppMembership, /<UserAppMembershipEdit/)
  assert.match(
    userAppMembership,
    /membership:\s*UserAppMembershipRecord \| null/
  )
  assert.match(userAppMembership, /subscription === 'business'/)
  assert.match(userAppMembershipEdit, /onSetSubscription/)
  assert.match(userAppMembershipEdit, /isAppUserSubscription/)
  assert.match(appUserCollection, /enabled\?:\s*ComputedRef<boolean>/)
  assert.match(miseboxUserDetailPage, /\buseUserDetail\s*\(/)
  assert.match(miseboxUserDetailPage, /<UserDetail v-if="user" :user="user"/)
  assert.doesNotMatch(
    miseboxUserDetailPage,
    /\buseUserAppMembership\s*\(|:membership=/
  )
  assert.doesNotMatch(
    miseboxUserDetailPage,
    /:owner-user-id|:owner-display-name|:return-to|:cancel-to/
  )
  assert.match(miseboxUserDetail, /<CoreUserDetail/)
  assert.match(miseboxUserDetail, /<KitchenUserMemberships/)
  assert.match(miseboxUserDetail, /<KitchenAdminProvision/)
  assert.match(miseboxUserDetail, /:user="user"/)
  assert.match(kitchenUserMemberships, /\buseKitchenUserMemberships\s*\(/)
  assert.match(kitchenUserMemberships, /<CollectionCell :cell="cell"/)
  assert.match(kitchenUserMemberships, /team_state !== 'active'/)
  assert.match(kitchenUserMembershipsServer, /\brequireFirebaseBearerUser\s*\(/)
  assert.match(kitchenUserMembershipsServer, /\buseFireUXConfig\(event\)/)
  assert.match(kitchenUserMembershipsServer, /\bresolveAppUserAccess\s*\(/)
  assert.match(
    kitchenUserMembershipsServer,
    /`kitchens\/\$\{kitchenId\}\/team\/\$\{userId\}`/
  )
  assert.match(kitchenAdminProvision, /<KitchenOnboarding/)
  assert.match(kitchenAdminProvision, /user:\s*Pick<User/)
  assert.match(kitchenAdminProvision, /:owner-user-id="user\.id"/)
  assert.match(kitchenAdminProvision, /:select-workspace-on-complete="false"/)
  assert.match(kitchenAdminPage, /<KitchenAdminProvision/)
  assert.doesNotMatch(kitchenAdminPage, /<KitchenOnboarding/)

  const entityDebugSurfaces = [
    [
      'packages/extensions/fireux-companies/src/runtime/place/components/Company/Collection/Manager.vue',
      /useDevCollectionJson\(companies\)/,
      /:objects="devJsonData"/,
    ],
    [
      'packages/extensions/fireux-companies/src/runtime/pages/companies/[id]/index.vue',
      /:objects="company \? \[company\] : \[\]"/,
      /:derived="\{ place \}"/,
    ],
  ]
  for (const [
    surfacePath,
    objectsContract,
    debugBinding,
  ] of entityDebugSurfaces) {
    const surface = read(repoRoot, surfacePath)
    assert.match(surface, /<DevDebugPanel/)
    assert.match(surface, /include-route/)
    assert.match(surface, objectsContract)
    assert.match(surface, debugBinding)
  }

  assert.equal(
    existsSync(
      path.join(
        repoRoot,
        'packages/core/fireux-ecosystem-controller/package.json'
      )
    ),
    false,
    'The obsolete fireux-workspace endpoint package must not return.'
  )

  console.log('[guard] ✅ entity authority contract valid')
}
