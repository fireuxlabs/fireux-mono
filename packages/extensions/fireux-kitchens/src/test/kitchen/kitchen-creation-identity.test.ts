import assert from 'node:assert/strict'
import test from 'node:test'
import { resolveWorkspaceEntityCreationId } from 'fireux-core/runtime/server/utils/workspace-entity/creation-identity'
import { resolveAppUserKitchenState } from '../../runtime/kitchen/server/core/user-kitchens.ts'

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
