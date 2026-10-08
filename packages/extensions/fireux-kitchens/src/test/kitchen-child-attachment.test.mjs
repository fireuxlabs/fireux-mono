import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

const runtime = new URL('../runtime/', import.meta.url)
function load(path, expression, deps = {}) {
  const source = readFileSync(new URL(path, runtime), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export type \* from [^\n]+\n/gm, '')
    .replace(/^export \{[\s\S]*?\} from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(`${stripTypeScriptTypes(source)};return ${expression}`, Object.keys(deps))(...Object.values(deps))
}
const normalizeSproochliLanguage = load('../../../fireux-sproochli/src/runtime/composables/fireux/sproochli/publicLanguage.ts', 'normalizeSproochliLanguage')
const readSproochliAttachmentConfig = load('../../../fireux-sproochli/src/runtime/utils/attachment.ts', 'readSproochliAttachmentConfig', { normalizeSproochliLanguage })
const requireFirestoreDocumentId = (value) => {
  if (typeof value !== 'string' || !value || value.includes('/')) throw new Error('Invalid id')
  return value
}
const disabled = { enabled: false, requested_languages: [] }

test('Only the Kitchen child attachment can enable translation; root-only copies never revive it', async () => {
  const read = load('kitchen/server/core/sproochli-attachment.ts', 'readKitchenSproochliAttachment', { requireFirestoreDocumentId, readSproochliAttachmentConfig })
  for (const child of [undefined, { enabled: false }, { enabled: true, default_language: 'en', requested_languages: ['de'] }]) {
    const paths = []
    const db = { doc(path) {
      paths.push(path)
      assert.equal(path, 'kitchens/k/integrations/sproochli')
      return { get: async () => ({ exists: child !== undefined, data: () => child }) }
    } }
    const result = await read(db, 'k')
    assert.deepEqual(result, child === undefined ? disabled : readSproochliAttachmentConfig(child))
    assert.deepEqual(paths, ['kitchens/k/integrations/sproochli'])
  }
})

test('Attachment failures remain failures, and invalid scope performs no read', async () => {
  const read = load('kitchen/server/core/sproochli-attachment.ts', 'readKitchenSproochliAttachment', { requireFirestoreDocumentId, readSproochliAttachmentConfig })
  let reads = 0
  const db = { doc() { reads++; return { get: async () => { throw new Error('Unavailable child') } } } }
  await assert.rejects(read(db, 'k'), /Unavailable child/)
  assert.equal(reads, 1)
  await assert.rejects(read(db, 'k/other'), /Invalid id/)
  assert.equal(reads, 1)
})

function command(child, denied = false) {
  const effects = []
  const mutations = {
    read: async (target, id) => { effects.push(['read', target, id]); return { exists: child !== undefined, data: child } },
    create: (target, id, data) => effects.push(['create', target, id, data]),
    update: (target, id, data) => effects.push(['update', target, id, data]),
  }
  const update = load('kitchen/server/identity/sproochli.ts', 'updateKitchenSproochli', {
    createError: ({ statusMessage }) => new Error(statusMessage), requireFirestoreDocumentId, readSproochliAttachmentConfig,
    serverKitchenIntegrationsTarget: (id) => `kitchens/${id}/integrations`,
    readKitchenMutationActor: async () => ({ runtimeAppId: 'app', uid: 'operator' }),
    runGuardedServerTransaction: async (_scope, work) => work(mutations),
    requireKitchenMutationAuthority: async (_mutations, actor, id) => {
      effects.push(['authority', actor.uid, id])
      if (denied) throw new Error('Membership revoked')
      return { rootData: { integrations: { sproochli: { enabled: true, profile_id: 'old-root-profile', requested_languages: ['fr'], default_language: 'de' } } } }
    },
  })
  return { update, effects }
}

test('New attachment writes explicit input/defaults without inheriting root profile or languages', async () => {
  for (const enabled of [true, false]) {
    const { update, effects } = command(undefined)
    const result = await update({}, { kitchen_id: 'k', enabled, ...(enabled ? { default_language: 'en' } : {}) })
    const expected = { enabled, ...(enabled ? { default_language: 'en' } : {}), requested_languages: [] }
    assert.deepEqual(result, { ok: true, app_id: 'app', kitchen_id: 'k', sproochli: expected })
    assert.deepEqual(effects, [['authority', 'operator', 'k'], ['read', 'kitchens/k/integrations', 'sproochli'], ['create', 'kitchens/k/integrations', 'sproochli', expected]])
  }
})

test('Existing child owns retained profile/requested languages; authority failure cannot write', async () => {
  const child = { enabled: true, default_language: 'de', profile_id: 'child-profile', requested_languages: ['fr', 'fr'] }
  const { update, effects } = command(child)
  const result = await update({}, { kitchen_id: 'k', enabled: false })
  assert.deepEqual(result.sproochli, { enabled: false, profile_id: 'child-profile', requested_languages: ['fr'] })
  assert.equal(effects.at(-1)[0], 'update')
  const denied = command(child, true)
  await assert.rejects(denied.update({}, { kitchen_id: 'k', enabled: true, default_language: 'en' }), /Membership revoked/)
  assert.deepEqual(denied.effects, [['authority', 'operator', 'k']])
})

test('Root preimages cannot appear as attachment or fulfilment authority in the canonical Kitchen surface', () => {
  const safeString = (value) => String(value || '')
  const helpers = load('kitchen/utils/kitchen-interface-projection.ts', '({meaningfulSurfaceDelta,placeBaselineKeys,resolveKitchenPath})', { safeString })
  const readKitchenVisibility = load('kitchen/utils/kitchen-readers.ts', 'readKitchenVisibility')
  const ui = load('kitchen/composables/useKitchenInterface.ts', 'useKitchenInterface()', { ...helpers, safeString, readKitchenVisibility, readPlaceCurrencyCode: () => 'CHF', readMediaBackdropColor: () => '', toShortAddress: (v) => v })
  const view = ui.surface({ kitchen: { id: 'k', identity: { slug: 'venue', status: 'active', visibility: true }, integrations: { sproochli: { enabled: true } }, sproochli: { enabled: true }, fulfilment: { modes: ['collection'] } }, place: { name: 'Venue' } })
  for (const key of ['integrations', 'sproochli', 'fulfilment']) assert.equal(Object.hasOwn(view, key), false)
  assert.equal(view.identity.slug, 'venue')
  assert.equal(view.presentation.display_name, 'Venue')
})

test('Demo child fulfilment remains separate from Kitchen root while Menu presentation can consume it', () => {
  const kitchen = load('kitchen/demo/core/target-builders.ts', 'kitchen')
  const result = kitchen({ identity: { kitchenId: 'k', kitchenSlug: 'venue' }, themePalette: {}, paymentMethods: [{ method: 'cash_on_collection', order_types: ['collection'] }] })
  assert.equal(Object.hasOwn(result.kitchen, 'fulfilment'), false)
  assert.equal(Object.hasOwn(result.configuration, 'fulfilment'), false)
  assert.deepEqual(result.fulfilment, { delivery_zones: [], payment_methods: [{ method: 'cash_on_collection', order_types: ['collection'] }] })
})
