import assert from 'node:assert/strict'
import test from 'node:test'
import { computed, ref, reactive, watch, toValue, effectScope } from 'vue'
import { useCommandScope } from '../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts'
import { loadOfferingSource } from './offering-test-helpers.mjs'

const deferred = () => {
  let resolve
  const promise = new Promise((done) => {
    resolve = done
  })
  return { promise, resolve }
}
function harness(options = {}) {
  const token = deferred(),
    response = deferred(),
    scope = effectScope()
  const user = { uid: 'operator', getIdToken: () => token.promise }
  const currentUser = ref(user),
    kitchenId = ref('venue'),
    activeKitchenAppId = ref('app'),
    canWrite = ref(true),
    currencyCode = ref('CHF'),
    selection = ref([])
  const route = reactive({ fullPath: '/workspace/kitchen/food-and-drink/menus' }),
    config = reactive({ appId: 'app' }),
    appUser = ref({ role: 'user' })
  const calls = [],
    destinations = []
  const deps = {
    computed,
    ref,
    watch,
    toValue,
    useCommandScope,
    useAuth: () => ({ currentUser }),
    useRoute: () => route,
    useFireUXConfig: () => config,
    useUserSession: () => ({ appUser }),
    useOptionalKitchenMenuRecordContext: () => null,
    useKitchenMenusContextSource: () => ({
      kitchenId,
      activeKitchenAppId,
      canWrite,
      currencyCode,
    }),
    useWorkspaceWriteGuard: () => ({
      requireWritableData() {
        if (!canWrite.value) throw new Error('Read-only')
      },
    }),
    crypto: { randomUUID: () => 'unique-source' },
    navigateTo: async (path) => {
      destinations.push(path)
    },
    $fetch: async (...args) => {
      calls.push(args)
      return response.promise
    },
  }
  Object.assign(
    deps,
    loadOfferingSource(
      'menu/composables/useMenuEditorScope',
      'useMenuEditorScope',
      deps
    )
  )
  const { useMenuSourceUpload } = loadOfferingSource(
    'kitchen/composables/workspace/menus/useMenuSourceUpload',
    'useMenuSourceUpload',
    deps
  )
  const upload = scope.run(() =>
    useMenuSourceUpload({ ...options, ownerSources: [selection] })
  )
  return {
    token,
    response,
    scope,
    upload,
    calls,
    destinations,
    currentUser,
    kitchenId,
    activeKitchenAppId,
    config,
    appUser,
    route,
    selection,
    currencyCode,
  }
}
const pdf = () =>
  new File(['menu test'], 'menu.pdf', { type: 'application/pdf' })

test('a source-only import reuses passed context without requiring a Menu record provider', async () => {
  const scope = effectScope()
  const context = {
    menu: ref(null), source: ref({ id: 'source-123' }), menuId: ref('source-123'),
    kitchenId: ref('venue'), activeKitchenAppId: ref('app'), canWrite: ref(true),
  }
  const { useMenuSourceProcess } = loadOfferingSource('kitchen/composables/workspace/menus/useMenuSourceProcess', 'useMenuSourceProcess', {
    computed, ref, watch,
    useKitchenMenuRecordContext: () => { throw new Error('Unexpected record acquisition') },
    useAuth: () => ({ currentUser: ref({ getIdToken: async () => 'token' }) }),
    useWorkspaceWriteGuard: () => ({ requireWritableData() {} }),
    useMenuEditorScope: () => () => () => true,
  }, (source) => source.replace(/import\.meta\.client/g, 'true'))
  const process = scope.run(() => useMenuSourceProcess(context))
  await Promise.resolve()
  assert.equal(process.source, context.source)
  assert.equal(process.menuId.value, 'source-123')
  assert.equal(process.canProcess.value, true)
  scope.stop()
})

test('native source upload sends multipart to the owning Kitchen and opens review without Go QR', async () => {
  const h = harness(),
    pending = h.upload.uploadFiles([pdf()])
  h.token.resolve('token')
  await Promise.resolve()
  h.response.resolve({ ok: true, id: 'source-unique-source' })
  await pending
  assert.equal(h.calls[0][0], '/api/workspace/kitchen/menus/upload')
  assert.deepEqual(h.calls[0][1].query, { appId: 'app', kitchenId: 'venue' })
  assert.equal(h.calls[0][1].body.get('slug'), 'source-unique-source')
  assert.equal(h.calls[0][1].body.getAll('file')[0].name, 'menu.pdf')
  assert.deepEqual(h.destinations, [
    '/workspace/kitchen/food-and-drink/menus/uploads/source-unique-source',
  ])
  assert.equal(h.upload.error.value, '')
  h.scope.stop()
})

test('account, membership, Kitchen, App, route, files and disposal invalidate upload continuation', async () => {
  for (const stage of ['token', 'response'])
    for (const change of [
      'account',
      'membership',
      'kitchen',
      'app',
      'route',
      'files',
      'dispose',
    ]) {
      const h = harness(),
        pending = h.upload.uploadFiles([pdf()])
      if (stage === 'response') {
        h.token.resolve('token')
        await Promise.resolve()
      }
      if (change === 'account') h.currentUser.value = { uid: 'other' }
      if (change === 'membership') h.appUser.value = null
      if (change === 'kitchen') h.kitchenId.value = 'other'
      if (change === 'app') h.config.appId = 'other'
      if (change === 'route') h.route.fullPath = '/elsewhere'
      if (change === 'files') h.selection.value = [pdf()]
      if (change === 'dispose') h.scope.stop()
      h.token.resolve('token')
      h.response.resolve({ ok: true, id: 'source-unique-source' })
      await pending
      assert.equal(h.calls.length, stage === 'response' ? 1 : 0)
      assert.deepEqual(h.destinations, [])
      h.scope.stop()
    }
})

test('document replacement retains its explicit identity and response mismatches do not open review', async () => {
  const h = harness({
    uploadId: 'existing-menu',
    document: true,
    replaceExisting: true,
  })
  const pending = h.upload.uploadFiles([pdf()])
  h.token.resolve('token')
  await Promise.resolve()
  h.response.resolve({ ok: true, id: 'wrong-menu' })
  await pending
  assert.equal(h.calls[0][0], '/api/workspace/kitchen/menus/document-upload')
  assert.equal(h.calls[0][1].body.get('slug'), 'existing-menu')
  assert.equal(h.calls[0][1].query.replace, '1')
  assert.match(h.upload.error.value, /did not identify/)
  assert.deepEqual(h.destinations, [])
  h.scope.stop()
})
