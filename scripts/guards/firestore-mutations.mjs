// @fireux-script
// last_used: 2026-08-09
// usage_note: run through pnpm guard; enforces the three-lane Firestore mutation spine.

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { isGeneratedArtifactPath } from './_lib/filesystem-policy.mjs'
import { Timestamp } from 'firebase-admin/firestore'
import { materializeMcpSkillValue } from '../_lib/firestore-mutations/mcp-skill-common.mjs'

const SOURCE_ROOTS = ['packages', 'projects', 'scripts', 'tools']
const SOURCE_EXTENSIONS = new Set(['.ts', '.js', '.mjs', '.vue'])
const CLIENT_MUTATION_IMPORT =
  /import\s*\{([^}]*\b(?:addDoc|setDoc|updateDoc|deleteDoc|writeBatch|runTransaction)\b[^}]*)\}\s*from\s*['"]firebase\/firestore['"]/s
const ADMIN_CONTEXT =
  /firebase-admin\/firestore|getRuntimeFirestore|getFirestore\s*\(/
const ADMIN_DOCUMENT_WRITE =
  /\b(?:transaction|batch|bulkWriter|writer|[A-Za-z]\w*(?:Ref|Reference))\.(?:create|set|update|delete)\s*\(|\.doc\s*\([^)]*\)\.(?:create|set|update|delete)\s*\(/

const APPROVED_CLIENT_IMPLEMENTATIONS = new Set([
  'packages/core/fireux-core/src/runtime/composables/fireux/firestore/operations/useFirestoreCreate.ts',
  'packages/core/fireux-core/src/runtime/composables/fireux/firestore/operations/useFirestoreUpdate.ts',
  'packages/core/fireux-core/src/runtime/composables/fireux/firestore/operations/useFirestoreDelete.ts',
])

const APPROVED_ADMIN_IMPLEMENTATIONS = new Set([
  'packages/core/fireux-core/src/runtime/app/server/relationships/ecosystem-reference.ts',
  'packages/core/fireux-core/src/runtime/app/server/app-users/user-app-reference.ts',
  'packages/core/fireux-core/src/runtime/server/utils/firestore-mutations/server-create.ts',
  'packages/core/fireux-core/src/runtime/server/utils/firestore-mutations/server-update.ts',
  'packages/core/fireux-core/src/runtime/server/utils/firestore-mutations/server-delete.ts',
  'packages/core/fireux-core/src/runtime/server/utils/firestore-mutations/server-transaction.ts',
  'scripts/_lib/firestore-mutations/mcp-skill-create.mjs',
  'scripts/_lib/firestore-mutations/mcp-skill-update.mjs',
  'scripts/_lib/firestore-mutations/mcp-skill-delete.mjs',
  'scripts/reconcile-user-app-references.mjs',
  'scripts/reconcile-ecosystem-app-references.mjs',
])

// Phase-one debt ledger. Entries may only be removed as consumers migrate to a
// typed lane; additions fail the guard. This turns the pre-spine writers into a
// bounded, executable remaining-file inventory instead of an expanding allowlist.
const LEGACY_CLIENT_WRITER_FINGERPRINT =
  'd91d367ad3fe9b20e20e35915a5557d12c0b9f9224db8a1a6caf7dad076f5b65'
const LEGACY_ADMIN_WRITER_FINGERPRINT =
  'ed37db6128cde1dd64751d14aebf87f5e875eb620ec00357612a3c154102e326'

function sourceFiles(repoRoot) {
  const files = []
  const pending = SOURCE_ROOTS.map((root) => path.join(repoRoot, root))
  while (pending.length) {
    const directory = pending.pop()
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name)
      const relative = path.relative(repoRoot, absolute)
      if (isGeneratedArtifactPath(relative)) continue
      if (entry.isDirectory()) pending.push(absolute)
      else if (
        entry.isFile() &&
        SOURCE_EXTENSIONS.has(path.extname(entry.name))
      )
        files.push(relative)
    }
  }
  return files.sort()
}

export function collectFirestoreMutationWriters(repoRoot) {
  const client = []
  const admin = []
  for (const relative of sourceFiles(repoRoot)) {
    const source = readFileSync(path.join(repoRoot, relative), 'utf8')
    if (CLIENT_MUTATION_IMPORT.test(source)) client.push(relative)
    if (ADMIN_CONTEXT.test(source) && ADMIN_DOCUMENT_WRITE.test(source))
      admin.push(relative)
  }
  return { client, admin }
}

function debt(found, approved) {
  return found.filter((file) => !approved.has(file))
}

function fingerprint(files) {
  return createHash('sha256').update(files.join('\n')).digest('hex')
}

export function run({ repoRoot }) {
  const taggedIso = '2026-08-20T19:35:20.587Z'
  const ordinary = {
    label: 'preserved',
    nested: [{ at: { __timestamp: taggedIso }, count: 2 }],
  }
  const materialized = materializeMcpSkillValue(ordinary)
  assert.equal(materialized.label, ordinary.label)
  assert.equal(materialized.nested[0].count, 2)
  assert.ok(materialized.nested[0].at instanceof Timestamp)
  assert.equal(materialized.nested[0].at.toDate().toISOString(), taggedIso)
  assert.deepEqual(ordinary.nested[0].at, { __timestamp: taggedIso })
  assert.deepEqual(
    materializeMcpSkillValue({ __timestamp: taggedIso, note: 'ordinary' }),
    { __timestamp: taggedIso, note: 'ordinary' },
    'Objects with additional fields must not be treated as timestamp tags.'
  )
  const entityCanonMigration = readFileSync(
    path.join(repoRoot, 'scripts/migrate-firestore-entity-canon.mjs'),
    'utf8'
  )
  assert.match(entityCanonMigration, /family\s*=\s*String\(args\.family/)
  assert.match(
    entityCanonMigration,
    /family\s*&&\s*family\s*!==\s*'products'/,
    'Entity canon migration must reject unimplemented family selectors.'
  )
  assert.match(
    entityCanonMigration,
    /repair === 'product-price-timestamps'[\s\S]*planProductPriceTimestampRepair/,
    'ProductPrice timestamp repair must use its bounded Product-only planner.'
  )
  assert.match(
    entityCanonMigration,
    /if\s*\(!family\s*&&\s*!repair\)\s*\{[\s\S]*?db\.collection\('apps'\)/,
    'Product-only migration must exclude App-owned non-Product planning.'
  )
  assert.match(
    entityCanonMigration,
    /Object\.hasOwn\(stamp,\s*'at'\)[\s\S]*return \{ value: stamp \}[\s\S]*snapshotTimestamp/,
    'Stored canonical ProductPrice stamps must win over snapshot metadata fallbacks.'
  )
  assert.match(
    entityCanonMigration,
    /field === 'created' \? 'createTime' : 'updateTime'/,
    'Missing ProductPrice stamps must fall back to the corresponding Firestore snapshot metadata.'
  )
  assert.match(
    entityCanonMigration,
    /Canonical ProductPrice \$\{field\}\.at is not a Firestore timestamp/,
    'Existing ProductPrice stamps must be validated rather than silently replaced.'
  )
  assert.match(
    entityCanonMigration,
    /text\(metadata\.category\)[\s\S]*categories:\s*\[\.\.\.new Set\(categories\)\]/,
    'Product migration must preserve and deduplicate the authored singular category.'
  )
  assert.match(
    entityCanonMigration,
    /await planPatch\(targetPath,\s*price\.data,\s*price\.sourcePath\)/,
    'Existing canonical ProductPrice children must receive their missing stamps through a patch.'
  )
  assert.equal(
    existsSync(
      path.join(
        repoRoot,
        'packages/core/fireux-core/src/runtime/composables/fireux/firestore/operations/useFirestoreCreate.ts'
      )
    ),
    true,
    'Client Create must share the path-based Firestore primitive contract.'
  )
  const topLevelEntrances = [
    ['app', 'useApp'],
    ['user', 'useUser'],
    ['ecosystem', 'useEcosystem'],
  ]
  for (const [family, entrance] of topLevelEntrances) {
    const directory = path.join(
      repoRoot,
      `packages/core/fireux-core/src/runtime/${family}/composables`
    )
    for (const suffix of ['', 'Read', 'Create', 'Update', 'Delete']) {
      assert.equal(
        existsSync(path.join(directory, `${entrance}${suffix}.ts`)),
        true,
        `${entrance} must expose the complete root client CRUD family.`
      )
    }
    const facade = readFileSync(path.join(directory, `${entrance}.ts`), 'utf8')
    assert.match(facade, /read:\s*\{\s*data:/)
    assert.match(facade, /\bcreate:/)
    assert.match(facade, /\bupdate:/)
    assert.match(facade, /\bdelete:/)
  }
  const serverCrudFamilies = [
    ['app/server', 'App'],
    ['user/server', 'User'],
    ['ecosystem/server', 'Ecosystem'],
    ['app/server/app-user', 'AppUser'],
  ]
  for (const [owner, entity] of serverCrudFamilies) {
    const directory = path.join(
      repoRoot,
      `packages/core/fireux-core/src/runtime/${owner}`
    )
    for (const verb of ['read', 'create', 'update', 'delete']) {
      const file = path.join(directory, `${verb}.ts`)
      assert.equal(existsSync(file), true, `${entity} must expose server ${verb}.`)
      const source = readFileSync(file, 'utf8')
      assert.match(source, new RegExp(`export async function ${verb}${entity}\\b`))
    }
  }
  const userEntrance = readFileSync(
    path.join(
      repoRoot,
      'packages/core/fireux-core/src/runtime/user/composables/useUser.ts'
    ),
    'utf8'
  )
  assert.doesNotMatch(
    userEntrance,
    /useAuth|useAppUser|useUserSession/,
    'Root User CRUD must not absorb authentication or AppUser composition.'
  )
  const appUserEntrance = readFileSync(
    path.join(
      repoRoot,
      'packages/core/fireux-core/src/runtime/app/composables/useAppUser.ts'
    ),
    'utf8'
  )
  assert.match(appUserEntrance, /useAppUserRead/)
  assert.match(appUserEntrance, /useAppUserCreate/)
  assert.match(appUserEntrance, /useAppUserUpdate/)
  assert.match(appUserEntrance, /useAppUserDelete/)
  assert.match(appUserEntrance, /read:\s*\{\s*data:/)
  assert.match(appUserEntrance, /\bdelete:/)
  const appUserCreate = readFileSync(
    path.join(
      repoRoot,
      'packages/core/fireux-core/src/runtime/app/composables/useAppUserCreate.ts'
    ),
    'utf8'
  )
  assert.match(appUserCreate, /useFirestoreCreate/)
  assert.match(appUserCreate, /createDocument\(/)
  const appUserDelete = readFileSync(
    path.join(
      repoRoot,
      'packages/core/fireux-core/src/runtime/app/composables/useAppUserDelete.ts'
    ),
    'utf8'
  )
  assert.match(appUserDelete, /useFirestoreDelete/)
  assert.match(appUserDelete, /deleteDocument\(/)
  const userAppReferenceModel = readFileSync(
    path.join(
      repoRoot,
      'packages/core/fireux-core/src/runtime/user/models/user-app-reference.model.ts'
    ),
    'utf8'
  )
  assert.match(
    userAppReferenceModel,
    /USER_APP_REFERENCE_PATH\s*=\s*'users\/\{userId\}\/apps\/\{appId\}'/
  )
  assert.match(userAppReferenceModel, /app_id:\s*string/)
  assert.match(userAppReferenceModel, /database_id:\s*string/)
  assert.doesNotMatch(userAppReferenceModel, /role|subscription|access/)
  const userAppReconciler = readFileSync(
    path.join(
      repoRoot,
      'packages/core/fireux-core/src/runtime/app/server/app-users/user-app-reference.ts'
    ),
    'utf8'
  )
  assert.match(
    userAppReconciler,
    /collection\('apps'\)[\s\S]*collection\('users'\)/
  )
  assert.match(
    userAppReconciler,
    /collection\('users'\)[\s\S]*collection\('apps'\)/
  )
  assert.match(
    userAppReconciler,
    /if \(!membership\.exists\)[\s\S]*reference\.delete\(\)/
  )
  assert.match(userAppReconciler, /app_id:\s*input\.appId/)
  assert.match(userAppReconciler, /database_id:\s*input\.appDatabaseId/)
  const membershipMutation = readFileSync(
    path.join(
      repoRoot,
      'packages/core/fireux-core/src/runtime/app/server/app-users/mutate.ts'
    ),
    'utf8'
  )
  assert.match(
    membershipMutation,
    /const result = await mutateInTransaction[\s\S]*await reconcileUserAppReference[\s\S]*return result/
  )
  const appInitialization = readFileSync(
    path.join(
      repoRoot,
      'packages/core/fireux-core/src/runtime/app/server/initialization/initialize.ts'
    ),
    'utf8'
  )
  assert.match(appInitialization, /await reconcileUserAppReference/)
  const referenceReconciliation = readFileSync(
    path.join(repoRoot, 'scripts/reconcile-user-app-references.mjs'),
    'utf8'
  )
  assert.match(referenceReconciliation, /const apply = Boolean\(args\.apply\)/)
  assert.match(referenceReconciliation, /mode: apply \? 'apply' : 'dry-run'/)
  assert.match(
    referenceReconciliation,
    /if \(apply\) \{[\s\S]*await reference\.set/
  )
  assert.doesNotMatch(
    referenceReconciliation,
    /collection\('apps'\)\.doc\(appId\)\.collection\('users'\)[\s\S]*\.(?:set|create|update|delete)\(/,
    'Reference reconciliation must never mutate canonical AppUsers.'
  )
  const ecosystemAppReferenceModel = readFileSync(
    path.join(
      repoRoot,
      'packages/core/fireux-core/src/runtime/ecosystem/models/ecosystem-app-reference.model.ts'
    ),
    'utf8'
  )
  assert.match(
    ecosystemAppReferenceModel,
    /ecosystems\/\{ecosystemId\}\/apps\/\{appId\}/
  )
  assert.match(ecosystemAppReferenceModel, /app_id:\s*string/)
  assert.match(ecosystemAppReferenceModel, /database_id:\s*string/)
  assert.doesNotMatch(ecosystemAppReferenceModel, /role|status|access/)
  assert.match(appInitialization, /await reconcileAppEcosystemReference/)
  const ecosystemReferenceReconciliation = readFileSync(
    path.join(repoRoot, 'scripts/reconcile-ecosystem-app-references.mjs'),
    'utf8'
  )
  assert.match(
    ecosystemReferenceReconciliation,
    /const apply = Boolean\(args\.apply\)/
  )
  assert.match(
    ecosystemReferenceReconciliation,
    /mode: apply \? 'apply' : 'dry-run'/
  )
  const targetsSource = readFileSync(
    path.join(
      repoRoot,
      'packages/core/fireux-core/src/runtime/utils/firestore-mutations/targets.ts'
    ),
    'utf8'
  )
  const serverTargetsSource = readFileSync(
    path.join(
      repoRoot,
      'packages/core/fireux-core/src/runtime/utils/firestore-mutations/server-targets.ts'
    ),
    'utf8'
  )
  const kitchenMemberInvitationTargetsPath =
    'packages/extensions/fireux-kitchens/src/runtime/kitchen/server/team/mutation-targets.ts'
  const kitchenMemberInvitationTargetsSource = readFileSync(
    path.join(repoRoot, kitchenMemberInvitationTargetsPath),
    'utf8'
  )
  assert.equal(
    existsSync(
      path.join(
        repoRoot,
        'packages/core/fireux-core/src/runtime/utils/firestore-mutations/kitchen-member-targets.ts'
      )
    ),
    false,
    'Kitchen member-invitation targets must remain owned by the Kitchen Team domain.'
  )
  assert.match(
    kitchenMemberInvitationTargetsSource,
    /defineFirestoreMutationTarget[\s\S]*collectionPath:\s*`kitchens\/\$\{kitchen\}\/member-invitations`/,
    'Kitchen Team must define its member-invitation target through the generic Core target API.'
  )
  for (const file of ['delete.ts', 'member-invitation.ts']) {
    const source = readFileSync(
      path.join(
        repoRoot,
        'packages/extensions/fireux-kitchens/src/runtime/kitchen/server/team',
        file
      ),
      'utf8'
    )
    assert.match(source, /from '\.\/mutation-targets\.ts'/)
    assert.doesNotMatch(
      source,
      /serverKitchenMemberInvitationsTarget[\s\S]*from 'fireux-core\//,
      'Kitchen Team consumers must not import their invitation target from Core.'
    )
  }
  assert.match(
    targetsSource,
    /projectMeta:[\s\S]*lane:\s*'mcp-skill'[\s\S]*database:\s*\{ kind:\s*'default' \}[\s\S]*collectionPath:\s*'project'/,
    'The default Project metadata target must remain MCP/Skill-owned at (default)/project.'
  )
  assert.match(
    targetsSource,
    /ecosystemMeta:[\s\S]*lane:\s*'mcp-skill'[\s\S]*database:\s*\{ kind:\s*'default' \}[\s\S]*collectionPath:\s*'ecosystem'/,
    'The default Ecosystem metadata target must remain MCP/Skill-owned at (default)/ecosystem.'
  )
  assert.doesNotMatch(targetsSource, /appMeta|runtimeAppMeta|app-directory/)
  assert.match(
    targetsSource,
    /fireuxProjects:[\s\S]*lane:\s*'server'[\s\S]*database:\s*\{ kind:\s*'named', databaseId:\s*'fireux' \}[\s\S]*collectionPath:\s*'projects'/,
    'The canonical Project Workspace Entity target must remain Server-owned at fireux/projects.'
  )
  assert.doesNotMatch(
    targetsSource,
    /database:\s*\{ kind:\s*'default' \}[\s\S]{0,100}collectionPath:\s*'projects'/,
    'The canonical projects collection must never be placed in (default).'
  )
  const appUpdateSource = readFileSync(
    path.join(
      repoRoot,
      'packages/core/fireux-core/src/runtime/app/composables/useAppUpdate.ts'
    ),
    'utf8'
  )
  assert.match(appUpdateSource, /useFirestoreUpdate/)
  assert.match(appUpdateSource, /updateDocument<App>\('apps'/)
  const appCrudRoot = path.join(
    repoRoot,
    'packages/core/fireux-core/src/runtime/app/composables'
  )
  const appFacade = readFileSync(path.join(appCrudRoot, 'useApp.ts'), 'utf8')
  for (const operation of ['read', 'create', 'update', 'delete']) {
    assert.match(
      appFacade,
      new RegExp(`\\b${operation}(?:\\s*:|\\s*[,}])`),
      `useApp must expose its aligned ${operation} member.`
    )
  }
  assert.match(appFacade, /useAppRead/)
  assert.match(appFacade, /useAppDelete/)
  assert.match(appFacade, /\bdelete:/)
  assert.doesNotMatch(appFacade, /usePublicApp|usePrivateApp/)

  const appCreateSource = readFileSync(
    path.join(appCrudRoot, 'useAppCreate.ts'),
    'utf8'
  )
  assert.match(appCreateSource, /useFirestoreCreate/)
  assert.match(appCreateSource, /createDocument\('apps'/)

  const appDeleteSource = readFileSync(
    path.join(appCrudRoot, 'useAppDelete.ts'),
    'utf8'
  )
  assert.match(appDeleteSource, /useFirestoreDelete/)
  assert.match(appDeleteSource, /deleteDocument\('apps'/)
  assert.match(appDeleteSource, /does not cascade/)
  for (const source of [
    appFacade,
    appCreateSource,
    appUpdateSource,
    appDeleteSource,
  ]) {
    assert.doesNotMatch(
      source,
      /useRequireUser|AppUser|\/api\/|useAsyncData|mutateAppUser/,
      'The basic App CRUD seam must not depend on later User, AppUser, or Server systems.'
    )
  }

  const appManagementSource = readFileSync(
    path.join(appCrudRoot, 'useAppManagement.ts'),
    'utf8'
  )
  assert.match(appManagementSource, /\/api\/internal\/app\/settings/)
  assert.match(appManagementSource, /mutateAppUser/)

  const userCrudRoot = path.join(
    repoRoot,
    'packages/core/fireux-core/src/runtime/user/composables'
  )
  const userFacade = readFileSync(path.join(userCrudRoot, 'useUser.ts'), 'utf8')
  for (const operation of ['read', 'create', 'update', 'delete']) {
    assert.match(
      userFacade,
      new RegExp(`\\b${operation}(?:\\s*:|\\s*[,}])`),
      `useUser must expose its aligned ${operation} member.`
    )
  }
  assert.match(userFacade, /useUserRead/)
  assert.match(userFacade, /useUserDelete/)
  assert.match(userFacade, /\bdelete:/)
  assert.doesNotMatch(userFacade, /usePublicUser|usePrivateUser/)

  const userDeleteSource = readFileSync(
    path.join(userCrudRoot, 'useUserDelete.ts'),
    'utf8'
  )
  assert.match(userDeleteSource, /useFirestoreDelete/)
  assert.match(userDeleteSource, /deleteDocument\('users'/)
  assert.match(userDeleteSource, /does not cascade/)
  assert.match(
    serverTargetsSource,
    /serverKitchenMenuUploadsTarget[\s\S]*serverKitchenChildTarget\([^\n]*'kitchens\.menu-uploads',\s*'menu-uploads'\)/,
    'Kitchen Menu uploads must use their runtime Server target.'
  )
  for (const file of ['upload.post.ts', 'source-url.post.ts']) {
    const source = readFileSync(
      path.join(
        repoRoot,
        'packages/extensions/fireux-kitchens/src/runtime/server/api/workspace/kitchen/menus',
        file
      ),
      'utf8'
    )
    assert.match(source, /serverKitchenMenuUploadsTarget/)
    assert.match(source, /serverCreate/)
    assert.match(source, /serverUpdate/)
    assert.doesNotMatch(source, /uploadRef\.(?:create|set|update|delete)\(/)
  }
  const kitchenMenuDraftWrite = readFileSync(
    path.join(
      repoRoot,
      'packages/extensions/fireux-kitchens/src/runtime/menu/server/draft/write.ts'
    ),
    'utf8'
  )
  assert.match(kitchenMenuDraftWrite, /runGuardedServerTransaction/)
  for (const target of [
    'serverKitchenMenusTarget',
    'serverKitchenDishesTarget',
    'serverKitchenMenuSectionsTarget',
    'serverKitchenMenuItemsTarget',
  ]) {
    assert.match(kitchenMenuDraftWrite, new RegExp(target))
  }
  assert.doesNotMatch(kitchenMenuDraftWrite, /\.batch\(|writeBatch|deleteBatch/)
  const kitchenRootMenuCreate = readFileSync(
    path.join(
      repoRoot,
      'packages/extensions/fireux-kitchens/src/runtime/server/api/menus/create.post.ts'
    ),
    'utf8'
  )
  assert.match(kitchenRootMenuCreate, /FIRESTORE_MUTATION_TARGETS\.menus/)
  assert.match(kitchenRootMenuCreate, /serverCreate/)
  assert.doesNotMatch(
    kitchenRootMenuCreate,
    /menuRef\.(?:create|set|update|delete)\(/
  )
  const kitchenIngredientCuration = readFileSync(
    path.join(
      repoRoot,
      'packages/extensions/fireux-kitchens/src/runtime/ingredient/server/curation.ts'
    ),
    'utf8'
  )
  assert.match(kitchenIngredientCuration, /runGuardedServerTransaction/)
  assert.match(
    kitchenIngredientCuration,
    /FIRESTORE_MUTATION_TARGETS\.ingredients/
  )
  assert.match(kitchenIngredientCuration, /mutations\.create/)
  assert.match(kitchenIngredientCuration, /mutations\.update/)
  assert.doesNotMatch(
    kitchenIngredientCuration,
    /\.runTransaction\(|transaction\.|\.set\(/
  )
  const kitchenIngredientCurationStorage = readFileSync(
    path.join(
      repoRoot,
      'packages/extensions/fireux-kitchens/src/runtime/ingredient/server/curation-storage.ts'
    ),
    'utf8'
  )
  assert.match(kitchenIngredientCurationStorage, /mutations\.readAll/)
  assert.match(kitchenIngredientCurationStorage, /mutations\.read/)
  assert.doesNotMatch(
    kitchenIngredientCurationStorage,
    /getRuntimeFirestore|\.collection\(|\.doc\(/
  )
  const ignitionConversationCreate = readFileSync(
    path.join(
      repoRoot,
      'projects/fireux/fireux-app/server/api/conversations/index.post.ts'
    ),
    'utf8'
  )
  assert.match(ignitionConversationCreate, /runGuardedServerTransaction/)
  assert.match(ignitionConversationCreate, /serverAppConversationsTarget/)
  assert.match(ignitionConversationCreate, /serverConversationMessagesTarget/)
  assert.match(
    ignitionConversationCreate,
    /serverIdentityUserNotificationsTarget/
  )
  assert.doesNotMatch(
    ignitionConversationCreate,
    /\.batch\(|batch\.|\.runTransaction\(|transaction\./
  )
  const ignitionConversationUpdate = readFileSync(
    path.join(
      repoRoot,
      'projects/fireux/fireux-app/server/api/internal/control/ignition-requests/[requestId].patch.ts'
    ),
    'utf8'
  )
  assert.match(ignitionConversationUpdate, /runGuardedServerTransaction/)
  assert.match(ignitionConversationUpdate, /serverAppConversationsTarget/)
  assert.doesNotMatch(
    ignitionConversationUpdate,
    /\.batch\(|batch\.|\.runTransaction\(|transaction\./
  )
  const kitchenMenuConfirm = readFileSync(
    path.join(
      repoRoot,
      'packages/extensions/fireux-kitchens/src/runtime/server/api/workspace/kitchen/menus/confirm.post.ts'
    ),
    'utf8'
  )
  assert.match(kitchenMenuConfirm, /serverKitchenMenuUploadsTarget/)
  assert.match(kitchenMenuConfirm, /serverUpdate/)
  assert.doesNotMatch(
    kitchenMenuConfirm,
    /sourceRef\.(?:create|set|update|delete)\(/
  )
  const kitchenMenuAiUsage = readFileSync(
    path.join(
      repoRoot,
      'packages/extensions/fireux-kitchens/src/runtime/menu/server/ai/usage.ts'
    ),
    'utf8'
  )
  assert.match(kitchenMenuAiUsage, /runGuardedServerTransaction/)
  assert.match(kitchenMenuAiUsage, /serverKitchenMenuUploadsTarget/)
  assert.match(kitchenMenuAiUsage, /serverKitchenAiUsageTarget/)
  assert.match(kitchenMenuAiUsage, /mutations\.update/)
  assert.match(kitchenMenuAiUsage, /mutations\.create/)
  assert.doesNotMatch(
    kitchenMenuAiUsage,
    /sourceRef|kitchenPath|\.batch\(|batch\.|\.runTransaction\(|transaction\./
  )
  const kitchenMenuRootEntry = readFileSync(
    path.join(
      repoRoot,
      'packages/extensions/fireux-kitchens/src/runtime/menu/server/draft/root-entry.ts'
    ),
    'utf8'
  )
  assert.match(kitchenMenuRootEntry, /FIRESTORE_MUTATION_TARGETS\.menus/)
  assert.match(kitchenMenuRootEntry, /serverCreate/)
  assert.match(kitchenMenuRootEntry, /serverUpdate/)
  const kitchenMenuDirectorySync = readFileSync(
    path.join(
      repoRoot,
      'packages/extensions/fireux-kitchens/src/runtime/menu/server/directory/sync.ts'
    ),
    'utf8'
  )
  assert.match(kitchenMenuDirectorySync, /FIRESTORE_MUTATION_TARGETS\.menus/)
  assert.match(kitchenMenuDirectorySync, /serverUpdate/)
  assert.match(kitchenMenuDirectorySync, /ensureKitchenMenuRootEntry/)
  const kitchenMenuClientUpdate = readFileSync(
    path.join(
      repoRoot,
      'packages/extensions/fireux-kitchens/src/runtime/menu/composables/firestore/mutations/useMenuUpdate.ts'
    ),
    'utf8'
  )
  assert.match(kitchenMenuClientUpdate, /syncMenuDirectory/)
  assert.doesNotMatch(
    kitchenMenuClientUpdate,
    /RootMenuStorage|readMenuRootEntryDocs|FIRESTORE_MUTATION_TARGETS\.menus/
  )
  const kitchenOrderTransition = readFileSync(
    path.join(
      repoRoot,
      'packages/extensions/fireux-kitchens/src/runtime/server/api/workspace/kitchen/orders/transition.post.ts'
    ),
    'utf8'
  )
  assert.match(kitchenOrderTransition, /runGuardedServerTransaction/)
  for (const target of [
    'serverKitchenOrdersTarget',
    'serverKitchenSalesTarget',
    'serverAppFinancialFactsTarget',
  ]) {
    assert.match(kitchenOrderTransition, new RegExp(target))
  }
  assert.doesNotMatch(
    kitchenOrderTransition,
    /\.runTransaction\(|transaction\./
  )
  const kitchenOrderNotification = readFileSync(
    path.join(
      repoRoot,
      'packages/extensions/fireux-kitchens/src/runtime/kitchen/server/operations/orders/customer-notification.ts'
    ),
    'utf8'
  )
  assert.match(kitchenOrderNotification, /runGuardedServerTransaction/)
  assert.match(
    kitchenOrderNotification,
    /serverIdentityUserNotificationsTarget/
  )
  assert.doesNotMatch(
    kitchenOrderNotification,
    /\.runTransaction\(|transaction\./
  )
  const kitchenOrderServiceSequence = readFileSync(
    path.join(
      repoRoot,
      'packages/extensions/fireux-kitchens/src/runtime/kitchen/server/operations/orders/service-sequence.ts'
    ),
    'utf8'
  )
  assert.match(kitchenOrderServiceSequence, /runGuardedServerTransaction/)
  for (const target of [
    'serverKitchenOrderServiceTarget',
    'serverKitchenOrdersTarget',
    'serverUserOrdersTarget',
  ]) {
    assert.match(kitchenOrderServiceSequence, new RegExp(target))
  }
  assert.doesNotMatch(
    kitchenOrderServiceSequence,
    /orderPath:\s*string|linkedRecord\.path|\.runTransaction\(|transaction\./
  )
  const kitchenOrderIdempotency = readFileSync(
    path.join(
      repoRoot,
      'packages/extensions/fireux-kitchens/src/runtime/menu/server/ordering/idempotency.ts'
    ),
    'utf8'
  )
  assert.match(kitchenOrderIdempotency, /runGuardedServerTransaction/)
  assert.match(kitchenOrderIdempotency, /serverKitchenOrderIdempotencyTarget/)
  assert.match(kitchenOrderIdempotency, /serverKitchenOrdersTarget/)
  assert.match(kitchenOrderIdempotency, /serverUserOrdersTarget/)
  assert.doesNotMatch(
    kitchenOrderIdempotency,
    /linkedRecord\.path|\.runTransaction\(|transaction\./
  )
  const kitchenPaymentWriters = [
    'packages/extensions/fireux-kitchens/src/runtime/server/api/menus/[menuId]/orders/[orderId]/checkout-session.post.ts',
    'packages/extensions/fireux-kitchens/src/runtime/server/api/menus/[menuId]/orders/[orderId]/customer-response.post.ts',
    'packages/extensions/fireux-kitchens/src/runtime/server/api/menus/payments/stripe-webhook.post.ts',
  ]
  for (const file of kitchenPaymentWriters) {
    const source = readFileSync(path.join(repoRoot, file), 'utf8')
    assert.match(source, /runGuardedServerTransaction/)
    assert.match(source, /serverKitchenOrdersTarget/)
    assert.match(source, /mutations\.update/)
    assert.doesNotMatch(source, /\.runTransaction\(|transaction\./)
  }
  const kitchenWhatsAppDispatch = readFileSync(
    path.join(
      repoRoot,
      'packages/extensions/fireux-kitchens/src/runtime/menu/server/ordering/whatsapp.ts'
    ),
    'utf8'
  )
  assert.match(kitchenWhatsAppDispatch, /runGuardedServerTransaction/)
  assert.match(kitchenWhatsAppDispatch, /serverKitchenOrdersTarget/)
  assert.match(kitchenWhatsAppDispatch, /mutations\.update/)
  assert.doesNotMatch(
    kitchenWhatsAppDispatch,
    /\.runTransaction\(|transaction\.|\.doc\(/
  )
  const kitchenDriverDispatch = readFileSync(
    path.join(
      repoRoot,
      'packages/extensions/fireux-kitchens/src/runtime/user/server/driver/dispatch.ts'
    ),
    'utf8'
  )
  assert.match(kitchenDriverDispatch, /runGuardedServerTransaction/)
  for (const target of ['serverAppUsersTarget', 'serverKitchenOrdersTarget']) {
    assert.match(kitchenDriverDispatch, new RegExp(target))
  }
  assert.match(kitchenDriverDispatch, /mutations\.update/)
  assert.doesNotMatch(kitchenDriverDispatch, /\.runTransaction\(|transaction\./)
  const marketplaceStoreWriters = [
    'packages/extensions/fireux-marketplace/src/runtime/marketplace-store/server/moderation/commands.ts',
    'packages/extensions/fireux-marketplace/src/runtime/marketplace-store/server/stores/commands.ts',
  ]
  for (const file of marketplaceStoreWriters) {
    const source = readFileSync(path.join(repoRoot, file), 'utf8')
    assert.match(source, /runGuardedServerTransaction/)
    assert.match(source, /serverMarketplaceStoresTarget/)
    assert.match(source, /mutations\.update|mutations\.create/)
    assert.doesNotMatch(source, /\.runTransaction\(|transaction\./)
  }
  const marketplaceStoreWriter = readFileSync(
    path.join(repoRoot, marketplaceStoreWriters[1]),
    'utf8'
  )
  assert.doesNotMatch(
    marketplaceStoreWriter,
    /mutations\.create\(stores,\s*intent\.slug,\s*\{[\s\S]*?\bid:\s*intent\.slug/,
    'MarketplaceStore writer must let the reader supply the root document id.'
  )
  const marketplaceAdminWriter = readFileSync(
    path.join(repoRoot, marketplaceStoreWriters[0]),
    'utf8'
  )
  assert.match(marketplaceAdminWriter, /serverAppUsersTarget/)
  for (const retiredProjectMutation of [
    'projects/fireux/fireux-app/server/project/identity/update.ts',
    'projects/fireux/fireux-app/server/project/identity/delete.ts',
    'projects/fireux/fireux-app/server/api/internal/control/projects/[projectId].patch.ts',
    'projects/fireux/fireux-app/server/api/internal/control/projects/[projectId].delete.ts',
  ]) {
    assert.equal(
      existsSync(path.join(repoRoot, retiredProjectMutation)),
      false,
      `Provisioned Project mutation without ProjectMeta synchronization must not return: ${retiredProjectMutation}`
    )
  }
  const projectCreate = readFileSync(
    path.join(
      repoRoot,
      'projects/fireux/fireux-app/server/project/index/create.ts'
    ),
    'utf8'
  )
  assert.match(projectCreate, /status:\s*['"]inactive['"]/)
  assert.match(projectCreate, /runGuardedServerTransaction/)
  assert.match(projectCreate, /FIRESTORE_MUTATION_TARGETS\.fireuxProjects/)
  assert.match(projectCreate, /fireuxProjectTeamMembersTarget/)
  assert.doesNotMatch(
    projectCreate,
    /projectMeta|collection\(['"]project['"]\)/
  )
  assert.equal(
    existsSync(
      path.join(
        repoRoot,
        'projects/fireux/fireux-app/app/components/Project/MutationPanel.vue'
      )
    ),
    false,
    'Project Workspace must not expose broad canonical mutations that omit ProjectMeta synchronization.'
  )
  const placeMutationFiles = [
    ['index/ensure.ts', /mutations\.create\(places,\s*id,/],
    ['identity/mutate.ts', /mutations\.update\(places,\s*id,/],
    ['identity/remove.ts', /mutations\.delete\(places,\s*id\)/],
  ]
  for (const [file, verbPattern] of placeMutationFiles) {
    const source = readFileSync(
      path.join(
        repoRoot,
        'packages/extensions/fireux-places/src/runtime/place/server',
        file
      ),
      'utf8'
    )
    assert.match(source, /FIRESTORE_MUTATION_TARGETS\.places/)
    assert.match(source, /runGuardedServerTransaction/)
    assert.match(source, verbPattern)
  }
  const found = collectFirestoreMutationWriters(repoRoot)
  const clientDebt = debt(found.client, APPROVED_CLIENT_IMPLEMENTATIONS)
  const adminDebt = debt(found.admin, APPROVED_ADMIN_IMPLEMENTATIONS)
  const clientFingerprint = fingerprint(clientDebt)
  const adminFingerprint = fingerprint(adminDebt)
  if (
    clientFingerprint !== LEGACY_CLIENT_WRITER_FINGERPRINT ||
    adminFingerprint !== LEGACY_ADMIN_WRITER_FINGERPRINT
  ) {
    throw new Error(
      [
        'Firestore mutation writer inventory changed. New raw writers are forbidden; migrated files must reduce and refresh the reviewed fingerprints.',
        `client fingerprint: ${clientFingerprint}`,
        ...clientDebt.map((file) => `client: ${file}`),
        `admin fingerprint: ${adminFingerprint}`,
        ...adminDebt.map((file) => `admin: ${file}`),
      ].join('\n')
    )
  }
}

if (
  process.argv[1] === fileURLToPath(import.meta.url) &&
  process.argv.includes('--inventory')
) {
  const found = collectFirestoreMutationWriters(process.cwd())
  console.log(
    JSON.stringify(
      {
        client: debt(found.client, APPROVED_CLIENT_IMPLEMENTATIONS),
        admin: debt(found.admin, APPROVED_ADMIN_IMPLEMENTATIONS),
      },
      null,
      2
    )
  )
}
