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
  'packages/core/fireux-core/src/runtime/models/system/project.model.ts'
const APP_MODEL =
  'packages/core/fireux-core/src/runtime/models/core/app.model.ts'
const ECOSYSTEM_MODEL =
  'packages/core/fireux-core/src/runtime/models/core/ecosystem.model.ts'
const USER_MODEL =
  'packages/core/fireux-core/src/runtime/models/core/user.model.ts'
const DIRECTORY_MODEL =
  'packages/core/fireux-core/src/runtime/models/utils/directory.ts'
const PROFILE_PROVISIONING_MODEL =
  'packages/core/fireux-core/src/runtime/models/operations/profile-provisioning.ts'
const PROFILE_INDEX_UTIL =
  'packages/core/fireux-core/src/runtime/utils/profile-index.ts'

export async function run({ repoRoot = process.cwd() } = {}) {
  const coreModelFiles = readdirSync(
    path.join(repoRoot, 'packages/core/fireux-core/src/runtime/models/core')
  )
    .filter((name) => name.endsWith('.ts'))
    .sort()
  assert.deepEqual(coreModelFiles, [
    'app.model.ts',
    'ecosystem.model.ts',
    'user.model.ts',
  ])

  const systemModelFiles = readdirSync(
    path.join(repoRoot, 'packages/core/fireux-core/src/runtime/models/system')
  )
    .filter((name) => name.endsWith('.ts'))
    .sort()
  assert.deepEqual(systemModelFiles, ['project.model.ts'])

  const utilityModelFiles = readdirSync(
    path.join(repoRoot, 'packages/core/fireux-core/src/runtime/models/utils')
  )
    .filter((name) => name.endsWith('.ts'))
    .sort()
  assert.deepEqual(utilityModelFiles, [
    'console-entity.model.ts',
    'directory.ts',
    'entity-create.model.ts',
    'entity.model.ts',
    'profile.model.ts',
    'scope.model.ts',
    'stamps.model.ts',
    'style.model.ts',
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
    'packages/extensions/fireux-places/src/runtime/models/place.model.ts'
  )
  const kitchenModel = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/models/kitchen.model.ts'
  )
  const kitchenLogoEditor = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/components/Kitchen/Edit/Logo.vue'
  )
  const kitchenIdentityEditor = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/components/Kitchen/Edit/Identity.vue'
  )
  const kitchenConsoleIdentity = read(
    repoRoot,
    'packages/extensions/fireux-kitchens/src/runtime/components/Console/Kitchen/Identity/Sections/Index.vue'
  )
  assert.match(placeModel, /media_backdrop_color/)
  assert.match(kitchenModel, /backdrop_color/)
  assert.match(kitchenLogoEditor, /type="color"/)
  assert.doesNotMatch(kitchenLogoEditor, /Logo tone|imageShadeOptions/)
  assert.match(kitchenConsoleIdentity, /<KitchenEditIdentity/)
  assert.match(kitchenIdentityEditor, /<KitchenEditFields/)
  assert.doesNotMatch(
    kitchenIdentityEditor,
    /updateCoverImage|updateGalleryImages|places\//
  )
  const appModel = read(repoRoot, APP_MODEL)
  const ecosystemModel = read(repoRoot, ECOSYSTEM_MODEL)
  const projectModel = read(repoRoot, PROJECT_MODEL)
  const userModel = read(repoRoot, USER_MODEL)
  const directoryModel = read(repoRoot, DIRECTORY_MODEL)
  const profileIndex = await import(
    pathToFileURL(path.join(repoRoot, PROFILE_INDEX_UTIL)).href
  )

  for (const [name, source, markers] of [
    [
      'User',
      userModel,
      [
        'export type AppUserRole',
        'export interface UserIdentity',
        'export interface AppUser',
        'export const UserStorage',
        'export const UserEntity',
        'export const UserIdentityDefaults',
        'export type UserCreateInput',
      ],
    ],
    [
      'App',
      appModel,
      [
        'export type AppStatus',
        'export interface AppIdentity',
        'export interface AppMeta',
        'export const AppStorage',
        'export const AppEntity',
        'export const AppIdentityDefaults',
        'export type AppCreateInput',
      ],
    ],
    [
      'Ecosystem',
      ecosystemModel,
      [
        'export type EcosystemStatus',
        'export interface EcosystemIdentity',
        'export interface EcosystemMeta',
        'export const EcosystemStorage',
        'export const EcosystemEntity',
        'export const EcosystemIdentityDefaults',
        'export type EcosystemCreateInput',
      ],
    ],
    [
      'Project',
      projectModel,
      [
        'export type ProjectStatus',
        'export interface ProjectIdentity',
        'export interface ProjectMeta',
        'export const ProjectStorage',
        'export const ProjectEntity',
        'export const ProjectIdentityDefaults',
        'export type ProjectCreateInput',
      ],
    ],
  ]) {
    const positions = markers.map((marker) => source.indexOf(marker))
    assert.ok(
      positions.every((position) => position >= 0) &&
        positions.every((position, index) =>
          index === 0 ? true : position > positions[index - 1]
        ),
      `${name} model must follow vocabulary, entity, support, storage, declaration, defaults, and command order.`
    )
    assert.doesNotMatch(
      source,
      /export const \w+Model\b|export type \w+Model\b/,
      `${name} runtime seeds use Defaults; Model is not a value or type alias.`
    )
  }

  const appMetaStart = appModel.indexOf('export interface AppMeta')
  const appMetaEnd = appModel.indexOf('export const AppStorage', appMetaStart)
  assert.ok(appMetaStart >= 0 && appMetaEnd > appMetaStart)
  const appMetaContract = appModel.slice(appMetaStart, appMetaEnd)
  assert.match(appMetaContract, /extends AppIdentity/)
  assert.match(appMetaContract, /website_url:\s*string/)
  assert.match(appMetaContract, /console_families:\s*AppConsoleFamily\[\]/)
  assert.doesNotMatch(
    appMetaContract,
    /derived|user_count|self_join_enabled|moderation_state|ban_reasons|fireux_repo|workspace|join_requests|admin_ids/
  )
  assert.match(
    appModel,
    /AppMetaStorage[\s\S]*database:\s*['"]\(default\)['"][\s\S]*path:\s*['"]apps\/\{appId\}['"]/
  )

  assert.match(appModel, /project_id:\s*''/)
  assert.match(appModel, /ecosystem_id:\s*''/)
  assert.match(appModel, /ecosystem_id\?:\s*string/)
  assert.match(
    appModel,
    /export interface App extends FireuxStamped, AppIdentity, AppPresentation/
  )
  assert.doesNotMatch(
    appModel,
    /AppCanonicalStorage|AppFieldGroups|WidenLiteral|models\/utils\/app/
  )
  assert.doesNotMatch(appModel, /^  (team|ecosystem):/m)

  assert.match(ecosystemModel, /project_id:\s*''/)
  assert.match(
    ecosystemModel,
    /export interface Ecosystem[\s\S]*extends FireuxStamped,[\s\S]*EcosystemIdentity,[\s\S]*EcosystemPresentation/
  )
  assert.match(
    ecosystemModel,
    /EcosystemMetaStorage[\s\S]*database:\s*['"]\(default\)['"][\s\S]*path:\s*['"]ecosystem\/\{ecosystemId\}['"]/
  )
  const ecosystemMetaStart = ecosystemModel.indexOf(
    'export interface EcosystemMeta'
  )
  const ecosystemMetaEnd = ecosystemModel.indexOf(
    'export const EcosystemStorage',
    ecosystemMetaStart
  )
  assert.ok(ecosystemMetaStart >= 0 && ecosystemMetaEnd > ecosystemMetaStart)
  const ecosystemMetaContract = ecosystemModel.slice(
    ecosystemMetaStart,
    ecosystemMetaEnd
  )
  assert.match(ecosystemMetaContract, /database_id:\s*string/)
  assert.doesNotMatch(
    ecosystemMetaContract,
    /apps|app_count|users|memberships|fireux_repo|workspace|moderation|ban_reasons/
  )
  assert.doesNotMatch(ecosystemModel, /EcosystemCanonicalStorage|WidenLiteral/)
  assert.doesNotMatch(ecosystemModel, /^  (apps|team|source_url|slug):/m)

  assert.match(
    projectModel,
    /ProjectStorage[\s\S]*shape:\s*'root'[\s\S]*path:\s*'projects\/\{projectId\}'/
  )
  assert.match(
    projectModel,
    /AppProjectStorage[\s\S]*shape:\s*'scoped'[\s\S]*path:\s*'apps\/\{appId\}\/projects\/\{projectId\}'/
  )
  assert.match(
    projectModel,
    /ProjectMetaStorage[\s\S]*database:\s*['"]\(default\)['"][\s\S]*path:\s*['"]project\/\{projectId\}['"]/
  )
  assert.match(
    projectModel,
    /export interface Project[\s\S]*extends FireuxStamped,[\s\S]*ProjectIdentity,[\s\S]*ProjectPresentation/
  )
  assert.doesNotMatch(projectModel, /WidenLiteral|^  slug:/m)
  assert.match(projectModel, /AppProjectDefaults/)
  assert.match(projectModel, /FireuxAppAccessRecordModel/)
  assert.doesNotMatch(
    projectModel,
    /^  (app_id|ecosystem_id|operator_ids|owner_user_id|firebase_project_id|console_endpoint_url|project_type|primary_project):/m
  )
  assert.match(
    userModel,
    /UserTargetsStorage[\s\S]*users\/\{userId\}\/private\/targets/
  )
  assert.match(
    userModel,
    /export interface User[\s\S]*extends FireuxStamped,[\s\S]*UserIdentity,[\s\S]*UserPresentation/
  )
  assert.match(userModel, /export interface AppUser extends FireuxStamped/)
  const canonicalUserModels = userModel.slice(
    0,
    userModel.indexOf('export interface UserTargets')
  )
  assert.doesNotMatch(
    canonicalUserModels,
    /app_ids|project_ids|kitchen_ids|console_enabled|profiles\??:\s*string\[\]/
  )
  assert.doesNotMatch(userModel, /UserAccount|UserNotification|rootCollection/)

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
    /function runtimeDatabaseContext\(definition:[\s\S]*isRuntimeProfileEnabled\(fireux\?\.profiles, definition\.id\)[\s\S]*runGuardedServerTransaction/
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
    assert.match(source, new RegExp(`id:\\s*['"]${profileId}['"]`))
    assert.match(source, /createProfileProvisionHandler/)
    assert.doesNotMatch(source, /readBody|getQuery|getRouterParam/)
  }

  const profileUpdateBase = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/profile/mutations/useProfileUpdateBase.ts'
  )
  assert.match(profileUpdateBase, /export function useProfileRootUpdateBase/)
  assert.match(profileUpdateBase, /export function useProfileAppUpdateBase/)
  assert.doesNotMatch(
    profileUpdateBase,
    /export function useProfileUpdateBase|scope\?:|scope ===/
  )

  for (const rootUpdater of [
    'packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Agent/mutations/useAgentUpdate.ts',
    'packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Professional/mutations/useProfessionalUpdate.ts',
    'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/profiles/Chef/mutations/useChefUpdate.ts',
  ]) {
    const source = read(repoRoot, rootUpdater)
    assert.match(source, /useProfileRootUpdateBase/)
    assert.doesNotMatch(source, /useProfileAppUpdateBase|updateAppProfile/)
  }

  for (const retiredProfileSurface of [
    'packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Agent/fetch/useAgentCollection.ts',
    'packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Professional/fetch/useProfessionalCollection.ts',
    'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/profiles/Chef/fetch/useChefCollection.ts',
    'packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Agent/mutations/useAgentDelete.ts',
    'packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/profiles/Professional/mutations/useProfessionalDelete.ts',
    'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/profiles/Chef/mutations/useChefDelete.ts',
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
      'packages/extensions/fireux-kitchens/src/runtime/composables/fireux/firestore/profiles/Chef/fetch/useChefFetch.ts',
      /appChefs|appChef|useCollectionById/,
    ],
  ]) {
    assert.doesNotMatch(read(repoRoot, fetchPath), retiredNames)
  }

  for (const [managerPath, directoryType, storedType] of [
    [
      'packages/extensions/fireux-jobs/src/runtime/components/Agent/Collection/Manager.vue',
      'PublicAgentDirectoryProfile',
      'Agent',
    ],
    [
      'packages/extensions/fireux-jobs/src/runtime/components/Professional/Collection/Manager.vue',
      'PublicProfessionalDirectoryProfile',
      'Professional',
    ],
    [
      'packages/extensions/fireux-kitchens/src/runtime/components/Chef/Collection/Manager.vue',
      'PublicChefDirectoryProfile',
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

  const publicProfileDetail = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/composables/fireux/public/profile/usePublicProfileDetail.ts'
  )
  assert.match(publicProfileDetail, /useAsyncData/)
  assert.match(publicProfileDetail, /server:\s*true/)
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
    assert.match(source, /await usePublicProfileDetail/)
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

  assert.match(userModel, /avatar:\s*USER_ECOSYSTEM_AVATAR_SRC/)
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

  assert.deepEqual(typeFields(directoryModel, 'AppDirectoryEntry'), [
    'app_name',
    'app_short_name',
    'derived',
    'description',
    'detail_url',
    'ecosystem_id',
    'id',
    'media',
    'role',
    'short_bio',
    'slug',
    'status',
    'tagline',
  ])
  assert.deepEqual(typeFields(directoryModel, 'EcosystemDirectoryEntry'), [
    'app_count',
    'description',
    'detail_url',
    'id',
    'image_url',
    'name',
    'status',
    'website_url',
  ])

  const appManager = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/components/App/Collection/Manager.vue'
  )
  const ecosystemManager = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/components/Ecosystem/Collection/Manager.vue'
  )
  const ecosystemInterface = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/composables/fireux/ecosystem/useEcosystemInterface.ts'
  )
  const ecosystemFetch = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/ecosystem/fetch/useEcosystemFetch.ts'
  )
  const ecosystemCollection = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/ecosystem/fetch/useEcosystemCollection.ts'
  )
  for (const source of [ecosystemFetch, ecosystemCollection]) {
    assert.match(source, /readRuntimeIdentityFirestoreDatabaseId/)
  }
  assert.match(appManager, /controller:\s*AppDirectoryController/)
  assert.doesNotMatch(appManager, /useAppCollection/)
  assert.match(ecosystemManager, /controller:\s*EcosystemDirectoryController/)
  assert.doesNotMatch(ecosystemManager, /useEcosystemCollection/)
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
          'packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/ecosystem/mutations',
          legacyMutation
        )
      ),
      false,
      `Ecosystem client mutation must not return: ${legacyMutation}`
    )
  }

  const userProfile = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/components/User/IdentitySummary.vue'
  )
  const appProfileView = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/composables/fireux/app/useAppProfileView.ts'
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
  assert.match(coreAppsPage, /useEcosystemAppCollection/)
  assert.match(fireuxAppsPage, /usePlatformAppDirectory/)
  assert.match(fireuxEcosystemsPage, /usePublishedPlatformEcosystemDirectory/)

  const ownerAppDetailApi = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/server/api/public/apps/[id].get.ts'
  )
  const platformAppDetailPage = read(
    repoRoot,
    'projects/fireux/fireux-app/app/pages/apps/[id].vue'
  )
  assert.match(ownerAppDetailApi, /belongsToOwner/)
  assert.match(ownerAppDetailApi, /ecosystem_id/)
  assert.match(platformAppDetailPage, /PlatformDirectoryResponse/)
  assert.match(platformAppDetailPage, /show-people="false"/)

  const appInitialization = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/server/utils/app-initialization/initialize.ts'
  )
  const appInitializationEndpoint = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/server/api/internal/app/initialize.post.ts'
  )
  assert.match(appInitialization, /runGuardedServerTransaction/)
  assert.match(appInitialization, /FIRESTORE_MUTATION_TARGETS\.runtimeApps/)
  assert.match(appInitialization, /serverAppUsersTarget/)
  assert.match(appInitialization, /ensureRuntimeAppMeta/)
  assert.match(appInitializationEndpoint, /requireDevDeveloper\(event\)/)
  const appInitializationState = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/composables/fireux/app/utils/useAppInitialization.ts'
  )
  assert.match(
    appInitializationState,
    /const canProceed = computed\(\(\) => Boolean\(env\.value\?\.isValid\)\)/
  )
  assert.doesNotMatch(appInitializationState, /devMode/)
  const appEnvironmentCheck = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/server/api/internal/app/env-check.ts'
  )
  assert.match(appEnvironmentCheck, /\.bucket\(storageBucket\)\s*\.exists\(\)/)
  assert.match(appEnvironmentCheck, /storage\.reachable/)
  const appSettingsEndpoint = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/server/api/internal/app/settings.patch.ts'
  )
  assert.match(appSettingsEndpoint, /requireFirebaseBearerUser/)
  assert.match(appSettingsEndpoint, /App admin access is required/)
  assert.match(appSettingsEndpoint, /ensureRuntimeAppMeta/)
  const appUserJoinedPublisher = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/server/utils/events/publishAppUserJoinedEvent.ts'
  )
  assert.doesNotMatch(appUserJoinedPublisher, /app\.ecosystem_id/)
  assert.match(appUserJoinedPublisher, /serverUserNotificationsTarget/)
  assert.match(appUserJoinedPublisher, /mutations\.query<AppUser>/)
  assert.match(appUserJoinedPublisher, /mutations\.create\(events, eventId/)
  assert.match(appUserJoinedPublisher, /New user joined/)
  const notificationClient = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/fetch/useUserNotifications.ts'
  )
  const notificationMutation = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/user/mutations/useUserNotificationRead.ts'
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
    'packages/core/fireux-core/src/runtime/composables/fireux/ecosystem/useEcosystemDetail.ts'
  )
  const ecosystemDetailApi = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/server/api/public/ecosystems/[id].get.ts'
  )
  assert.match(ecosystemDetail, /PublicDetailResponse<PublicEcosystemDto>/)
  assert.match(ecosystemDetail, /EcosystemDetailOutcome/)
  assert.match(ecosystemDetailApi, /ecosystemId !== ownerId/)
  assert.match(ecosystemDetailApi, /projectPublicEcosystem/)
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
    ['index.vue'],
    'Project may expose only its public collection page; public detail pages must not return.'
  )
  const projectDirectory = read(
    repoRoot,
    'projects/fireux/fireux-app/app/pages/projects/index.vue'
  )
  assert.doesNotMatch(
    projectDirectory,
    /requiresAuth|roles:\s*\[/,
    'The public Project collection must not carry an authentication or role gate.'
  )
  assert.match(projectDirectory, /usePlatformProjectDirectory/)
  assert.doesNotMatch(projectDirectory, /\/console\/project/)
  const publicProjectDirectoryApi = read(
    repoRoot,
    'projects/fireux/fireux-app/server/api/public/projects.get.ts'
  )
  assert.match(publicProjectDirectoryApi, /ProjectStorage\.collection/)
  assert.match(publicProjectDirectoryApi, /status\) !== 'active'/)
  assert.doesNotMatch(
    publicProjectDirectoryApi,
    /operator_ids|team_ids|private\/targets|requireFirebaseBearerUser/
  )

  for (const retiredConsolePage of ['create.vue']) {
    assert.equal(
      existsSync(
        path.join(
          repoRoot,
          'projects/fireux/fireux-app/app/pages/console/project',
          retiredConsolePage
        )
      ),
      false,
      `Project console surface must not return: ${retiredConsolePage}`
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
    const source = read(
      repoRoot,
      `projects/fireux/fireux-app/app/pages/console/project/${page}.vue`
    )
    assert.match(
      source,
      /roles:\s*\['admin'\]/,
      `${page} must require App admin.`
    )
  }

  const projectCollection = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/composables/fireux/project/useProjectCollection.ts'
  )
  const projectDetail = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/composables/fireux/project/useProjectDetail.ts'
  )
  const projectInterface = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/composables/fireux/project/useProjectInterface.ts'
  )
  const projectControlApi = read(
    repoRoot,
    'projects/fireux/fireux-app/server/api/internal/control/projects.get.ts'
  )
  const projectTeamApi = read(
    repoRoot,
    'projects/fireux/fireux-app/server/api/internal/control/projects/[projectId]/team.get.ts'
  )
  assert.doesNotMatch(
    projectCollection,
    /useFirestoreRead|firestoreFetchCollection/
  )
  assert.match(projectCollection, /\/api\/internal\/control\/projects/)
  assert.match(projectDetail, /useProjectCollection/)
  assert.doesNotMatch(projectDetail, /useFirestoreRead|firestoreFetch/)
  assert.match(projectInterface, /Project has no public detail route/)
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
  assert.match(projectControlApi, /AppUserStorage\.collection/)
  assert.match(projectControlApi, /membershipSnapshot/)
  assert.match(projectControlApi, /membership\.role/)
  assert.match(projectControlApi, /===\s*['"]admin['"]/)
  assert.match(projectControlApi, /===\s*['"]user['"]/)
  assert.doesNotMatch(projectControlApi, /admin_ids/)
  assert.match(projectControlApi, /users\/\$\{uid\}\/private\/targets/)
  assert.match(projectControlApi, /project_ids/)
  assert.match(projectControlApi, /ProjectStorage\.collection/)
  assert.doesNotMatch(
    projectControlApi,
    /test-projects|getQuery\(event\)\.source/
  )
  assert.doesNotMatch(projectControlApi, /operator_ids|team_ids/)
  assert.match(projectTeamApi, /requireFirebaseBearerUser/)
  assert.match(projectTeamApi, /membershipData\.role\) !== 'admin'/)
  assert.match(projectTeamApi, /project_ids/)
  assert.match(projectTeamApi, /operator_ids/)
  assert.match(projectTeamApi, /team_ids/)
  assert.match(projectTeamApi, /UserStorage\.collection/)

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
    'packages/extensions/fireux-jobs/src/runtime/models/job.model.ts'
  const jobAuthorModelPath =
    'packages/extensions/fireux-jobs/src/runtime/models/job-author.model.ts'
  const jobPublicModelPath =
    'packages/extensions/fireux-jobs/src/runtime/models/job-public.model.ts'
  const jobAuthorServerPath =
    'packages/extensions/fireux-jobs/src/runtime/server/job/author.ts'
  const jobValidationPath =
    'packages/extensions/fireux-jobs/src/runtime/server/job/validation.ts'
  const jobPublicProjectionPath =
    'packages/extensions/fireux-jobs/src/runtime/server/utils/job/public-projection.ts'
  const jobRuntimeScopePath =
    'packages/extensions/fireux-jobs/src/runtime/server/job/runtime.ts'
  const jobPermissionsPath =
    'packages/extensions/fireux-jobs/src/runtime/composables/useJobPermissions.ts'
  const jobPublishSurfacePath =
    'packages/extensions/fireux-jobs/src/runtime/components/Job/Author/Publish.vue'
  const agentProvisionSurfacePath =
    'packages/extensions/fireux-jobs/src/runtime/components/Agent/Create/System.vue'
  const jobModel = read(repoRoot, jobModelPath)
  const jobAuthorModel = read(repoRoot, jobAuthorModelPath)
  const jobAuthorServer = read(repoRoot, jobAuthorServerPath)
  const jobValidation = read(repoRoot, jobValidationPath)
  const jobPublicProjection = read(repoRoot, jobPublicProjectionPath)
  const jobPermissions = read(repoRoot, jobPermissionsPath)
  const jobPublishSurface = read(repoRoot, jobPublishSurfacePath)
  const agentProvisionSurface = read(repoRoot, agentProvisionSurfacePath)
  const placeMediaMutation = read(
    repoRoot,
    'packages/extensions/fireux-places/src/runtime/server/place/mutate.ts'
  )
  const placeMutationAuthority = read(
    repoRoot,
    'packages/extensions/fireux-places/src/runtime/server/place/mutation-authority.ts'
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
  assert.match(
    jobPermissions,
    /appUser\.value\?\.profiles\.includes\(['"]agent['"]\)/
  )
  assert.match(jobPermissions, /resolvedAgent\.value\?\.app\?\.id/)
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
  assert.match(jobPublicProjection, /const job = canonicalJobRoot\(id, data\)/)
  assert.match(
    jobPublicProjection,
    /const eligible\s*=\s*validRole\s*&&\s*\(role\s*!==\s*['"]tenant['"]\s*\|\|\s*isFirestoreDocumentId\(appId\)\)/
  )
  assert.match(
    jobPublicProjection,
    /categoryScope:\s*eligible\s*&&\s*jobs\.categoryScope\s*===\s*['"]all['"]\s*\?\s*['"]all['"]\s*:\s*['"]allowlist['"]/
  )

  const jobRootSurfacePaths = new Set([
    jobModelPath,
    jobAuthorModelPath,
    jobPublicModelPath,
    jobAuthorServerPath,
    jobValidationPath,
    jobPublicProjectionPath,
    jobRuntimeScopePath,
    'packages/extensions/fireux-jobs/src/runtime/composables/useJobPermissions.ts',
    'packages/extensions/fireux-jobs/src/runtime/server/api/internal/jobs.get.ts',
    'packages/extensions/fireux-jobs/src/runtime/server/api/internal/jobs.post.ts',
    'packages/extensions/fireux-jobs/src/runtime/server/api/public/jobs.get.ts',
  ])
  for (const relativeRoot of [
    'packages/extensions/fireux-jobs/src/runtime/components/Job',
    'packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/jobs',
    'packages/extensions/fireux-jobs/src/runtime/composables/fireux/jobs',
    'packages/extensions/fireux-jobs/src/runtime/pages/jobs',
    'packages/extensions/fireux-jobs/src/runtime/server/api/internal/jobs',
    'packages/extensions/fireux-jobs/src/runtime/server/api/public/jobs',
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
    'packages/extensions/fireux-products/src/runtime/composables/fireux/product/create/useCreateProductState.ts',
    'packages/extensions/fireux-products/src/runtime/composables/fireux/firestore/product/mutations/useProductCreate.ts',
    'packages/extensions/fireux-jobs/src/runtime/composables/fireux/firestore/jobs/mutations/useJobCreate.ts',
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

  const publicPlaceModel = read(
    repoRoot,
    'packages/extensions/fireux-places/src/runtime/models/place-public.model.ts'
  )
  const publicPlaceNormalizer = read(
    repoRoot,
    'packages/extensions/fireux-places/src/runtime/utils/public-place-projection.ts'
  )
  const publicPlaceServerProjection = read(
    repoRoot,
    'packages/extensions/fireux-places/src/runtime/server/place/public-projection.ts'
  )
  const placePublicStoryEditor = read(
    repoRoot,
    'packages/extensions/fireux-places/src/runtime/components/Place/Edit/PublicStory.vue'
  )
  assert.match(placePublicStoryEditor, /\buseImageStorage\b/)
  assert.match(placePublicStoryEditor, /places\/\$\{placeId\.value\}\/cover/)
  assert.match(
    placePublicStoryEditor,
    /places\/\$\{placeId\.value\}\/gallery\//
  )
  assert.doesNotMatch(
    placePublicStoryEditor,
    /Cover image URL|Gallery image URL|type="url"/
  )
  assert.match(placeMediaMutation, /requireFirebaseStorageDownloadUrl/)
  assert.match(placeMediaMutation, /places\/\$\{target\.placeId\}\/image/)
  assert.match(placeMediaMutation, /places\/\$\{target\.placeId\}\/logo/)
  assert.match(placeMediaMutation, /places\/\$\{target\.placeId\}\/wordmark/)
  assert.match(placeMediaMutation, /places\/\$\{target\.placeId\}\/cover/)
  assert.match(placeMediaMutation, /places\/\$\{target\.placeId\}\/gallery\//)
  assert.deepEqual(typeFields(publicPlaceModel, 'PublicPlaceProjection'), [
    'brand_tagline',
    'id',
    'image_shade',
    'image_url',
    'media_backdrop_color',
    'name',
    'place_type',
    'short_address',
    'short_name',
    'slug',
    'verified',
  ])
  assert.doesNotMatch(
    publicPlaceModel,
    /^  (?:brand_tagline|image_shade|image_url|short_address|short_name|slug|verified)\?:/m,
    'Public Place collection rows must serialize one exact key set.'
  )
  assert.match(
    publicPlaceNormalizer,
    /return \{\s*id,\s*name,\s*place_type:\s*type,\s*short_name:[\s\S]*brand_tagline:[\s\S]*short_address:[\s\S]*image_url:[\s\S]*image_shade:[\s\S]*verified:[\s\S]*slug:/,
    'The shared Place normalizer must materialize every public collection-row key.'
  )
  assert.match(
    publicPlaceServerProjection,
    /normalizePublicPlaceProjection\(\{[\s\S]*return result/,
    'The Live Place API must use the shared exact public collection-row normalizer.'
  )
  assert.match(
    publicPlaceModel,
    /PublicPlaceDetailProjection[\s\S]*cover_image:\s*string[\s\S]*gallery_images:\s*string\[\][\s\S]*logo_image:\s*string[\s\S]*wordmark_image:\s*string[\s\S]*business_hours:\s*PlaceBusinessHours[\s\S]*website:\s*string/,
    'The bounded Place detail must materialize its stable presentation contract.'
  )
  assert.match(
    publicPlaceServerProjection,
    /cover_image:\s*coverImage[\s\S]*gallery_images:\s*galleryImages[\s\S]*logo_image:\s*logoImage[\s\S]*wordmark_image:\s*wordmarkImage[\s\S]*business_hours:\s*businessHours\s*\|\|\s*\{\s*windows:\s*\[\]\s*\}[\s\S]*website,/,
    'The Live Place detail must project normalized Place-owned business hours.'
  )

  const companyModel = read(
    repoRoot,
    'packages/extensions/fireux-companies/src/runtime/models/company.model.ts'
  )
  const canonicalCompany = read(
    repoRoot,
    'packages/extensions/fireux-companies/src/runtime/server/company/canonical.ts'
  )
  const companyMaterializer = read(
    repoRoot,
    'packages/extensions/fireux-companies/src/runtime/server/company/materialize.ts'
  )
  const publicCompanyModel = read(
    repoRoot,
    'packages/extensions/fireux-companies/src/runtime/models/company-public.model.ts'
  )
  const publicCompanyProjection = read(
    repoRoot,
    'packages/extensions/fireux-companies/src/runtime/server/company/public-projection.ts'
  )
  assert.match(companyModel, /kind:\s*'record'/)
  assert.match(companyModel, /parent:\s*'Place'/)
  assert.match(companyModel, /root:\s*CompanyStorage\.path/)
  assert.match(companyModel, /export const CompanyDefaults\s*=/)
  assert.doesNotMatch(companyModel, /export const CompanyModel\s*=/)
  assert.doesNotMatch(companyModel, /CompanyUpdateInput/)
  assert.match(
    canonicalCompany,
    /hasExactKeys\(company,\s*\['created', 'updated'\]\)/
  )
  assert.match(canonicalCompany, /hasExactKeys\(stamp,\s*\['at'\]\)/)
  assert.match(
    companyMaterializer,
    /projectPublicPlace\(id,\s*placeSnapshot\.data \|\| \{\}\)/
  )
  assert.match(
    companyMaterializer,
    /canonicalCompanyRole\(id,\s*companySnapshot\.data\)/
  )
  assert.match(
    publicCompanyModel,
    /export type PublicCompanyProjection = PublicPlaceProjection/
  )
  assert.match(
    publicCompanyModel,
    /export type PublicCompanyDetailProjection = PublicPlaceDetailProjection/
  )
  assert.match(
    publicCompanyProjection,
    /canonicalCompanyRole\(id,\s*companyValue\)/
  )
  assert.match(
    publicCompanyProjection,
    /projectPublicCompanyDetail[\s\S]*projectPublicPlaceDetail\(id,\s*placeValue\)/
  )
  assert.match(publicCompanyProjection, /return place/)
  assert.doesNotMatch(
    publicCompanyProjection,
    /\.\.\.\(place\./,
    'Company public reads must not maintain a second optional copy of the exact Place projection.'
  )

  assert.equal(
    existsSync(
      path.join(
        repoRoot,
        'packages/core/fireux-ecosystem-controller/package.json'
      )
    ),
    false,
    'The obsolete fireux-console endpoint package must not return.'
  )

  console.log('[guard] ✅ entity authority contract valid')
}
