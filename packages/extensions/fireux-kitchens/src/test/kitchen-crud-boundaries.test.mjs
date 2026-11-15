import { readAppUserSubscription } from '../../../../core/fireux-core/src/runtime/app/app-user/utils/validation.ts'
import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestore-document-id'
import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
function load(path, names, deps = {}) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export type \{[^\n]+\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)};return {${names}}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
const { readMembershipAccessIds } = load(
  '../../../../core/fireux-core/src/runtime/app/app-user/utils/membership-access.ts',
  'readMembershipAccessIds'
)
const { readKitchenAccessIds } = load(
  '../runtime/kitchen/utils/kitchen-access.ts',
  'readKitchenAccessIds',
  { readMembershipAccessIds, KITCHEN_USER_LIMIT: 500 }
)
const authority = load(
  '../runtime/kitchen/server/core/mutation-authority.ts',
  'requireKitchenRecordMutationAuthority,requireKitchenMutationAuthority',
  {
    createError: ({ statusMessage, statusCode }) =>
      Object.assign(new Error(statusMessage), { statusCode }),
    serverAppUsersTarget: (id) => `apps/${id}/users`,
    serverKitchenAccessTarget: () => 'kitchen_access',
    KITCHEN_MUTATION_TARGETS: { kitchens: 'kitchens' },
    PLACE_MUTATION_TARGETS: { places: 'places' },
    readAppUserSubscription,
    readKitchenAccessIds,
  }
)
const at = { seconds: 100, nanoseconds: 1 }
const member = { role: 'user', subscription: 'free', created: { at } }
const access = { ids: ['mine'], membership_created_at: at }
function transaction(overrides = {}) {
  const docs = {
    'kitchens/mine': { name: 'Name-only Kitchen' },
    'apps/app/users/operator': member,
    'kitchen_access/operator': { apps: { app: access } },
    ...overrides,
  }
  return {
    read: async (target, id) => ({
      exists: !!docs[`${target}/${id}`],
      data: docs[`${target}/${id}`],
    }),
  }
}
const actor = { uid: 'operator', runtimeAppId: 'app' }
test('Kitchen record authority accepts name-only Kitchen; Place workflows still require Place', async () => {
  assert.equal(
    (
      await authority.requireKitchenRecordMutationAuthority(
        transaction(),
        actor,
        'mine'
      )
    ).ownerAppId,
    'app'
  )
  await assert.rejects(
    authority.requireKitchenMutationAuthority(transaction(), actor, 'mine'),
    /linked Place/
  )
  assert.deepEqual(
    (
      await authority.requireKitchenMutationAuthority(
        transaction({ 'places/mine': { name: 'Place' } }),
        actor,
        'mine'
      )
    ).placeData,
    { name: 'Place' }
  )
})
test('Kitchen record authority rejects missing membership, revoked/rejoined access, wrong Kitchen and invalid subscription', async () => {
  for (const overrides of [
    { 'apps/app/users/operator': undefined },
    { 'kitchen_access/operator': undefined },
    {
      'kitchen_access/operator': {
        apps: { app: { ...access, ids: ['other'] } },
      },
    },
    {
      'kitchen_access/operator': {
        apps: {
          app: {
            ...access,
            membership_created_at: { ...at, seconds: 99 },
          },
        },
      },
    },
    { 'apps/app/users/operator': { ...member, subscription: 'invalid' } },
    { 'kitchens/mine': undefined },
  ])
    await assert.rejects(
      authority.requireKitchenRecordMutationAuthority(
        transaction(overrides),
        actor,
        'mine'
      )
    )
  await assert.rejects(
    authority.requireKitchenRecordMutationAuthority(
      transaction(),
      { ...actor, runtimeAppId: 'other' },
      'mine'
    )
  )
})
