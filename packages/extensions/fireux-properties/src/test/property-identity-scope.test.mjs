import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import {
  ref,
  reactive,
  watch,
  computed,
  onScopeDispose,
  effectScope,
} from 'vue'
function load(file, result, deps) {
  let source = readFileSync(new URL(file, import.meta.url), 'utf8')
  if (source.includes('<script setup'))
    source = source.match(/<script setup[^>]*>([\s\S]*?)<\/script>/)[1]
  source = source
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)};return ${result}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
const useCommandScope = load(
  '../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts',
  'useCommandScope',
  { watch, onScopeDispose }
)

function harness() {
  const account = ref({ uid: 'alice' }),
    membership = ref({ created: { at: 1 } }),
    id = ref('a'),
    canWrite = ref(true)
  const config = reactive({ appId: 'app' }),
    route = reactive({ fullPath: '/workspace/property/identity' })
  const companyId = ref('venue'),
    scope = effectScope(),
    writes = []
  let releaseToken,
    beginToken,
    result = { ok: true, propertyId: 'a' }
  const tokenStarted = new Promise((resolve) => (beginToken = resolve))
  const identity = { propertyId: id, companyId, canWrite }
  const command = scope.run(() =>
    load(
      '../runtime/property/composables/usePropertyIdentityUpdate.ts',
      'usePropertyIdentityUpdate',
      {
        useAuth: () => ({ currentUser: account }),
        useAppSession: () => ({ appUser: membership }),
        useFireUXConfig: () => config,
        useRoute: () => route,
        useCommandScope,
        useRequireUser: async () => ({
          uid: 'alice',
          getIdToken: () => {
            beginToken()
            return new Promise((resolve) => (releaseToken = resolve))
          },
        }),
        $fetch: async (url, request) => {
          writes.push({ url, request })
          return result
        },
      }
    )(identity)
  )
  return {
    account,
    membership,
    id,
    canWrite,
    companyId,
    config,
    route,
    scope,
    writes,
    tokenStarted,
    command,
    invoke: (patch) => command.updateIdentity(patch),
    release: () => releaseToken('token'),
    setResult: (value) => (result = value),
  }
}
test('Property captures payload before credentials and validates the exact returned identity', async () => {
  const h = harness(),
    patch = { name: 'Original' },
    pending = h.invoke(patch)
  await h.tokenStarted
  patch.name = 'Mutated'
  h.release()
  await pending
  assert.equal(h.writes.length, 1)
  assert.equal(h.writes[0].request.body.changes.name, 'Original')
  h.scope.stop()
  const bad = harness()
  bad.setResult({
    ok: true,
    propertyId: 'other',
    supplierId: 'other',
    place: { id: 'other' },
  })
  const failed = bad.invoke({ name: 'New' })
  await bad.tokenStarted
  bad.release()
  await assert.rejects(failed, /did not match/)
  bad.scope.stop()
})
test('Property blocks dispatch after account, membership, App, selection, route, access and disposal changes', async () => {
  const changes = [
    (h) => {
      h.account.value = { uid: 'bob' }
      h.account.value = { uid: 'alice' }
    },
    (h) => {
      h.membership.value = { created: { at: 2 } }
    },
    (h) => {
      h.config.appId = 'other'
      h.config.appId = 'app'
    },
    (h) => {
      h.id.value = 'b'
      h.id.value = 'a'
    },
    (h) => {
      h.route.fullPath = '/elsewhere'
      h.route.fullPath = '/workspace/property/identity'
    },
    (h) => {
      h.canWrite.value = false
      h.canWrite.value = true
    },
    (h) => h.scope.stop(),
  ]
  for (const change of changes) {
    const h = harness(),
      pending = h.invoke({ name: 'New' })
    await h.tokenStarted
    change(h)
    h.release()
    await assert.rejects(pending, /changed/)
    assert.equal(h.writes.length, 0)
    h.scope.stop()
  }
})

function editorHarness() {
  const scope = effectScope(),
    propertyId = ref('a'),
    canWrite = ref(true),
    selectedProperty = ref({
      identity: {
        name: 'Before',
        image_url: '',
        property_type: 'residential',
        unit_count: 2,
        estimated_value: 100,
      },
    })
  const identity = { propertyId, canWrite, selectedProperty },
    saved = [],
    feedback = []
  let release
  const state = scope.run(() =>
    load(
      '../runtime/property/components/Workspace/Identity/Edit.vue',
      '({draft,save,error})',
      {
        ref,
        computed,
        defineProps: () => ({ identity }),
        defineEmits: () => (event) => feedback.push(event),
        usePropertyIdentityUpdate: () => ({
          captureIntent: useCommandScope([propertyId, canWrite]),
          updateIdentity: (patch) => {
            saved.push(patch)
            return new Promise((resolve) => (release = resolve))
          },
        }),
        useImageStorage: () => ({
          uploadImage: () => {
            throw Error('not used')
          },
        }),
        useToastify: () => ({ success: (value) => feedback.push(value) }),
      }
    )
  )
  return {
    scope,
    state,
    propertyId,
    selectedProperty,
    saved,
    feedback,
    release: () => release(),
  }
}
test('Property editor saves only changed fields and suppresses old completion after selection changes', async () => {
  const h = editorHarness()
  h.state.draft.value.name = 'New'
  const pending = h.state.save()
  assert.deepEqual(h.saved, [{ name: 'New' }])
  h.propertyId.value = 'b'
  h.release()
  await pending
  assert.deepEqual(h.feedback, [])
  assert.equal(h.state.error.value, '')
  h.scope.stop()
})
test('Property editor rejects a concurrent saved-profile change before dispatch', async () => {
  const h = editorHarness()
  h.state.draft.value.name = 'New'
  h.selectedProperty.value.identity.name = 'Other editor'
  await h.state.save()
  assert.equal(h.saved.length, 0)
  assert.match(h.state.error.value, /changed while/)
  h.scope.stop()
})
