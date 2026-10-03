import assert from 'node:assert/strict'
import test from 'node:test'
import { resolveWorkspaceEntityCreationId } from 'fireux-core/runtime/server/utils/workspace-entity/creation-identity'
import { resolveKitchenGrantIds } from '../../runtime/kitchen/server/core/access.ts'
import { readKitchenAccessIds } from '../../runtime/kitchen/utils/kitchen-access.ts'
import { resolveKitchenAllowance } from '../../runtime/kitchen/utils/kitchen-capacity.ts'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref } from 'vue'

test('Workspace creation reacts to actual account allowance and waits for account readiness', () => {
  const session = {
    uid: ref('user'),
    pending: ref(false),
    error: ref(null),
    appUser: ref({
      role: 'user',
      subscription: 'premium',
    }),
  }
  const access = {
    ids: ref(['one', 'two', 'three', 'four']),
    pending: ref(false),
    error: ref(null),
  }
  const source = readFileSync(
    new URL(
      '../../runtime/kitchen/composables/workspace/useKitchenWorkspace.ts',
      import.meta.url
    ),
    'utf8'
  )
    .replace(/^import .* from .+\n/gm, '')
    .replace(/^export /gm, '')
  const dependencies = {
    computed,
    resolveKitchenAllowance,
    useWorkspace: () => ({ selectedId: ref('one') }),
    useKitchenAnonymousAdoption: () => ({}),
    useKitchenUpdate: () => ({ updateKitchen() {} }),
    useKitchenInterface: () => ({ surface: ({ kitchen }) => kitchen }),
    useKitchenRead: () => ({
      place: ref(null),
      kitchen: ref({ id: 'one' }),
      outcome: ref('ready'),
    }),
    useAppSession: () => session,
    useKitchenAccess: () => access,
    useFireUXConfig: () => ({
      role: 'global',
      workspaceConfig: {},
      subscriptionPreview: 'business',
    }),
    resolveWorkspaceCanCreate: () => true,
  }
  const useKitchenWorkspace = compileFunction(
    `${stripTypeScriptTypes(source)}\nreturn useKitchenWorkspace`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
  const workspace = useKitchenWorkspace()
  assert.equal(workspace.allowance.value.used, 4)
  assert.equal(workspace.canCreate.value, false)
  assert.equal(workspace.canAdd.value, false)
  assert.equal(workspace.showUpgrade.value, true)
  session.appUser.value.subscription = 'business'
  assert.equal(workspace.canCreate.value, true)
  assert.equal(workspace.showUpgrade.value, false)
  access.pending.value = true
  assert.equal(workspace.canCreate.value, false)
  access.pending.value = false
  session.pending.value = true
  assert.equal(workspace.canCreate.value, false)
  session.pending.value = false
  session.uid.value = ''
  assert.equal(workspace.canCreate.value, false)
})

test('Premium retains four Kitchens but cannot grant a fifth', () => {
  const membership = { role: 'user', subscription: 'premium' }
  const ids = ['one', 'two', 'three', 'four']
  const allowance = resolveKitchenAllowance(membership, ids)
  assert.equal(allowance.used, 4)
  assert.equal(allowance.limit, 1)
  assert.equal(allowance.canAdd, false)
  assert.equal(allowance.showUpgrade, true)
  assert.deepEqual(resolveKitchenGrantIds(membership, ids, 'two'), ids)
  assert.throws(
    () => resolveKitchenGrantIds(membership, ids, 'new'),
    /current subscription supports one Kitchen/
  )
  assert.deepEqual(ids, ['one', 'two', 'three', 'four'])
})

test('Kitchen allowance combines App subscription with domain ids, not AppUser fields', () => {
  const membership = {
    role: 'user',
    subscription: 'free',
    kitchens: ['legacy'],
    previewSubscription: 'business',
  }
  assert.equal(resolveKitchenAllowance(membership, []).used, 0)
  assert.equal(resolveKitchenAllowance(membership, ['one']).canAdd, false)
  assert.equal(
    resolveKitchenAllowance({ ...membership, subscription: 'business' }, [
      'one',
    ]).canAdd,
    true
  )
  assert.equal(resolveKitchenAllowance(null, []).canAdd, false)
  assert.equal(resolveKitchenAllowance(null, []).showUpgrade, false)
})

test('an explicit shell uses the beneficiary User UID', () => {
  assert.equal(
    resolveWorkspaceEntityCreationId({
      intent: 'create_shell',
      ownerUserId: 'user-uid',
    }),
    'user-uid'
  )
})

test('an existing or provider Place preserves its Place ID', () => {
  assert.equal(
    resolveWorkspaceEntityCreationId({
      intent: 'use_source',
      sourceId: 'place-record-id',
    }),
    'place-record-id'
  )
  assert.equal(
    resolveWorkspaceEntityCreationId({
      intent: 'use_source',
      sourceId: 'ChIJ-provider-id',
    }),
    'ChIJ-provider-id'
  )
})

test('an unresolved Place cannot become a shell implicitly', () => {
  assert.throws(
    () =>
      resolveWorkspaceEntityCreationId({
        intent: 'use_source',
        sourceId: '',
      }),
    /Source id is required/
  )
})

test('onboarding grants an existing Kitchen only once', () => {
  const membership = { role: 'user', subscription: 'business' }
  assert.deepEqual(resolveKitchenGrantIds(membership, ['first'], 'second'), [
    'first',
    'second',
  ])
  assert.deepEqual(
    resolveKitchenGrantIds(membership, ['first', 'second'], 'first'),
    ['first', 'second']
  )
})

test('Free and Premium may reopen their Kitchen but cannot connect a second', () => {
  for (const subscription of ['free', 'premium']) {
    const membership = { role: 'user', subscription }
    assert.deepEqual(
      resolveKitchenGrantIds(membership, ['existing'], 'existing'),
      ['existing']
    )
    assert.throws(
      () => resolveKitchenGrantIds(membership, ['existing'], 'second'),
      /current subscription supports one Kitchen/
    )
  }
})

test('onboarding rejects a Kitchen beyond the supported domain limit', () => {
  const ids = Array.from({ length: 50 }, (_, index) => `kitchen-${index}`)
  assert.throws(
    () =>
      resolveKitchenGrantIds(
        { role: 'user', subscription: 'business' },
        ids,
        'too-many'
      ),
    /User Kitchens exceed the supported limit/
  )
})

test('Kitchen access is bound to the exact App membership lifetime', () => {
  const created = { seconds: 10, nanoseconds: 20 }
  const membership = { created: { at: created }, kitchens: ['legacy'] }
  const access = { ids: ['kitchen'], membership_created_at: created }
  assert.deepEqual(readKitchenAccessIds(access, membership), ['kitchen'])
  assert.deepEqual(readKitchenAccessIds(undefined, membership), [])
  assert.deepEqual(
    readKitchenAccessIds(access, {
      created: { at: { seconds: 10, nanoseconds: 21 } },
    }),
    []
  )
  assert.throws(
    () =>
      readKitchenAccessIds(
        { ...access, ids: ['kitchen', 'kitchen'] },
        membership
      ),
    /invalid stored ids/
  )
  assert.throws(() => readKitchenAccessIds(access, null), /creation timestamp/)
})
