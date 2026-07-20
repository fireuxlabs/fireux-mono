// @fireux-script
// last_used: 2026-07-20
// usage_note: run through pnpm guard; locks App/Ecosystem/Project authority boundaries.
// Concurrent edit — 2026-07-20 20:46 CEST — Repo Efficiency Pass 3 of 6: forbid generic cross-domain drift mutation tooling.
// Concurrent edit — 2026-07-20 16:22 CEST — Console Spine pass: lock Project access to UserApp admin membership.
// Concurrent edit — 2026-07-20 20:22 CEST — Repo Efficiency Pass 2 of 6: lock exact projected profile types, transport, and self-only mutations.

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
      'packages/extensions/fireux-jobs/src/runtime/pages/agents/[id].vue',
      'agents',
      'agent',
    ],
    [
      'packages/extensions/fireux-jobs/src/runtime/pages/professionals/[id].vue',
      'professionals',
      'professional',
    ],
    [
      'packages/extensions/fireux-kitchens/src/runtime/pages/chefs/[id].vue',
      'chefs',
      'chef',
    ],
  ]) {
    const source = read(repoRoot, pagePath)
    assert.match(source, /await usePublicProfileDetail/)
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

  for (const page of ['index', 'overview', 'identity', 'apps', 'ecosystem']) {
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
