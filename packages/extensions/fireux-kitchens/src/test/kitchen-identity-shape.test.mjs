import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
const base = new URL('../runtime/', import.meta.url)
function load(path, names, dependencies = {}) {
  const source = readFileSync(new URL(path, base), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export \{[\s\S]*?\} from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return {${names}}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const { readKitchenVisibility } = load(
  'kitchen/utils/kitchen-readers.ts',
  'readKitchenVisibility'
)
const { normalizeKitchen } = load(
  'kitchen/utils/normalize-kitchen.ts',
  'normalizeKitchen',
  {
    isFirestoreDocumentId: (v) => !!v && !v.includes('/'),
    readKitchenVisibility,
  }
)
test('canonical Identity is nested, keeps unknown origin unknown, and excludes Place facts', () => {
  const place = { id: 'p', name: 'Venue', default_currency_code: 'GBP' }
  const identity = { slug: 'venue', status: 'active', visibility: true }
  const value = normalizeKitchen(
    'p',
    { identity, slug: 'obsolete', currency: 'CHF', name: 'shadow' },
    place
  )
  assert.deepEqual(value, { id: 'p', identity, services: { title: 'Food & drinks' }, place })
  assert.equal(readKitchenVisibility({ identity, visibility: false }), true)
  assert.equal(
    normalizeKitchen(
      'p',
      { slug: 'venue', status: 'active', visibility: true },
      place
    ),
    null
  )
  assert.equal(normalizeKitchen('p', { identity }, { id: 'wrong' }), null)
})
test('Kitchen editor accepts only supported dot paths and preserves sibling Identity properties', () => {
  const { parseKitchenUpdate } = load(
    'kitchen/server/identity/update-input.ts',
    'parseKitchenUpdate',
    {
      createError: (v) => new Error(v.statusMessage),
      validatePublicSlug: (v) => ({
        isValid: typeof v === 'string' && !!v,
        slug: v,
      }),
    }
  )
  assert.deepEqual(parseKitchenUpdate({ 'services.title': ' Pizza & drinks ' }), { 'services.title': 'Pizza & drinks' })
  assert.deepEqual(parseKitchenUpdate({ 'services.title': '' }), { 'services.title': 'Food & drinks' })
  assert.throws(() => parseKitchenUpdate({ 'services.title': 42 }))
  assert.throws(() => parseKitchenUpdate({ 'services.title': 'a'.repeat(121) }))
  assert.deepEqual(parseKitchenUpdate({ 'identity.visibility': false }), {
    'identity.visibility': false,
  })
  assert.deepEqual(
    parseKitchenUpdate({ 'identity.slug': 'new', 'tables.count': 12 }),
    { 'identity.slug': 'new', 'tables.count': 12 }
  )
  for (const patch of [
    { currency: 'CHF' },
    { visibility: true },
    { identity: { visibility: true } },
    { 'identity.source': 'place' },
    { name: 'Venue' },
  ]) {
    assert.throws(() => parseKitchenUpdate(patch), /unsupported field/)
  }
})
test('joined presentation retains canonical Identity and reads currency only from Place', () => {
  const { meaningfulSurfaceDelta, placeBaselineKeys, resolveKitchenPath } =
    load(
      'kitchen/utils/kitchen-interface-projection.ts',
      'meaningfulSurfaceDelta,placeBaselineKeys,resolveKitchenPath',
      { safeString: (v) => String(v || '') }
    )
  const { readPlaceCurrencyCode, readMediaBackdropColor } = load(
    '../../../fireux-places/src/runtime/place/utils/place-spine.ts',
    'readPlaceCurrencyCode,readMediaBackdropColor',
    { normalizeHexColor: (v) => (/^#[0-9a-f]{6}$/i.test(String(v)) ? v : '') }
  )
  const { useKitchenInterface } = load(
    'kitchen/composables/useKitchenInterface.ts',
    'useKitchenInterface',
    {
      safeString: (v) => String(v || ''),
      meaningfulSurfaceDelta,
      placeBaselineKeys,
      resolveKitchenPath,
      readPlaceCurrencyCode,
      readMediaBackdropColor,
      readKitchenVisibility,
      toShortAddress: (v) => v,
    }
  )
  const identity = {
    source: 'user',
    slug: 'kitchen-url',
    status: 'active',
    visibility: false,
  }
  const view = useKitchenInterface().surface({
    kitchen: { id: 'p', identity, currency: 'CHF', services: {
      title: 'Food & drinks', item_images: true, private_legacy_field: 'excluded',
    } },
    place: {
      name: 'Shared venue',
      slug: 'place-url',
      default_currency_code: 'GBP',
    },
  })
  assert.deepEqual(view.identity, identity)
  assert.equal(view.presentation.display_name, 'Shared venue')
  assert.equal(view.slug, 'kitchen-url')
  assert.equal(view.visibility, false)
  assert.equal(view.currency_code, 'GBP')
  assert.equal('currency' in view, false)
  assert.deepEqual(view.services, { title: 'Food & drinks', item_images: true })
  const oldServices = useKitchenInterface().surface({
    kitchen: { id: 'p', identity, services: [{ type: 'delivery' }] },
  })
  assert.equal(oldServices.services, undefined)
  const noCurrency = useKitchenInterface().surface({
    kitchen: { id: 'p', identity, currency: 'CHF' },
    place: { name: 'Shared venue' },
  })
  assert.equal(noCurrency.currency_code, undefined)
})

test('guest creation persists nested Kitchen Identity and shared facts only on Place', async () => {
  const writes = []
  const tx = {
    read: async () => ({ exists: false }),
    readAll: async () => [],
    create: (...args) => writes.push(args),
  }
  const { startGuestKitchen } = load(
    'kitchen/server/index/onboarding/guest.ts',
    'startGuestKitchen',
    {
      readKitchenOnboardingRequest: (v) => v,
      hashGuestKitchenSecret: () => 'hash',
      requireFirebaseBearerUser: async () => ({
        uid: 'guest',
        decoded: { firebase: { sign_in_provider: 'anonymous' } },
      }),
      resolveWorkspaceEntityOnboardingPolicy: () => ({
        canCreate: true,
        appId: 'app',
      }),
      requireFirestoreDocumentId: (v) => v,
      guestKitchenClaimTarget: () => 'claims',
      serverKitchenTeamMembersTarget: () => 'team',
      serverKitchenMenusTarget: () => 'menus',
      runGuardedServerTransaction: async (_, run) => run(tx),
      KITCHEN_MUTATION_TARGETS: { kitchens: 'kitchens' },
PLACE_MUTATION_TARGETS: { places: 'places' },
      serverAuditStamp: () => ({ by: 'guest', app_id: 'app' }),
      buildKitchenTeamMemberRecord: (v) => v,
      createKitchenSystemMenus() {},
      createDefaultKitchenStation() {},
      fail: (_, message) => {
        throw new Error(message)
      },
    }
  )
  assert.deepEqual(await startGuestKitchen({}, { claim_secret: 'secret' }), {
    kitchen_id: 'guest',
  })
  const kitchen = writes.find(([owner]) => owner === 'kitchens')[2]
  const place = writes.find(([owner]) => owner === 'places')[2]
  assert.deepEqual(kitchen.identity, {
    source: 'user',
    slug: 'guest',
    status: 'active',
    visibility: false,
  })
  assert.ok(place.name)
  for (const field of [
    'name',
    'currency',
    'slug',
    'status',
    'visibility',
    'identity_source',
  ])
    assert.equal(field in kitchen, false)
  assert.ok(normalizeKitchen('guest', kitchen, { ...place, id: 'guest' }))
})

test('Kitchen presentation reads shared Place currency, with no Kitchen fallback', () => {
  const { readPlaceCurrencyCode, readPlacePresentation } = load(
    '../../../fireux-places/src/runtime/place/utils/place-spine.ts',
    'readPlaceCurrencyCode,readPlacePresentation',
    { normalizeHexColor: () => '' }
  )
  const { readKitchenPresentation } = load(
    'kitchen/utils/kitchen-presentation.ts',
    'readKitchenPresentation',
    {
      readPlaceCurrencyCode,
      readPlacePresentation,
      readKitchenThemePalette: () => null,
    }
  )
  assert.equal(
    readKitchenPresentation(
      { currency: 'CHF' },
      { name: 'Venue', default_currency_code: 'GBP' }
    ).currencyCode,
    'GBP'
  )
  assert.equal(
    readKitchenPresentation({ currency: 'CHF' }, { name: 'Venue' }).currencyCode,
    ''
  )
})
