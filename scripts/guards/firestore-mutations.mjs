// @fireux-script
// last_used: 2026-08-09
// usage_note: run through pnpm guard; enforces the three-lane Firestore mutation spine.

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import assert from 'node:assert/strict'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { isGeneratedArtifactPath } from './_lib/filesystem-policy.mjs'

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
  '2db124cf412dcf5ee556b317a4716f90a9161fd887bebbfc986f007febe4f8fa'

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
  assert.match(
    targetsSource,
    /appMeta:[\s\S]*lane:\s*'mcp-skill'[\s\S]*database:\s*\{ kind:\s*'default' \}[\s\S]*collectionPath:\s*'apps'/,
    'The default App metadata target must remain MCP/Skill-owned at (default)/apps.'
  )
  assert.match(
    targetsSource,
    /runtimeAppMeta:[\s\S]*lane:\s*'server'[\s\S]*database:\s*\{ kind:\s*'default' \}[\s\S]*collectionPath:\s*'apps'/,
    'The authenticated runtime App writer must maintain its local AppMeta projection through the Server lane.'
  )
  assert.match(
    targetsSource,
    /fireuxProjects:[\s\S]*lane:\s*'server'[\s\S]*database:\s*\{ kind:\s*'named', databaseId:\s*'fireux' \}[\s\S]*collectionPath:\s*'projects'/,
    'The canonical Project Console Entity target must remain Server-owned at fireux/projects.'
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
    'Canonical App edits must use the trusted writer that also maintains AppMeta.'
  )
  assert.match(
    serverTargetsSource,
    /serverKitchenMenuUploadsTarget[\s\S]*lane:\s*'server'[\s\S]*database:\s*\{ kind:\s*'runtime' \}[\s\S]*menu-uploads/,
    'Kitchen Menu uploads must use their runtime Server target.'
  )
  for (const file of ['upload.post.ts', 'source-url.post.ts']) {
    const source = readFileSync(
      path.join(
        repoRoot,
        'packages/extensions/fireux-kitchens/src/runtime/server/api/console/kitchen/menus',
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
  const kitchenMenuConfirm = readFileSync(
    path.join(
      repoRoot,
      'packages/extensions/fireux-kitchens/src/runtime/server/api/console/kitchen/menus/confirm.post.ts'
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
  const kitchenOrderTransition = readFileSync(
    path.join(
      repoRoot,
      'packages/extensions/fireux-kitchens/src/runtime/server/api/console/kitchen/orders/transition.post.ts'
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
    'serverCustomerOrdersTarget',
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
  assert.match(kitchenOrderIdempotency, /serverCustomerOrdersTarget/)
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
  for (const target of [
    'serverAppUsersTarget',
    'serverAppDriversTarget',
    'serverKitchenOrdersTarget',
  ]) {
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
    assert.match(source, /serverAppMarketplaceStoresTarget/)
    assert.match(source, /mutations\.update|mutations\.create/)
    assert.doesNotMatch(source, /\.runTransaction\(|transaction\./)
  }
  const marketplaceAdminWriter = readFileSync(
    path.join(repoRoot, marketplaceStoreWriters[0]),
    'utf8'
  )
  assert.match(marketplaceAdminWriter, /serverAppUsersTarget/)
  const projectMutationsSource = [
    'projects/fireux/fireux-app/server/project/index/create.ts',
    'projects/fireux/fireux-app/server/project/identity/update.ts',
    'projects/fireux/fireux-app/server/project/identity/delete.ts',
  ]
    .map((file) => readFileSync(path.join(repoRoot, file), 'utf8'))
    .join('\n')
  assert.match(projectMutationsSource, /export async function createProject/)
  assert.match(projectMutationsSource, /export async function updateProject/)
  assert.match(projectMutationsSource, /export async function deleteProject/)
  assert.match(
    projectMutationsSource,
    /FIRESTORE_MUTATION_TARGETS\.fireuxProjects/
  )
  assert.match(projectMutationsSource, /runGuardedServerTransaction/)
  assert.match(
    projectMutationsSource,
    /FIRESTORE_MUTATION_TARGETS\.fireuxApps[\s\S]*FIRESTORE_MUTATION_TARGETS\.fireuxEcosystems/
  )
  assert.doesNotMatch(
    projectMutationsSource,
    /FIRESTORE_MUTATION_TARGETS\.(?:projectMeta|ecosystemMeta|appMeta)/,
    'Project Console mutations must not write default metadata projections.'
  )
  assert.equal(
    existsSync(
      path.join(
        repoRoot,
        'projects/fireux/fireux-app/app/components/Project/MutationPanel.vue'
      )
    ),
    false,
    'The read-only Project Console must not expose canonical mutations that omit ProjectMeta synchronization.'
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
