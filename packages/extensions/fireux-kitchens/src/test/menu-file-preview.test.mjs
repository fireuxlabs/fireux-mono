import assert from 'node:assert/strict'
import test from 'node:test'
import { createHash } from 'node:crypto'
import {
  computed,
  ref,
  reactive,
  watch,
  effectScope,
  onScopeDispose,
  nextTick,
} from 'vue'
import { useCommandScope } from '../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts'
import { loadOfferingSource as load } from './offering-test-helpers.mjs'
import { menuFilePreviewDependencies } from './menu-file-preview-test-helpers.mjs'

const settle = () => new Promise((resolve) => setImmediate(resolve))
const deferred = () => {
  let resolve, reject
  const promise = new Promise((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
function fixture() {
  const lifetime = effectScope(),
    requests = [],
    created = [],
    revoked = [],
    opened = [],
    acquisitions = []
  const currentUser = ref({ uid: 'account' }),
    config = reactive({ appId: 'app' }),
    appUser = ref({ created: { at: 1 } })
  const kitchen = ref('kitchen'),
    record = ref('menu'),
    revision = ref('revision'),
    proof = ref('private-claim-secret'),
    enabled = ref(true)
  class PreviewURL extends URL {
    static createObjectURL(blob) {
      const url = `blob:preview-${created.length}`
      created.push({ blob, url })
      return url
    }
    static revokeObjectURL(url) {
      revoked.push(url)
    }
  }
  let deps = {
    computed,
    ref,
    watch,
    onScopeDispose,
    useCommandScope,
    useAuth: () => ({ currentUser }),
    useFireUXConfig: () => config,
    useUserSession: () => ({ appUser }),
    URL: PreviewURL,
    window: { open: (...args) => opened.push(args) },
  }
  Object.assign(
    deps,
    load('menu/composables/useMenuEditorScope', 'useMenuEditorScope', deps)
  )
  deps = menuFilePreviewDependencies(deps, acquisitions)
  const preview = lifetime.run(() =>
    deps.useMenuFilePreview({
      enabled,
      sources: [kitchen, record, revision, proof],
      read(context) {
        const request = { ...context, ...deferred() }
        requests.push(request)
        return request.promise
      },
    })
  )
  return {
    lifetime,
    currentUser,
    config,
    appUser,
    kitchen,
    record,
    revision,
    proof,
    enabled,
    requests,
    created,
    revoked,
    opened,
    acquisitions,
    preview,
    deps,
  }
}
const changes = {
  account: (h) => {
    h.currentUser.value = { uid: 'other' }
  },
  App: (h) => {
    h.config.appId = 'other'
  },
  AppUser: (h) => {
    h.appUser.value = { created: { at: 2 } }
  },
  Kitchen: (h) => {
    h.kitchen.value = 'other'
  },
  record: (h) => {
    h.record.value = 'other'
  },
  revision: (h) => {
    h.revision.value = 'other'
  },
  proof: (h) => {
    h.proof.value = 'changed-private-proof'
  },
  availability: (h) => {
    h.enabled.value = false
  },
  disposal: (h) => h.lifetime.stop(),
}
test('enabled client-only idle and pending states render the same loading boundary', async () => {
  const h = fixture()
  h.acquisitions[0].status.value = 'idle'
  assert.equal(h.preview.pending.value, true)
  h.acquisitions[0].status.value = 'pending'
  assert.equal(h.preview.pending.value, true)
  h.enabled.value = false
  assert.equal(h.preview.pending.value, false)
  h.lifetime.stop()
  h.requests[0].resolve(new Blob())
  await settle()
})
for (const [name, change] of Object.entries(changes)) {
  test(`${name} change aborts a late file and revokes an already loaded preview`, async () => {
    const h = fixture()
    const first = h.requests[0]
    change(h)
    assert.equal(first.signal.aborted, true)
    assert.equal(first.isCurrent(), false)
    first.resolve(new Blob(['obsolete']))
    await settle()
    assert.equal(h.preview.url.value, '')
    assert.equal(h.created.length, 0)
    assert.ok(h.acquisitions.every(({ key }) => !key.includes('private')))
    h.lifetime.stop()

    const loaded = fixture()
    loaded.requests[0].resolve(new Blob(['current']))
    await settle()
    assert.equal(loaded.preview.url.value, 'blob:preview-0')
    change(loaded)
    assert.equal(loaded.preview.url.value, '')
    assert.deepEqual(loaded.revoked, ['blob:preview-0'])
    loaded.lifetime.stop()
    assert.deepEqual(loaded.revoked, ['blob:preview-0'])
  })
}

test('failed file reads stay unavailable, retry only the current file, and open the loaded Blob synchronously', async () => {
  const h = fixture()
  h.requests[0].reject({
    data: { statusMessage: 'This Menu is no longer available.' },
  })
  await settle()
  assert.equal(h.preview.url.value, '')
  assert.equal(h.preview.error.value, 'This Menu is no longer available.')
  h.preview.open()
  assert.equal(h.opened.length, 0)
  const retry = h.preview.retry()
  assert.equal(h.preview.pending.value, true)
  h.requests[1].resolve(new Blob(['new']))
  await retry
  assert.equal(h.preview.error.value, '')
  h.preview.open()
  assert.deepEqual(h.opened, [
    ['blob:preview-0', '_blank', 'noopener,noreferrer'],
  ])
  assert.equal(h.requests.length, 2)
  h.enabled.value = false
  await nextTick()
  await h.preview.retry()
  h.preview.open()
  assert.equal(h.requests.length, 2)
  assert.equal(h.opened.length, 1)
  assert.equal(h.acquisitions[0].data.value, undefined)
  h.lifetime.stop()
})

test('browser revision matches the trusted SHA-256 serialization without transmitting storage values', async () => {
  const h = fixture()
  const identity = JSON.stringify([
    'https://storage.invalid/private?token=secret',
    'path/private',
  ])
  assert.equal(
    await h.deps.menuFileRevision(identity),
    createHash('sha256').update(identity).digest('hex')
  )
  h.lifetime.stop()
  h.requests[0].resolve(new Blob())
  await settle()
})
