import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

function harness(existing: boolean, unlisted = false, visibility = true) {
  const writes: Array<{
    target: string
    id: string
    data: Record<string, unknown>
  }> = []
  const oldKitchen = {
    slug: 'existing',
    management: { level: 'app' },
    visibility,
  }
  const source = readFileSync(
    new URL(
      '../../runtime/kitchen/server/index/onboarding/directory.ts',
      import.meta.url
    ),
    'utf8'
  )
    .replace(/import[\s\S]*?from ['"][^'"]+['"]\n/g, '')
    .replace(/^export /gm, '')
  const dependencies = {
    readKitchenOnboardingRequest: (body: unknown) => body,
    readKitchenOnboardingActor: async () => ({
      uid: 'contributor',
      appId: 'misebox-app',
      canCreate: true,
    }),
    resolveKitchenOnboardingTransactionLocator: () => ({
      kitchenId: 'verified-place',
      placeId: 'verified-place',
    }),
    resolveWorkspaceEntityCreationId: ({
      ownerUserId,
    }: {
      ownerUserId: string
    }) => ownerUserId,
    requireFirestoreDocumentId: (id: string) => id,
    serverKitchenMenusTarget: () => 'menus',
    FIRESTORE_MUTATION_TARGETS: { places: 'places', kitchens: 'kitchens' },
    runGuardedServerTransaction: async (_: unknown, callback: Function) =>
      callback({
        read: async (target: string) =>
          target === 'places'
            ? {
                exists: !unlisted,
                data: {
                  name: 'Venue',
                  default_currency_code: 'CHF',
                  timezone: 'Europe/Zurich',
                },
              }
            : { exists: existing, data: existing ? oldKitchen : null },
        readAll: async () => [],
        create: (target: string, id: string, data: Record<string, unknown>) =>
          writes.push({ target, id, data }),
      }),
    assertKitchenOnboardingPlaceDefaults: () => {},
    normalizeSlug: () => 'venue',
    serverAuditStamp: (value: unknown) => value,
    createKitchenSystemMenus: ({ mutations, target }: any) => {
      for (const slug of ['food', 'drinks'])
        mutations.create(target, `generated-${slug}`, { slug, status: 'draft' })
    },
    fail: (_: number, message: string) => {
      throw new Error(message)
    },
  }
  const contribute = compileFunction(
    `${stripTypeScriptTypes(source)}\nreturn contributeKitchenDirectory`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
  return { contribute, writes, oldKitchen }
}

test('directory contribution records attribution without granting Team or My Kitchens membership', async () => {
  const { contribute, writes } = harness(false)
  const result = await contribute({}, { place_id: 'verified-place' })
  assert.equal(result.created_root, true)
  assert.deepEqual(
    writes.map((write) => write.target),
    ['kitchens']
  )
  const root = writes[0]
  assert.equal(root.id, 'verified-place')
  assert.equal(root.data.visibility, true)
  assert.equal(root.data.currency, 'CHF')
  assert.deepEqual(root.data.created, {
    by: 'contributor',
    appId: 'misebox-app',
  })
  assert.equal('owner' in root.data, false)
  assert.equal('app_user' in result, false)
  assert.equal(writes.some(write => /\/(team|access|users)(\/|$)/.test(write.target)), false)
})

test('repeated or racing directory contribution preserves existing Kitchen and all fields', async () => {
  const { contribute, writes, oldKitchen } = harness(true)
  const before = structuredClone(oldKitchen)
  const result = await contribute({}, { place_id: 'verified-place' })
  assert.equal(result.created_root, false)
  assert.equal(result.slug, 'existing')
  assert.deepEqual(writes, [])
  assert.deepEqual(oldKitchen, before)
})

test('name-only directory contribution publishes with creator attribution and no association or Team entry', async () => {
  const { contribute, writes } = harness(false, true)
  const result = await contribute({}, { name: 'Community kitchen' })
  assert.equal(result.kitchen_id, 'contributor')
  assert.equal(result.created_root, true)
  assert.deepEqual(
    writes.map((write) => write.target),
    ['places', 'kitchens']
  )
  assert.equal(writes[0].data.name, 'Community kitchen')
  assert.equal(writes[0].data.place_type, 'non_physical')
  assert.equal(writes[1].data.identity_source, 'user')
  assert.equal(writes[1].data.visibility, true)
  assert.equal(writes[1].data.currency, '')
  assert.equal('app_user' in result, false)
  assert.equal(writes.some(write => /\/(team|access|users)(\/|$)/.test(write.target)), false)
})

test('name-only retry preserves an existing hidden Kitchen instead of publishing or renaming it', async () => {
  const { contribute, writes, oldKitchen } = harness(true, true, false)
  const before = structuredClone(oldKitchen)
  const result = await contribute({}, { name: 'Different name' })
  assert.equal(result.created_root, false)
  assert.deepEqual(writes, [])
  assert.deepEqual(oldKitchen, before)
  assert.equal(oldKitchen.visibility, false)
})

test('name-only contribution rejects blank or mixed source input before any write', async () => {
  for (const input of [{ name: '' }, { name: 'Name', place_id: 'location' }]) {
    const { contribute, writes } = harness(false, true)
    await assert.rejects(() => contribute({}, input), /Enter a kitchen name/)
    assert.deepEqual(writes, [])
  }
})
