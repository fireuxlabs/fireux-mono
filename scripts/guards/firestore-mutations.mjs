// @fireux-script
// last_used: 2026-08-05
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
  'df0b210b149eab688f510e70c98d9c465d61a2d9e5ebe8b887bbd449c2826cda'
const LEGACY_ADMIN_WRITER_FINGERPRINT =
  'bda76e185e9be6e3cf978e8d2e494c3d24cd1cbd789aab845b6691cdc20a5b76'

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
    /fireuxProjects:[\s\S]*lane:\s*'server'[\s\S]*database:\s*\{ kind:\s*'named', databaseId:\s*'fireux' \}[\s\S]*collectionPath:\s*'projects'/,
    'The canonical Project Console Entity target must remain Server-owned at fireux/projects.'
  )
  assert.doesNotMatch(
    targetsSource,
    /database:\s*\{ kind:\s*'default' \}[\s\S]{0,100}collectionPath:\s*'projects'/,
    'The canonical projects collection must never be placed in (default).'
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
      'packages/extensions/fireux-kitchens/src/runtime/server/menu/draft/write.ts'
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
      'packages/extensions/fireux-kitchens/src/runtime/server/ingredient/curation.ts'
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
      'packages/extensions/fireux-kitchens/src/runtime/server/ingredient/curation-storage.ts'
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
      'packages/extensions/fireux-kitchens/src/runtime/server/menu/ai/usage.ts'
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
      'packages/extensions/fireux-kitchens/src/runtime/server/menu/draft/root-entry.ts'
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
      'packages/extensions/fireux-kitchens/src/runtime/server/kitchen/order/customer-notification.ts'
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
      'packages/extensions/fireux-kitchens/src/runtime/server/kitchen/order/service-sequence.ts'
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
      'packages/extensions/fireux-kitchens/src/runtime/server/menu/ordering/idempotency.ts'
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
      'packages/extensions/fireux-kitchens/src/runtime/server/menu/ordering/whatsapp.ts'
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
      'packages/extensions/fireux-kitchens/src/runtime/server/kitchen/driver-dispatch.ts'
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
    'packages/extensions/fireux-marketplace/src/runtime/server/marketplace/authority-admin.ts',
    'packages/extensions/fireux-marketplace/src/runtime/server/marketplace/authority-stores.ts',
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
  const projectMutationsSource = readFileSync(
    path.join(
      repoRoot,
      'projects/fireux/fireux-app/server/utils/project-mutations.ts'
    ),
    'utf8'
  )
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
  const projectMutationPanel = readFileSync(
    path.join(
      repoRoot,
      'projects/fireux/fireux-app/app/components/Project/MutationPanel.vue'
    ),
    'utf8'
  )
  assert.match(
    projectMutationPanel,
    /\/api\/internal\/control\/projects[\s\S]*method:\s*'POST'/
  )
  assert.match(projectMutationPanel, /method:\s*'PATCH'/)
  assert.match(projectMutationPanel, /method:\s*'DELETE'/)
  assert.match(
    projectMutationPanel,
    /deleteConfirmation\.value !== projectId\.value/
  )
  const placeMutationFiles = [
    ['ensure.ts', /mutations\.create\(places,\s*id,/],
    ['mutate.ts', /mutations\.update\(places,\s*id,/],
    ['remove.ts', /mutations\.delete\(places,\s*id\)/],
  ]
  for (const [file, verbPattern] of placeMutationFiles) {
    const source = readFileSync(
      path.join(
        repoRoot,
        'packages/extensions/fireux-places/src/runtime/server/place',
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
