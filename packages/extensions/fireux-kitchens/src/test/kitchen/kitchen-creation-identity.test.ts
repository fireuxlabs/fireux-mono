import assert from 'node:assert/strict'
import test from 'node:test'
import { resolveWorkspaceEntityCreationId } from 'fireux-core/runtime/server/utils/workspace-entity/creation-identity'
import { resolveAppUserKitchenState } from '../../runtime/kitchen/server/core/user-kitchens.ts'
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
      kitchens: ['one', 'two', 'three', 'four'],
    }),
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
    useKitchenCreate: () => ({ createKitchen() {} }),
    useKitchenUpdate: () => ({ updateKitchen() {} }),
    useKitchenDelete: () => ({ deleteKitchen() {} }),
    useKitchenRead: () => ({
      kitchen: ref({ id: 'one' }),
      outcome: ref('ready'),
    }),
    useAppSession: () => session,
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
  session.pending.value = true
  assert.equal(workspace.canCreate.value, false)
  session.pending.value = false
  session.uid.value = ''
  assert.equal(workspace.canCreate.value, false)
})

test('Premium retains four Kitchens but cannot create or associate a fifth', () => {
  const membership = {
    role: 'user',
    subscription: 'premium',
    kitchens: ['one', 'two', 'three', 'four'],
  }
  const before = structuredClone(membership)
  const allowance = resolveKitchenAllowance(membership)
  assert.equal(allowance.used, 4)
  assert.equal(allowance.limit, 1)
  assert.equal(allowance.canAdd, false)
  assert.equal(allowance.showUpgrade, true)
  assert.deepEqual(
    resolveAppUserKitchenState(membership, 'two').kitchens,
    membership.kitchens
  )
  for (const id of ['new-kitchen', 'existing-baren']) {
    assert.throws(
      () => resolveAppUserKitchenState(membership, id),
      /current subscription supports one Kitchen/
    )
  }
  assert.deepEqual(membership, before)
})

test('Kitchen allowance uses actual membership, counts only unique Kitchens and requires membership for UI creation', () => {
  const membership = {
    role: 'user',
    subscription: 'free',
    kitchens: ['one', 'one', ''],
    projects: ['project'],
    previewSubscription: 'business',
  }
  assert.equal(resolveKitchenAllowance(membership).used, 1)
  assert.equal(resolveKitchenAllowance(membership).canAdd, false)
  assert.equal(
    resolveKitchenAllowance({ ...membership, subscription: 'business' }).canAdd,
    true
  )
  assert.equal(
    resolveKitchenAllowance({ ...membership, subscription: 'business' }).limit,
    null
  )
  assert.equal(
    resolveKitchenAllowance({
      role: 'user',
      subscription: 'premium',
      kitchens: [],
    }).canAdd,
    true
  )
  assert.equal(resolveKitchenAllowance(null).canAdd, false)
  assert.equal(resolveKitchenAllowance(null).showUpgrade, false)
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

test('onboarding adds the Kitchen once and makes it primary', () => {
  assert.deepEqual(
    resolveAppUserKitchenState(
      {
        kitchens: ['existing-kitchen', 'existing-kitchen'],
        role: 'user',
        subscription: 'business',
      },
      'new-kitchen'
    ),
    {
      kitchens: ['existing-kitchen', 'new-kitchen'],
      primary_kitchen: 'new-kitchen',
    }
  )
})

test('onboarding an existing Kitchen changes primary without duplicating it', () => {
  assert.deepEqual(
    resolveAppUserKitchenState(
      { kitchens: ['first-kitchen', 'second-kitchen'] },
      'first-kitchen'
    ),
    {
      kitchens: ['first-kitchen', 'second-kitchen'],
      primary_kitchen: 'first-kitchen',
    }
  )
})

test('Free and Premium may reopen their existing Kitchen', () => {
  for (const subscription of ['free', 'premium'] as const) {
    assert.deepEqual(
      resolveAppUserKitchenState(
        { kitchens: ['existing-kitchen'], role: 'user', subscription },
        'existing-kitchen'
      ),
      {
        kitchens: ['existing-kitchen'],
        primary_kitchen: 'existing-kitchen',
      }
    )
  }
})

test('Free and Premium cannot connect a second existing Kitchen', () => {
  for (const subscription of ['free', 'premium'] as const) {
    assert.throws(
      () =>
        resolveAppUserKitchenState(
          { kitchens: ['existing-kitchen'], role: 'user', subscription },
          'second-kitchen'
        ),
      /current subscription supports one Kitchen/
    )
  }
})

test('Business may connect another Kitchen and make it primary', () => {
  assert.deepEqual(
    resolveAppUserKitchenState(
      {
        kitchens: ['existing-kitchen'],
        role: 'user',
        subscription: 'business',
      },
      'second-kitchen'
    ),
    {
      kitchens: ['existing-kitchen', 'second-kitchen'],
      primary_kitchen: 'second-kitchen',
    }
  )
})

test('onboarding rejects a Kitchen beyond the supported AppUser limit', () => {
  assert.throws(
    () =>
      resolveAppUserKitchenState(
        {
          kitchens: Array.from(
            { length: 50 },
            (_, index) => `kitchen-${index}`
          ),
          role: 'user',
          subscription: 'business',
        },
        'one-too-many'
      ),
    /User Kitchens exceed the supported limit/
  )
})
