import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { ref, reactive, watch, onScopeDispose, effectScope } from 'vue'
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
    route = reactive({ fullPath: '/workspace/supplier/identity' })
  const companyId = ref('venue'),
    scope = effectScope(),
    writes = []
  let releaseToken,
    beginToken,
    result = { ok: true, supplierId: 'a', place: { id: 'venue' } }
  const tokenStarted = new Promise((resolve) => (beginToken = resolve))
  const identity = { supplierId: id, companyId, canWrite }
  const command = scope.run(() =>
    load(
      '../runtime/supplier/composables/useSupplierProfileUpdate.ts',
      'useSupplierProfileUpdate',
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
    invoke: (patch) => command.update('venue', patch),
    release: () => releaseToken('token'),
    setResult: (value) => (result = value),
  }
}
test('Supplier captures payload before credentials and validates the exact returned identity', async () => {
  const h = harness(),
    patch = { name: 'Original' },
    pending = h.invoke(patch)
  await h.tokenStarted
  patch.name = 'Mutated'
  h.release()
  await pending
  assert.equal(h.writes.length, 1)
  assert.equal(h.writes[0].request.body.patch.name, 'Original')
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
test('Supplier blocks dispatch after account, membership, App, selection, route, access and disposal changes', async () => {
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
      h.route.fullPath = '/workspace/supplier/identity'
    },
    (h) => {
      h.canWrite.value = false
      h.canWrite.value = true
    },
    (h) => h.scope.stop(),
    (h) => {
      h.companyId.value = 'other'
      h.companyId.value = 'venue'
    },
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

test('Supplier panel closes on account, selection, linked Place and authority changes', () => {
  const currentUser = ref({ uid: 'alice' }),
    supplierId = ref('a'),
    companyId = ref('venue'),
    canWrite = ref(true),
    scope = effectScope()
  const identity = { supplierId, companyId, canWrite }
  const state = scope.run(() =>
    load(
      '../runtime/supplier/components/Workspace/Identity/Index.vue',
      '({section})',
      {
        ref,
        watch,
        computed: (getter) => ({
          get value() {
            return getter()
          },
        }),
        useAuth: () => ({ currentUser }),
        useSupplierIdentity: () => identity,
        useSupplierProfileUpdate: () => ({}),
      }
    )
  )
  for (const change of [
    () => (currentUser.value = { uid: 'bob' }),
    () => (supplierId.value = 'b'),
    () => (companyId.value = 'other'),
    () => (canWrite.value = false),
  ]) {
    state.section.value = 'profile'
    change()
    assert.equal(state.section.value, null)
  }
  scope.stop()
})
