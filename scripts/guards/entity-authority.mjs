// @fireux-script
// last_used: 2026-07-22
// usage_note: run through pnpm guard; locks App/Ecosystem/Project authority boundaries.
// Concurrent edit — 2026-07-20 20:46 CEST — Repo Efficiency Pass 3 of 6: forbid generic cross-domain drift mutation tooling.
// Concurrent edit — 2026-07-20 16:22 CEST — Console Spine pass: lock Project access to UserApp admin membership.
// Concurrent edit — 2026-07-20 20:22 CEST — Repo Efficiency Pass 2 of 6: lock exact projected profile types, transport, and self-only mutations.
// Concurrent edit — 2026-07-22 12:39 CEST — Shared Job spine alignment: lock explicit owner, Place, compensation, and exact-root authority.
// Concurrent edit — 2026-07-22 13:06 CEST — Job category scope hardening: lock exact stored ids and fail-closed public runtime scope.

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
  'packages/core/fireux-core/src/runtime/models/system/ecosystem.model.ts'
const USER_MODEL =
  'packages/core/fireux-core/src/runtime/models/core/user.model.ts'
const DIRECTORY_MODEL =
  'packages/core/fireux-core/src/runtime/models/core/supporting/directory.ts'
const PROFILE_PROVISIONING_MODEL =
  'packages/core/fireux-core/src/runtime/models/core/supporting/profile-provisioning.ts'

export async function run({ repoRoot = process.cwd() } = {}) {
  const appModel = read(repoRoot, APP_MODEL)
  const ecosystemModel = read(repoRoot, ECOSYSTEM_MODEL)
  const projectModel = read(repoRoot, PROJECT_MODEL)
  const userModel = read(repoRoot, USER_MODEL)
  const directoryModel = read(repoRoot, DIRECTORY_MODEL)
  const profileProvisioning = await import(
    pathToFileURL(path.join(repoRoot, PROFILE_PROVISIONING_MODEL)).href
  )

  assert.match(appModel, /project_id:\s*''/)
  assert.match(appModel, /ecosystem_id:\s*''/)
  assert.match(appModel, /ecosystem_id\?:\s*string/)
  assert.doesNotMatch(appModel, /^  (team|ecosystem):/m)

  assert.match(ecosystemModel, /project_id:\s*''/)
  assert.doesNotMatch(ecosystemModel, /^  (apps|team|source_url):/m)

  assert.match(projectModel, /shape:\s*'private\/control-plane-root'/)
  assert.doesNotMatch(
    projectModel,
    /^  (app_id|ecosystem_id|operator_ids|owner_user_id|firebase_project_id|console_endpoint_url|project_type|primary_project):/m
  )
  assert.doesNotMatch(userModel, /project_ids/)

  const { canonicalProfileIndex, isRuntimeProfileEnabled } = profileProvisioning
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
    /function runtimeDatabaseContext\(definition:[\s\S]*isRuntimeProfileEnabled\(fireux\?\.profiles, definition\.id\)[\s\S]*getRuntimeFirestore/
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
    'slug',
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
    'packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/ecosystem/utils/view/useEcosystemInterface.ts'
  )
  assert.match(appManager, /controller:\s*AppDirectoryController/)
  assert.doesNotMatch(appManager, /useAppCollection/)
  assert.match(ecosystemManager, /controller:\s*EcosystemDirectoryController/)
  assert.doesNotMatch(ecosystemManager, /useEcosystemCollection/)
  assert.doesNotMatch(ecosystemInterface, /\b(team|apps)\?:/)
  assert.doesNotMatch(ecosystemInterface, /target\.(team|apps)/)

  const userProfile = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/components/User/Cards/Profile.vue'
  )
  const appProfileView = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/utils/view/useAppProfileView.ts'
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
  assert.match(fireuxEcosystemsPage, /usePlatformEcosystemDirectory/)

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

  const appCreate = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/mutations/useAppCreate.ts'
  )
  assert.doesNotMatch(appCreate, /ProjectBootstrap|createProjectDoc/)
  const appEnsurePayload = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/app/utils/appEnsurePayload.ts'
  )
  assert.match(appEnsurePayload, /patch\.ecosystem_id = deleteField\(\)/)
  assert.match(appEnsurePayload, /\['ecosystem', 'team'\]/)
  const appUserJoinedPublisher = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/server/utils/events/publishAppUserJoinedEvent.ts'
  )
  assert.doesNotMatch(appUserJoinedPublisher, /app\.ecosystem_id/)
  assert.match(appUserJoinedPublisher, /UserNotificationStorage/)
  assert.match(appUserJoinedPublisher, /\.where\('role', '==', 'admin'\)/)
  assert.match(appUserJoinedPublisher, /\.doc\(eventId\)/)
  assert.match(appUserJoinedPublisher, /New user joined/)
  const ecosystemCreate = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/ecosystem/mutations/useEcosystemCreate.ts'
  )
  assert.match(ecosystemCreate, /\['apps', 'team', 'source_url'\]/)
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

  const publicProjectPages = filesBelow(
    path.join(repoRoot, 'projects/fireux/fireux-app/app/pages/projects')
  ).filter((file) => file.endsWith('.vue'))
  assert.deepEqual(
    publicProjectPages,
    [],
    'Project public pages must not return.'
  )

  for (const retiredConsolePage of ['create.vue', 'team.vue']) {
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
    'users',
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
    'packages/core/fireux-core/src/runtime/composables/fireux/firestore/core/project/fetch/useProjectCollection.ts'
  )
  const projectControlApi = read(
    repoRoot,
    'projects/fireux/fireux-app/server/api/internal/control/projects.get.ts'
  )
  assert.doesNotMatch(
    projectCollection,
    /useFirestoreRead|firestoreFetchCollection/
  )
  assert.match(projectCollection, /\/api\/internal\/control\/projects/)
  assert.match(projectControlApi, /requireFirebaseBearerUser/)
  assert.match(projectControlApi, /UserAppStorage\.collection/)
  assert.match(projectControlApi, /membershipSnapshot/)
  assert.match(projectControlApi, /membership\.role/)
  assert.match(projectControlApi, /===\s*['"]admin['"]/)
  assert.doesNotMatch(projectControlApi, /admin_ids/)

  const projectUserJoinPage = read(
    repoRoot,
    'projects/fireux/fireux-app/app/pages/console/project/users.vue'
  )
  const projectUserJoinReceiver = read(
    repoRoot,
    'projects/fireux/fireux-app/server/api/internal/control/user-joins/publications.post.ts'
  )
  const projectUserJoinFeed = read(
    repoRoot,
    'projects/fireux/fireux-app/server/api/internal/control/user-joins/index.get.ts'
  )
  const projectUserJoinPublisher = read(
    repoRoot,
    'packages/core/fireux-core/src/runtime/server/utils/project-user-join/publish.ts'
  )
  assert.match(projectUserJoinPage, /\/api\/internal\/control\/user-joins/)
  assert.match(projectUserJoinPage, /requiresSelection:\s*false/)
  assert.match(projectUserJoinReceiver, /verifyServiceAccountOidc/)
  assert.match(projectUserJoinReceiver, /sourceScopeAllows/)
  assert.match(projectUserJoinReceiver, /ProjectUserJoinStorage\.collection/)
  assert.match(projectUserJoinReceiver, /transaction\.set/)
  assert.match(projectUserJoinReceiver, /ProjectUserJoinStorage\.maxItems/)
  assert.doesNotMatch(projectUserJoinReceiver, /transaction\.(?:update|delete)/)
  assert.match(projectUserJoinFeed, /requireFireuxAppAdmin/)
  assert.match(projectUserJoinFeed, /ProjectUserJoinStorage\.document/)
  assert.doesNotMatch(
    projectUserJoinFeed,
    /\.collectionGroup\(|\.where\(|\.orderBy\(/
  )
  assert.match(projectUserJoinPublisher, /getIdTokenClient/)
  assert.match(projectUserJoinPublisher, /AbortSignal\.timeout/)

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
  const placeMutation = read(
    repoRoot,
    'packages/extensions/fireux-places/src/runtime/server/place/mutate.ts'
  )

  assert.match(
    placeMutation,
    /Object\.hasOwn\(kitchen,\s*['"]app_scope_state['"]\)/
  )
  assert.match(
    placeMutation,
    /Object\.hasOwn\(kitchen,\s*['"]app_scope_app_id['"]\)/
  )
  assert.match(
    placeMutation,
    /rootKitchenScope\?\.appId\s*===\s*kitchenAuthority\.appId/
  )
  assert.match(
    placeMutation,
    /kitchenAuthority\.appId\s*!==\s*runtimeAppId/
  )
  assert.doesNotMatch(
    placeMutation,
    /appScope\.app_id\s*\|\|\s*kitchen\.app_scope_app_id/
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
    /import type \{ FinancialMoney \} from ['"]fireux-finance\/runtime\/models\/money\.model\.ts['"]/
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
  assert.deepEqual(typeFields(publicPlaceModel, 'PublicPlaceProjection'), [
    'brand_tagline',
    'id',
    'image_shade',
    'image_url',
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
  assert.match(
    canonicalCompany,
    /hasExactKeys\(company,\s*\['created', 'updated'\]\)/
  )
  assert.match(canonicalCompany, /hasExactKeys\(stamp,\s*\['at'\]\)/)
  assert.match(companyMaterializer, /projectPublicPlace\(id,\s*placeSnapshot\.data\(\) \|\| \{\}\)/)
  assert.match(
    companyMaterializer,
    /canonicalCompanyRole\(id,\s*companySnapshot\.data\(\)\)/
  )
  assert.match(
    publicCompanyModel,
    /export type PublicCompanyProjection = PublicPlaceProjection/
  )
  assert.match(
    publicCompanyProjection,
    /canonicalCompanyRole\(id,\s*companyValue\)/
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
