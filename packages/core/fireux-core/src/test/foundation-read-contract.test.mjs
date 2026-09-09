import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref, unref } from 'vue'

for (const [name, owner, database, collection] of [
  ['App', 'app', undefined, 'apps'],
  ['AppUser', 'app', undefined, 'apps/app-a/users'],
  ['User', 'user', 'identity', 'users'],
  ['Ecosystem', 'ecosystem', 'identity', 'ecosystems'],
]) {
  test(`${name}: reactive identity, database authority and read states`, () => {
    let calls = 0
    let path
    let target
    const source = Object.assign(ref(undefined), {
      pending: ref(false), error: ref(undefined), outcome: ref('idle'),
    })
    const dependencies = {
      computed, unref,
      readRuntimeIdentityFirestoreDatabaseId: () => 'identity',
      normalizeUser: (id, data) => ({ ...data, id }),
      readAppDocument: (data, id) => {
        assert.equal('id' in data, false)
        return { ...data, id }
      },
      useFirestoreRead: (options = {}) => {
        assert.equal(options.databaseId, database)
        return { firestoreFetchDoc: (p, id) => {
          calls++
          path = p
          target = id
          return source
        } }
      },
    }
    const code = readFileSync(new URL(`../runtime/${owner}/composables/use${name}Read.ts`, import.meta.url), 'utf8')
      .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
      .replace(/^export /gm, '')
    const factory = compileFunction(`${stripTypeScriptTypes(code)}; return use${name}Read`, Object.keys(dependencies))(...Object.values(dependencies))
    const id = ref('')
    const app = ref('app-a')
    const result = name === 'AppUser' ? factory(app, id) : factory(id)
    const data = result[name[0].toLowerCase() + name.slice(1)]
    assert.equal(data.value, undefined)
    id.value = ' first '
    assert.equal(target.value, 'first')
    assert.equal(unref(path), collection)
    source.pending.value = true
    source.outcome.value = 'pending'
    assert.equal(data.value, undefined)
    assert.equal(result.outcome.value, 'pending')
    source.pending.value = false
    source.outcome.value = 'missing'
    assert.equal(data.value, null)
    source.value = { id: 'first', name: 'Example' }
    source.outcome.value = 'ready'
    assert.equal(data.value.id, 'first')
    const failure = new Error('denied')
    source.error.value = failure
    source.outcome.value = 'error'
    assert.equal(result.error.value, failure)
    assert.equal(result.outcome.value, 'error')
    id.value = 'second'
    assert.equal(target.value, 'second')
    if (name === 'AppUser') {
      app.value = 'app-b'
      assert.equal(path.value, 'apps/app-b/users')
      app.value = ''
      assert.equal(path.value, '')
      assert.equal(data.value, undefined)
    }
    assert.equal(calls, 1)
  })
}
