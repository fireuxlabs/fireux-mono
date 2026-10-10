import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestoreDocumentId'
import { commandScopeDeps } from '../command-scope-fixture.mjs'
import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { ref, watch } from 'vue'
function load(path, deps, result) {
  deps = commandScopeDeps({
    isFirestoreDocumentId,
    useRoute: () => ({ fullPath: '/dishes/dish' }),
    ...deps,
  })
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${result}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
function deferred() {
  let resolve, reject
  const promise = new Promise((a, b) => {
    resolve = a
    reject = b
  })
  return { promise, resolve, reject }
}
function harness() {
  const token = deferred(),
    response = deferred(),
    calls = [],
    disposals = []
  const user = { uid: 'a', getIdToken: () => token.promise },
    currentUser = ref(user),
    selectedId = ref('k')
  const useAuth = () => ({ currentUser })
  const useDishEditorScope = load(
    '../../runtime/kitchen/composables/dish/useDishEditorScope.ts',
    { watch, useAuth, onBeforeUnmount: (fn) => disposals.push(fn) },
    'useDishEditorScope'
  )
  const useDishImageUpload = load(
    '../../runtime/kitchen/composables/dish/useDishImageUpload.ts',
    {
      ref,
      useAuth,
      useDishEditorScope,
      useWorkspace: () => ({ selectedId }),
      useWorkspaceWriteGuard: () => ({ requireWritableData() {} }),
      File,
      FormData,
      $fetch: (...args) => {
        calls.push(args)
        return response.promise
      },
    },
    'useDishImageUpload'
  )
  return {
    ...useDishImageUpload(),
    currentUser,
    selectedId,
    user,
    token,
    response,
    calls,
    dispose: () => disposals.forEach((fn) => fn()),
  }
}
const input = () => ({
  kitchenId: 'k',
  dishId: 'dish',
  file: new File(['image'], 'original.png'),
})
test('image blocks Kitchen/account round trips, logout/login and disposal during credentials', async () => {
  for (const scope of ['kitchen', 'account', 'logout', 'dispose']) {
    const h = harness(),
      pending = h.uploadDishImage(input()),
      rejected = assert.rejects(pending, /changed/)
    assert.equal(h.pending.value, true)
    if (scope === 'kitchen') {
      h.selectedId.value = 'other'
      h.selectedId.value = 'k'
    } else if (scope === 'dispose') h.dispose()
    else {
      h.currentUser.value = scope === 'logout' ? null : { uid: 'b' }
      h.currentUser.value = h.user
    }
    h.token.resolve('token')
    await rejected
    assert.equal(h.calls.length, 0)
    assert.equal(h.pending.value, false)
  }
})
test('image captures file/target and prevents a second upload during token wait', async () => {
  const h = harness(),
    draft = input(),
    pending = h.uploadDishImage(draft)
  await assert.rejects(h.uploadDishImage(input()), /already uploading/)
  draft.file = new File(['changed'], 'changed.png')
  draft.dishId = 'other'
  draft.kitchenId = 'other'
  h.token.resolve('token')
  await Promise.resolve()
  assert.equal(h.calls[0][0], '/api/workspace/kitchen/dishes/dish/image')
  assert.equal(h.calls[0][1].body.get('file').name, 'original.png')
  assert.equal(h.calls[0][1].query.kitchenId, 'k')
  h.response.resolve({
    ok: true,
    dish_id: 'dish',
    image: 'https://example.com/dish.webp',
    object_path: 'kitchens/k/dishes/dish/image',
  })
  await pending
  assert.equal(h.pending.value, false)
})
test('obsolete credentials cannot dispatch; committed upload stays truthful without clearing newer pending', async () => {
  for (const stage of ['token', 'response']) {
    const h = harness(),
      first = h.uploadDishImage(input()),
      settled = stage === 'token' ? assert.rejects(first, /changed/) : first
    if (stage === 'response') {
      h.token.resolve('old')
      await Promise.resolve()
    }
    h.currentUser.value = null
    const nextToken = deferred()
    h.currentUser.value = { uid: 'b', getIdToken: () => nextToken.promise }
    const second = h.uploadDishImage(input())
    h.token.resolve('old')
    h.response.resolve({
      ok: true,
      dish_id: 'dish',
      image: 'https://example.com/dish.webp',
      object_path: 'kitchens/k/dishes/dish/image',
    })
    await settled
    assert.equal(h.pending.value, true)
    nextToken.resolve('new')
    await second
    assert.equal(h.pending.value, false)
  }
})
