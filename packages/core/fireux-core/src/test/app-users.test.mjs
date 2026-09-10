import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref } from 'vue'

test('App memberships retain missing identities and hydrate User data without flattening it', () => {
  const source = readFileSync(new URL('../runtime/app/composables/useAppUsers.ts', import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  const members = ref([{ id: 'known', role: 'user', subscription: 'free' }, { id: 'missing', role: 'admin', subscription: 'business' }])
  const identities = ref({ known: { id: 'known', display_name: 'Known User' } })
  const collection = value => Object.assign(value, { pending: ref(false), error: ref(null) })
  const dependencies = {
    computed,
    useFireUXConfig: () => ({ appId: 'example' }),
    useAuth: () => ({ currentUser: ref({ uid: 'actor' }), hasAuthState: ref(true) }),
    useFirestoreRead: () => ({ firestoreFetchCollection: path => collection(path.value.endsWith('/users') ? members : ref([])) }),
    useUserHydration: () => ({ userById: id => identities.value[id], pending: ref(false), error: ref(null) }),
  }
  const read = compileFunction(`${stripTypeScriptTypes(source)}; return useAppUsers`, Object.keys(dependencies))(...Object.values(dependencies))
  const state = read()
  assert.equal(state.count.value, 2)
  assert.equal(state.memberships.value[1].user, null)
  assert.equal(state.memberships.value[0].user.display_name, 'Known User')
  assert.equal('display_name' in state.memberships.value[0], false)
  assert.equal('coreUser' in state.memberships.value[0], false)
  assert.equal(state.userById('missing'), undefined)
  identities.value.missing = { id: 'missing', display_name: 'Resolved User' }
  assert.equal(state.memberships.value[1].user.display_name, 'Resolved User')
  assert.equal(state.userById('missing').display_name, 'Resolved User')
})
