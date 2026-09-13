import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref, toValue } from 'vue'

test('Staff POS follows exact source App membership and live Kitchen access', () => {
  const source = readFileSync(
    new URL(
      '../runtime/menu/composables/detail/useMenuStaffPosAccess.ts',
      import.meta.url
    ),
    'utf8'
  )
    .replace(/^import[^\n]+\n/gm, '')
    .replace(/^export /gm, '')
  const uid = ref('u')
  const member = {
    appUser: ref({ role: 'user' }),
    pending: ref(false),
    error: ref(),
  }
  const access = { ids: ref(['k']), outcome: ref('ready'), pending: ref(false) }
  let boundApp, boundPath
  const dependencies = {
    computed,
    toValue,
    useAuth: () => ({ uid }),
    useAppUserRead: (app) => {
      boundApp = app
      return member
    },
    useMembershipAccess: (path) => {
      boundPath = path
      return access
    },
    kitchenAccessCollectionPath: (app) => `apps/${app}/kitchen-access`,
    useAuthRedirect: () => ({ isReady: ref(true), isAuthenticated: ref(true) }),
  }
  const useAccess = compileFunction(
    `${stripTypeScriptTypes(source)}; return useMenuStaffPosAccess`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
  const enabled = ref(true)
  const menu = ref({ source: { appId: 'source-app', kitchenId: 'k' } })
  const result = useAccess({ enabled, menu })
  assert.equal(boundApp.value, 'source-app')
  assert.equal(boundPath(), 'apps/source-app/kitchen-access')
  assert.equal(result.canUseStaffPos.value, true)
  access.ids.value = []
  assert.equal(result.canUseStaffPos.value, false)
  access.ids.value = ['k']
  member.error.value = new Error('Membership unavailable')
  assert.equal(result.canUseStaffPos.value, false)
  member.error.value = undefined
  member.pending.value = true
  assert.equal(result.canUseStaffPos.value, false)
  assert.equal(result.staffAccessPending.value, true)
  member.pending.value = false
  menu.value = { source: { appId: 'other-app', kitchenId: 'other-kitchen' } }
  assert.equal(boundPath(), 'apps/other-app/kitchen-access')
  assert.equal(result.canUseStaffPos.value, false)
  menu.value.source.kitchenId = 'k'
  enabled.value = false
  assert.equal(result.canUseStaffPos.value, false)
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
    new URL('../runtime/kitchen/components/Edit/Index.vue', import.meta.url),
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
