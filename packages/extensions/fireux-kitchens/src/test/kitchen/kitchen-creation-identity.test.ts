import assert from 'node:assert/strict'
import test from 'node:test'
import { resolveWorkspaceEntityCreationId } from 'fireux-core/runtime/server/utils/workspace-entity/creation-identity'

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
