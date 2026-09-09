import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { ref, shallowRef, readonly } from 'vue'

const source = readFileSync(new URL('../runtime/composables/fireux/publishing/usePublish.ts', import.meta.url), 'utf8')
  .replace(/^import .* from .*\n/gm, '').replace(/^export /gm, '')
const usePublish = compileFunction(`${stripTypeScriptTypes(source)}; return usePublish`, ['ref', 'shallowRef', 'readonly'])(ref, shallowRef, readonly)

test('publication prevents overlapping commands and returns the domain result', async () => {
  const state = usePublish()
  let complete
  let calls = 0
  const pending = state.publish(() => { calls++; return new Promise(resolve => { complete = resolve }) })
  assert.equal(state.publishing.value, true)
  await assert.rejects(state.publish(async () => { calls++ }), /already in progress/)
  assert.equal(calls, 1)
  complete({ id: 'published' })
  assert.deepEqual(await pending, { id: 'published' })
  assert.equal(state.publishing.value, false)
})

test('publication preserves failure, resets busy state, and allows explicit retry', async () => {
  const state = usePublish()
  const failure = new Error('Domain denied publication')
  await assert.rejects(state.publish(async () => { throw failure }), failure)
  assert.equal(state.publishError.value, failure)
  assert.equal(state.publishing.value, false)
  assert.equal(await state.publish(async () => 'done'), 'done')
  assert.equal(state.publishError.value, null)
})

for (const [domain, path, storage, input] of [
  ['Product', '../../../../extensions/fireux-products/src/runtime/product/composables/firestore/mutations/useProductPublish.ts', 'products', { slug: 'sample', name: 'Product' }],
  ['Blog', '../../../../extensions/fireux-blogs/src/runtime/composables/fireux/firestore/blog/mutations/useBlogPublish.ts', 'blogs', { slug: 'sample', title: 'Blog' }],
  ['Job', '../../../../extensions/fireux-jobs/src/runtime/job/composables/firestore/mutations/useJobPublish.ts', null, { id: 'sample', title: 'Job' }],
]) {
  test(`${domain} retains its own publication target and transport`, async () => {
    const raw = readFileSync(new URL(path, import.meta.url), 'utf8').replace(/^import .* from .*\n/gm, '').replace(/^export /gm, '')
    const calls = []
    const dependencies = {
      usePublish,
      useFirestoreUpdate: () => ({ updateDocument: async (...args) => calls.push(['document', ...args]) }),
      assertPublicSlug: async slug => slug,
      ProductStorage: { collection: storage }, BlogPostStorage: { collection: storage },
      publishAuthorJobRequest: async id => { calls.push(['author', id]); return { id } },
    }
    const create = compileFunction(`${stripTypeScriptTypes(raw)}; return use${domain}Publish`, Object.keys(dependencies))(...Object.values(dependencies))
    const api = create()
    await api[`publish${domain}`](input)
    assert.equal(calls.length, 1)
    assert.deepEqual(calls[0].slice(0, 2), domain === 'Job' ? ['author', 'sample'] : ['document', storage])
    if (domain !== 'Job') assert.equal(calls[0][3].visibility, 'public')
  })
}
