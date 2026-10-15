import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import {
  ref,
  computed,
  watch,
  effectScope,
  onScopeDispose,
  nextTick,
} from 'vue'
import * as view from '../runtime/kitchen/utils/menu-process-view.ts'
const source = readFileSync(
  new URL(
    '../runtime/kitchen/composables/workspace/menus/useMenuSourceProcess.ts',
    import.meta.url
  ),
  'utf8'
)
  .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  .replace(/^export /gm, '')
  .replaceAll('import.meta.client', 'true')
function deferred() {
  let resolve, reject
  const promise = new Promise((a, b) => {
    resolve = a
    reject = b
  })
  return { promise, resolve, reject }
}
function fixture({
  token = Promise.resolve('token'),
  fetcher,
  allowed = true,
} = {}) {
  const owner = effectScope(),
    calls = []
  const currentUser = ref({ uid: 'user', getIdToken: () => token })
  const context = {
    menu: ref({ id: 'm' }),
    source: ref({ id: 'upload' }),
    menuId: ref('m'),
    kitchenId: ref('k'),
    activeKitchenAppId: ref('a'),
    canWrite: ref(true),
  }
  const deps = {
    ref,
    computed,
    watch,
    useAuth: () => ({ currentUser }),
    useKitchenMenuRecordContext: () => context,
    useWorkspaceWriteGuard: () => ({
      requireWritableData() {
        if (!allowed) throw Error('Access denied')
      },
    }),
    useMenuEditorScope: (sources, reset) => {
      let epoch = 0
      watch(
        [() => currentUser.value?.uid, ...sources],
        () => {
          epoch++
          reset()
        },
        { flush: 'sync' }
      )
      onScopeDispose(() => epoch++)
      return () => {
        const captured = epoch
        return () => captured === epoch
      }
    },
    fetch: async (...args) => {
      calls.push(args)
      return fetcher
        ? fetcher(...args)
        : {
            ok: true,
            json: async () => ({
              normalized: {
                sections: [
                  { label: 'Main', items: [{ name: 'Soup', price: 12 }] },
                ],
              },
            }),
          }
    },
    numberText: view.menuProcessNumberText,
    optionLabel: view.menuProcessOptionLabel,
    priceText: view.menuProcessPriceText,
    record: view.menuProcessRecord,
    records: view.menuProcessRecords,
    text: view.menuProcessText,
  }
  const api = owner.run(() =>
    compileFunction(
      `${stripTypeScriptTypes(source)}; return useMenuSourceProcess()`,
      Object.keys(deps)
    )(...Object.values(deps))
  )
  return { api, context, currentUser, calls, stop: () => owner.stop() }
}
async function settle() {
  await nextTick()
  await Promise.resolve()
  await Promise.resolve()
}
test('processing captures the existing standard/strong request and projects the response', async () => {
  for (const quality of ['standard', 'strong']) {
    const f = fixture()
    await settle()
    assert.equal(f.api.canProcess.value, true)
    await f.api.processSource(quality)
    const [url, options] = f.calls[0]
    assert.equal(url, '/api/workspace/kitchen/menus/process')
    assert.equal(options.headers.Authorization, 'Bearer token')
    assert.deepEqual(JSON.parse(options.body), {
      appId: 'a',
      kitchenId: 'k',
      menuId: 'm',
      uploadId: 'upload',
      quality,
      force: quality === 'strong',
      confirmBilling: true,
    })
    assert.equal(f.api.hasDraft.value, true)
    assert.equal(f.api.draftSections.value[0].items[0].name, 'Soup')
    assert.equal(f.api.pendingMode.value, '')
    f.stop()
  }
})
test('persisted draft and failure messages remain visible without a new request', () => {
  const f = fixture()
  f.context.source.value = {
    id: 'upload',
    ai_draft: {
      sections: [{ label: 'Main', items: [{ name: 'Saved soup' }] }],
      report: {
        flags: [{ code: 'review', level: 'warning', message: 'Check price' }],
      },
    },
    ai_process: { stage: 'failed', reason: 'Saved failure' },
  }
  assert.equal(f.api.draftSections.value[0].items[0].name, 'Saved soup')
  assert.equal(f.api.flags.value[0].message, 'Check price')
  assert.equal(f.api.displayError.value, 'Saved failure')
  assert.equal(f.calls.length, 0)
  f.stop()
})
test('obsolete credentials cannot replace a newer account token', async () => {
  const old = deferred(),
    f = fixture({ token: old.promise })
  f.currentUser.value = { uid: 'other', getIdToken: async () => 'new-token' }
  await settle()
  old.resolve('old-token')
  await settle()
  assert.equal(f.api.authToken.value, 'new-token')
  f.stop()
})
test('record/account/disposal changes discard obsolete process success and error', async () => {
  for (const change of ['menu', 'kitchen', 'upload', 'account', 'dispose'])
    for (const failed of [false, true]) {
      const response = deferred(),
        f = fixture({ fetcher: () => response.promise })
      await settle()
      const request = f.api.processSource('standard')
      if (change === 'menu') {
        f.context.menuId.value = 'other'
        f.context.menuId.value = 'm'
      }
      if (change === 'kitchen') {
        f.context.kitchenId.value = 'other'
        f.context.kitchenId.value = 'k'
      }
      if (change === 'upload') f.context.source.value = { id: 'other' }
      if (change === 'account') f.currentUser.value = null
      if (change === 'dispose') f.stop()
      f.api.pendingMode.value = 'strong'
      if (failed) response.reject(Error('Obsolete failure'))
      else
        response.resolve({
          ok: true,
          json: async () => ({ message: 'Obsolete success' }),
        })
      await request
      assert.equal(f.api.result.value, null)
      assert.equal(f.api.displayError.value, '')
      assert.equal(f.api.pendingMode.value, 'strong')
      f.stop()
    }
})
test('processing cannot dispatch without authority or credentials', async () => {
  const denied = fixture({ allowed: false })
  await settle()
  await denied.api.processSource('standard')
  assert.equal(denied.calls.length, 0)
  assert.equal(denied.api.displayError.value, 'Access denied')
  denied.stop()
  const waiting = fixture({ token: new Promise(() => {}) })
  await waiting.api.processSource('standard')
  assert.equal(waiting.calls.length, 0)
  waiting.stop()
})
