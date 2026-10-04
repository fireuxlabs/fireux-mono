import { resolveReadOutcome } from '../runtime/composables/fireux/firestore/operations/read-outcome.ts'
import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref, unref } from 'vue'

test('App memberships retain missing identities and hydrate User data without flattening it', () => {
  const source = readFileSync(
    new URL('../runtime/app/composables/membership/useAppUsers.ts', import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  const members = ref([
    { id: 'known', role: 'user', subscription: 'free' },
    { id: 'missing', role: 'admin', subscription: 'business' },
  ])
  const identities = ref({ known: { id: 'known', display_name: 'Known User' } })
  const collection = (value) => ({
    data: value,
    pending: ref(false),
    error: ref(null),
    hasMore: ref(false),
    loadMore() {},
  })
  const dependencies = {
    resolveReadOutcome,
    computed,
    where: (field, operator, value) => ({ field, operator, value }),
    useFireUXConfig: () => ({ appId: 'example' }),
    useAuth: () => ({
      currentUser: ref({ uid: 'actor' }),
      hasAuthState: ref(true),
    }),
    useFirestoreRead: () => ({
      firestoreCollectionPage: (path, options = {}) =>
        collection(
          path.value.endsWith('/users')
            ? options.constraints
              ? computed(() =>
                  members.value.filter((member) =>
                    ['admin', 'dev'].includes(member.role)
                  )
                )
              : members
            : ref([])
        ),
    }),
    useUserHydration: () => ({
      userById: (id) => identities.value[id],
      pending: ref(false),
      error: ref(null),
    }),
  }
  const read = compileFunction(
    `${stripTypeScriptTypes(source)}; return useAppUsers`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
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

test('one membership uses one exact read and follows viewer authority and selected person', () => {
  const source = readFileSync(
    new URL(
      '../runtime/app/composables/membership/useAppUserMembership.ts',
      import.meta.url
    ),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  const viewer = ref({ id: 'viewer' })
  const isAdmin = ref(true)
  const subject = ref('person-a')
  const rows = ref({ 'person-a': { role: 'user', subscription: 'free' } })
  const viewerMembership = ref({ role: 'admin', subscription: 'business' })
  let target,
    reads = 0
  const dependencies = {
    resolveReadOutcome,
    computed,
    ref,
    unref,
    useFireUXConfig: () => ({ appId: 'app-a' }),
    useUserSession: () => ({
      user: viewer,
      appUser: viewerMembership,
      appOutcome: ref('ready'),
      subscription: ref('business'),
      isAdmin,
      isDeveloper: ref(false),
    }),
    useAppUserRead: (app, id) => {
      reads++
      assert.equal(app, 'app-a')
      target = id
      return {
        appUser: computed(() =>
          id.value ? (rows.value[id.value] ?? null) : undefined
        ),
        outcome: computed(() =>
          !id.value ? 'idle' : rows.value[id.value] ? 'ready' : 'missing'
        ),
      }
    },
    useToastify: () => ({}),
  }
  const useMembership = compileFunction(
    `${stripTypeScriptTypes(source)}; return useAppUserMembership`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
  const state = useMembership({ subjectUserId: subject })
  assert.equal(reads, 1)
  assert.equal(target.value, 'person-a')
  assert.equal(state.membership.value.subscription, 'free')
  rows.value['person-a'].subscription = 'premium'
  assert.equal(state.membership.value.subscription, 'premium')
  subject.value = 'absent'
  assert.equal(target.value, 'absent')
  assert.equal(state.membership.value, null)
  assert.equal(state.resolved.value, true)
  isAdmin.value = false
  assert.equal(target.value, '')
  assert.equal(state.visible.value, false)
  subject.value = 'viewer'
  assert.equal(target.value, '', 'own membership reuses the session read')
  assert.equal(state.membership.value.role, 'admin')
  assert.equal(state.visible.value, true)
  assert.equal(reads, 1)
})

test('administrators beyond the member page are still read and hydrated', () => {
  const source = readFileSync(
    new URL('../runtime/app/composables/membership/useAppUsers.ts', import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  const member = { id: 'a-person', role: 'user', subscription: 'free' }
  const admin = { id: 'z-admin', role: 'admin', subscription: 'business' }
  let hydrationIds
  const dependencies = {
    resolveReadOutcome,
    computed,
    where: (field, operator, values) => ({ field, operator, values }),
    useFireUXConfig: () => ({ appId: 'example' }),
    useAuth: () => ({
      currentUser: ref({ uid: 'actor' }),
      hasAuthState: ref(true),
    }),
    useFirestoreRead: () => ({
      firestoreCollectionPage: (path, options) => ({
        data: ref(
          path.value.endsWith('/join-requests')
            ? []
            : options.constraints
              ? [admin]
              : [member]
        ),
        pending: ref(false),
        error: ref(null),
        hasMore: ref(!options.constraints),
        loadMore() {},
      }),
    }),
    useUserHydration: (ids) => {
      hydrationIds = ids
      return {
        userById: (id) => ({ id, display_name: id }),
        pending: ref(false),
        error: ref(null),
      }
    },
  }
  const useMembers = compileFunction(
    `${stripTypeScriptTypes(source)}; return useAppUsers`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
  const state = useMembers()
  assert.deepEqual(
    state.memberships.value.map((member) => member.id),
    ['a-person']
  )
  assert.deepEqual(
    state.administrators.value.map((member) => member.id),
    ['z-admin']
  )
  assert.deepEqual(hydrationIds.value, ['a-person', 'z-admin'])
  assert.equal(state.userById('z-admin').display_name, 'z-admin')
})
