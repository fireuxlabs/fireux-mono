import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref } from 'vue'
import { readAppDocument } from 'fireux-core/runtime/app/utils/readApp'
import { APP_MUTATION_TARGETS } from 'fireux-core/runtime/app/server/mutation-targets'
import {
  serverAuditStamp,
  serverTimestamp,
} from 'fireux-core/runtime/server/utils/records/stamps'
import {
  compactAppPalette,
  readAppPalette,
  readWorkspacePalette,
} from 'fireux-core/runtime/utils/theme-palette'

test('saving a dedicated Kitchen App theme keeps the App readable', async () => {
  const source = readFileSync(
    new URL('../runtime/kitchen/server/identity/app-theme.ts', import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
  const workspacePalette = {
    canvas: '#ffffff',
    text: '#111111',
    accent: '#cc4400',
    accent_contrast: '#ffffff',
  }
  const palette = {
    ...workspacePalette,
    surface: '#eeeeee',
    canvas_inverted: '#333333',
    text_muted: '#777777',
    accent: '#ab3300',
    ink: '#222222',
  }
  const typography = { display_family: 'Serif', body_family: 'Sans' }
  const created = { at: { seconds: 1, nanoseconds: 0 }, by: 'creator' }
  const at = { seconds: 2, nanoseconds: 0 }
  const app = {
    name: 'Dedicated App',
    role: 'tenant',
    status: 'active',
    ecosystem_id: 'misebox',
    created,
    updated: created,
  }
  const stored = { ...app }
  const actor = { uid: 'operator' }
  const dependencies = {
    createError: (value) =>
      Object.assign(new Error(value.statusMessage), value),
    requireFirestoreDocumentId: (value) => value,
    readAppPalette,
    readWorkspacePalette,
    compactAppPalette,
    serverAuditStamp,
    APP_MUTATION_TARGETS,
    readKitchenMutationActor: async () => actor,
    requireKitchenMutationAuthority: async (
      _transaction,
      caller,
      kitchenId
    ) => {
      assert.equal(caller, actor)
      assert.equal(kitchenId, 'kitchen')
      return {
        ownerAppId: 'dedicated-app',
        ownerRole: 'admin',
        rootData: {
          management: { mode: 'app' },
          theme: { palette: workspacePalette },
        },
      }
    },
    runGuardedServerTransaction: async (database, command) => {
      assert.deepEqual(database, { kind: 'runtime' })
      return command({
        read: async (target, id) => {
          assert.equal(target, APP_MUTATION_TARGETS.runtimeApps)
          assert.equal(id, 'dedicated-app')
          return { exists: true, data: stored }
        },
        update: (target, id, patch) => {
          assert.equal(target, APP_MUTATION_TARGETS.runtimeApps)
          assert.equal(id, 'dedicated-app')
          assert.ok(patch.updated.at.isEqual(serverTimestamp()))
          stored.updated = { ...patch.updated, at }
          stored.theme = {
            palette: patch['theme.palette'],
            typography: patch['theme.typography'],
          }
        },
      })
    },
  }
  const update = compileFunction(
    `${stripTypeScriptTypes(source)}; return updateKitchenAppTheme`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))

  const result = await update(
    {},
    { kitchen_id: 'kitchen', palette, typography }
  )
  assert.equal(result.app_id, 'dedicated-app')
  assert.deepEqual(stored.theme, {
    palette: compactAppPalette(palette, workspacePalette),
    typography,
  })
  assert.deepEqual(readAppDocument(stored, 'dedicated-app'), {
    ...app,
    id: 'dedicated-app',
    updated: { at, by: 'operator' },
  })
})

test('dedicated App theme cannot bypass Kitchen association with an admin role', async () => {
  const source = readFileSync(
    new URL('../runtime/kitchen/server/identity/app-theme.ts', import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
  const denied = new Error('Kitchen association is required.')
  let checked
  const dependencies = {
    createError: (value) =>
      Object.assign(new Error(value.statusMessage), value),
    requireFirestoreDocumentId: (value) => value,
    readKitchenMutationActor: async () => ({
      uid: 'admin',
      runtimeAppId: 'app',
    }),
    getRuntimeFirestore: () => ({
      doc: () => ({
        get: async () => ({
          exists: true,
          data: () => ({ management: { mode: 'app', app_id: 'app' } }),
        }),
      }),
    }),
    requireKitchenWriterAccount: async (input, uid) => {
      checked = { ...input, uid }
      throw denied
    },
  }
  const read = compileFunction(
    `${stripTypeScriptTypes(source)}; return readKitchenAppTheme`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
  await assert.rejects(read({}, 'k'), denied)
  assert.deepEqual(checked, { appId: 'app', kitchenId: 'k', uid: 'admin' })
})

test('Kitchen editor loses access on removal, failed reads and unrelated Kitchen selection', () => {
  const file = readFileSync(
    new URL('../runtime/kitchen/components/Workspace/Identity/Edit/Index.vue', import.meta.url),
    'utf8'
  )
  const source = file
    .split('<script setup lang="ts">')[1]
    .split('</script>')[0]
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
  const access = { outcome: ref('ready'), ids: ref(['k']) }
  const kitchen = ref({
    id: 'k',
    slug: 'k',
    claimed_by: 'u',
    operator_ids: ['u'],
  })
  const dependencies = {
    computed,
    defineProps: () => ({ locator: 'public-slug' }),
    useFireUXConfig: () => ({ appName: 'Test' }),
    useHead: () => {},
    useKitchenDetail: (slug) => {
      assert.equal(slug.value, 'public-slug')
      return { kitchen, place: ref(null), pending: ref(false) }
    },
    useKitchenInterface: () => ({ surface: ({ kitchen }) => kitchen }),
    useKitchenAccess: () => access,
    useToastify: () => ({}),
  }
  const canEdit = compileFunction(
    `${stripTypeScriptTypes(source)}; return canEdit`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
  assert.equal(canEdit.value, true)
  access.ids.value = []
  assert.equal(
    canEdit.value,
    false,
    'legacy owner/operator fields cannot preserve access'
  )
  access.ids.value = ['other']
  assert.equal(canEdit.value, false)
  access.ids.value = ['k']
  access.outcome.value = 'error'
  assert.equal(canEdit.value, false)
  access.outcome.value = 'pending'
  assert.equal(canEdit.value, false)
  access.outcome.value = 'ready'
  assert.equal(canEdit.value, true)
})

test('public operator panel follows exact live Kitchen access', () => {
  const file = readFileSync(
    new URL(
      '../runtime/kitchen/components/Workspace/OperatorPanel.vue',
      import.meta.url
    ),
    'utf8'
  )
  const source = file
    .split('<script setup lang="ts">')[1]
    .split('</script>')[0]
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
  const access = { outcome: ref('ready'), ids: ref(['k']) }
  const dependencies = {
    computed,
    defineProps: () => ({ kitchen: { id: 'k', slug: 'public-k' } }),
    useKitchenAccess: () => access,
    useWorkspaceEntryCta: () => ({
      workspaceEntryPath: ref('/workspace/kitchen'),
    }),
    useWorkspace: () => ({
      select: () => {},
    }),
  }
  const { showPanel, editTo } = compileFunction(
    `${stripTypeScriptTypes(source)}; return { showPanel, editTo }`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
  assert.equal(showPanel.value, true)
  assert.equal(editTo.value, '/kitchens/public-k/edit')
  for (const outcome of ['idle', 'pending', 'error', 'empty']) {
    access.outcome.value = outcome
    assert.equal(showPanel.value, false)
  }
  access.outcome.value = 'ready'
  for (const ids of [[], ['another-kitchen']]) {
    access.ids.value = ids
    assert.equal(showPanel.value, false)
  }
})
