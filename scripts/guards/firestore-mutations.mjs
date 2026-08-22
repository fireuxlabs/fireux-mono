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
  'packages/core/fireux-core/src/runtime/composables/fireux/firestore/mutations/useFirestoreClientCreate.ts',
  'packages/core/fireux-core/src/runtime/composables/fireux/firestore/mutations/useClientUpdate.ts',
  'packages/core/fireux-core/src/runtime/composables/fireux/firestore/mutations/useClientDelete.ts',
])

const APPROVED_ADMIN_IMPLEMENTATIONS = new Set([
  'packages/core/fireux-core/src/runtime/server/utils/firestore-mutations/server-create.ts',
  'packages/core/fireux-core/src/runtime/server/utils/firestore-mutations/server-update.ts',
  'packages/core/fireux-core/src/runtime/server/utils/firestore-mutations/server-delete.ts',
  'packages/core/fireux-core/src/runtime/server/utils/firestore-mutations/server-transaction.ts',
  'scripts/_lib/firestore-mutations/mcp-skill-create.mjs',
  'scripts/_lib/firestore-mutations/mcp-skill-update.mjs',
  'scripts/_lib/firestore-mutations/mcp-skill-delete.mjs',
])

// Phase-one debt ledger. Entries may only be removed as consumers migrate to a
// typed lane; additions fail the guard. This turns the pre-spine writers into a
// bounded, executable remaining-file inventory instead of an expanding allowlist.
const LEGACY_CLIENT_WRITER_FINGERPRINT =
  '10484b476023427fedf10a770b83c5c71f19583e3e8ec7ee1e30f1c20b438899'
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
    false,
    'The generic useFirestoreCreate API is retired; use the typed Client Create touchpoint.'
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
      'packages/core/fireux-core/src/runtime/app/composables/firestore/mutations/useAppUpdate.ts'
    ),
    'utf8'
  )
  assert.match(appUpdateSource, /\/api\/internal\/app\/settings/)
  assert.doesNotMatch(
    appUpdateSource,
    /useFirestoreUpdate|updateDocument/,
    'Canonical App edits must use the trusted Server writer.'
  )
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
    'projects/fireux/fireux-app/server/project/index/create.ts',
    'projects/fireux/fireux-app/server/project/identity/update.ts',
    'projects/fireux/fireux-app/server/project/identity/delete.ts',
    'projects/fireux/fireux-app/server/api/internal/control/projects.post.ts',
    'projects/fireux/fireux-app/server/api/internal/control/projects/[projectId].patch.ts',
    'projects/fireux/fireux-app/server/api/internal/control/projects/[projectId].delete.ts',
  ]) {
    assert.equal(
      existsSync(path.join(repoRoot, retiredProjectMutation)),
      false,
      `Project mutation without ProjectMeta synchronization must not return: ${retiredProjectMutation}`
    )
  }
  assert.equal(
    existsSync(
      path.join(
        repoRoot,
        'projects/fireux/fireux-app/app/components/Project/MutationPanel.vue'
      )
    ),
    false,
    'The read-only Project Workspace must not expose canonical mutations that omit ProjectMeta synchronization.'
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
