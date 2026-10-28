import assert from 'node:assert/strict'
import test from 'node:test'
import { harness } from './helpers/menu-publication.mjs'
import * as helpers from './offering-test-helpers.mjs'
import { dishPricingHelpers } from './helpers/dish-pricing.mjs'
import { readOpeningHoursStatus } from '../../../fireux-places/src/runtime/place/utils/opening-hours-status.ts'
const {
  loadOfferingSource: load,
  serviceMenuPolicy,
  operatingHoursPolicy,
  serviceHoursPolicy,
  weekdayHoursConstraints,
  interactionValidation,
  offeringContract,
  offeringTargets,
} = helpers
const createError = (input) =>
  Object.assign(new Error(input.statusMessage), input)
const target = (collectionPath) => ({ collectionPath })
const pathOf = (value) =>
  typeof value === 'string' ? value : value.collectionPath
const requireFirestoreDocumentId = (value) => {
  assert.equal(typeof value, 'string')
  assert.ok(value && !value.includes('/') && value === value.trim())
  return value
}
const readRecordString = (row, key) => String(row?.[key] ?? '')
const targets = {
  KITCHEN_MUTATION_TARGETS: { kitchens: target('kitchens') },
PLACE_MUTATION_TARGETS: { places: target('places') },
  serverAppUsersTarget: (app) => target(`apps/${app}/users`),
  serverKitchenAccessTarget: () => target('kitchen_access'),
  serverKitchenDishesTarget: (k) => target(`kitchens/${k}/dishes`),
  serverKitchenMenusTarget: (k) => target(`kitchens/${k}/menus`),
  serverKitchenMenuSectionsTarget: (k, m) =>
    target(`kitchens/${k}/menus/${m}/sections`),
  serverKitchenMenuItemsTarget: (k, m, s) =>
    target(`kitchens/${k}/menus/${m}/sections/${s}/items`),
  kitchenPromotionsTarget: (k) => target(`kitchens/${k}/promotions`),
  ...offeringTargets,
}
const promotions = load(
  'kitchen/utils/promotions/pricing',
  'normalizeKitchenPromotion,promotionDishIds,promotionsOverlap,promotionPricedSections,promotionPricedItem,promotionDay,promotionDays'
)
const table = load(
  'kitchen/utils/table-service',
  'tableServiceChannel,tableChannelEnabled,configureTableChannel'
)
const options = load(
  'kitchen/utils/offering-options',
  'kitchenOfferingOptions',
  table
)
const core = load('utils/weekday-time-core', 'weekdayTimeCore')
const time = load('utils/weekday-time-config', 'weekdayTimeConfig', core)
const whatsApp = load(
  'kitchen/utils/ordering-whatsapp',
  'readKitchenOrderWhatsAppNotificationPolicy'
)
const types = [
  'collection',
  'delivery',
  'pre_order',
  'dine_in',
  'eat_in',
  'takeaway',
  'room_service',
]
const policy = load(
  'kitchen/utils/ordering-policy',
  'readKitchenOrderTypeConfig',
  {
    ...whatsApp,
    KitchenOrderContactFields: ['name', 'phone', 'email'],
    KitchenOrderTypes: types,
  }
)
const normalization = load(
  'kitchen/utils/offering-policy',
  'normalizeKitchenOfferings',
  {
    ...operatingHoursPolicy,
    ...policy,
  }
)
const { constrainMenuOfferings } = load(
  'menu/utils/menu-hours',
  'constrainMenuOfferings',
  {
    ...normalization,
    ...weekdayHoursConstraints,
    readWeekdayTimeWindowsConfig: time.weekdayTimeConfig.readWindowsConfig,
  }
)
const ordering = load(
  'menu/utils/menu-ordering',
  'kitchenMenuOrdering,publicMenuOrderTypes',
  {
    ...normalization,
    ...table,
  }
)
const publicOfferings = load(
  'kitchen/utils/public-offerings',
  'readKitchenPublicOfferings',
  normalization
)
const contextConstants = load(
  'menu/models/menu-context.model',
  'MenuRouteContexts'
)
const contexts = load(
  'menu/utils/menu-context',
  'guestDiscoverableMenuContexts',
  contextConstants
)
const sourceTypes = load(
  'menu/server/payload/types',
  'compactMenuPayloadRecord'
)
const source = load(
  'menu/server/payload/source',
  'menuSourceFromData',
  sourceTypes
)
const { projectMenuDirectoryEntry } = load(
  'menu/server/index/projection',
  'projectMenuDirectoryEntry',
  {
    constrainMenuOfferings,
    readRecordString,
    ...contexts,
    ...publicOfferings,
    ...source,
    ...ordering,
    readKitchenMenuOrdering: ordering.kitchenMenuOrdering,
  }
)
const { menuServiceOfferings } = load(
  'menu/utils/service-menu',
  'menuServiceOfferings'
)
const { serviceSections } = load(
  'menu/utils/service-sections',
  'serviceSections',
  {
    readOpeningHoursStatus,
    ...promotions,
  }
)

test('one fixture carries Item terms through Menu publication, Promotions and public Service projection', async () => {
  const fixture = harness()
  const { records } = fixture
  // Keep the existing command harness's real membership/access records, but build new content.
  for (const path of [...records.keys()])
    if (
      path.startsWith('kitchens/k/dishes/') ||
      path.startsWith('kitchens/k/menus/m/sections/')
    )
      records.delete(path)
  records.set('places/k', {
    name: 'Fixture venue',
    timezone: 'Europe/Zurich',
    default_currency_code: 'CHF',
  })
  records.set('kitchens/k/menus/m', {
    name: 'Main',
    slug: 'main',
    format: 'interactive',
    status: 'draft',
    sort_order: 0,
  })
  const kitchenHours = {
    source: 'custom',
    timezone: 'Europe/Zurich',
    windows: [{ days: ['sunday'], open: '12:00', close: '22:00' }],
  }
  const accesses = []
  const writes = []
  const observe = (path) => {
    assert.doesNotMatch(
      path,
      /(^|\/)[^/]*order[^/]*(?:\/|$)/i,
      `Unexpected Order access: ${path}`
    )
    accesses.push(path)
  }
  const rows = (collectionPath) => {
    observe(collectionPath)
    return [...records]
      .filter(
        ([path]) =>
          path.startsWith(`${collectionPath}/`) &&
          !path.slice(collectionPath.length + 1).includes('/')
      )
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([path, data]) => ({
        id: path.split('/').at(-1),
        data: structuredClone(data),
      }))
  }
  // This bounded adapter shares the publication harness's sole record Map.
  // It stages each command atomically and rejects reads after the first staged write.
  const runGuardedServerTransaction = async (_database, work) => {
    const staged = []
    const read = async (target, id) => {
      assert.equal(staged.length, 0, 'all command reads must precede writes')
      const path = `${pathOf(target)}/${id}`
      observe(path)
      return {
        id,
        exists: records.has(path),
        data: structuredClone(records.get(path)),
      }
    }
    const readAll = async (target, limit, after) => {
      assert.equal(staged.length, 0)
      return rows(pathOf(target))
        .filter((row) => !after || row.id > after)
        .slice(0, limit)
    }
    const result = await work({
      read,
      readAll,
      readMany: (target, ids) => Promise.all(ids.map((id) => read(target, id))),
      query: async (target, query) =>
        (await readAll(target, Number.MAX_SAFE_INTEGER))
          .filter((row) => row.data[query.field] === query.value)
          .slice(0, query.limit),
      create: (target, id, data) =>
        staged.push({ create: true, path: `${pathOf(target)}/${id}`, data }),
      update: (target, id, data) =>
        staged.push({ create: false, path: `${pathOf(target)}/${id}`, data }),
    })
    for (const write of staged) {
      observe(write.path)
      assert.equal(records.has(write.path), !write.create)
    }
    for (const write of staged) {
      const next = {
        ...records.get(write.path),
        ...structuredClone(write.data),
      }
      for (const key of Object.keys(next))
        if (next[key]?.fixtureDelete === true) delete next[key]
      records.set(write.path, next)
      writes.push(write.path)
    }
    return result
  }
  const db = {
    collection: (collectionPath) => {
      const query = (field, value) => ({
        get: async () => ({
          docs: rows(collectionPath)
            .filter((row) => !field || row.data[field] === value)
            .map((row) => ({ id: row.id, data: () => row.data })),
        }),
      })
      return {
        ...query(),
        where: (field, op, value) => {
          assert.equal(op, '==')
          return query(field, value)
        },
        doc: (id) => ({
          get: async () => {
            const path = `${collectionPath}/${id}`
            observe(path)
            return {
              id,
              exists: records.has(path),
              data: () => structuredClone(records.get(path)),
            }
          },
        }),
      }
    },
  }
  const membership = load(
    '../../../../core/fireux-core/src/runtime/app/utils/membership-access',
    'readMembershipAccessIds'
  )
  const access = load('kitchen/utils/kitchen-access', 'readKitchenAccessIds', {
    ...membership,
    KITCHEN_USER_LIMIT: 50,
  })
  const authority = load(
    'kitchen/server/core/mutation-authority',
    'requireKitchenRecordMutationAuthority,requireKitchenMutationAuthority',
    {
      ...targets,
      ...access,
      createError,
      isAppUserSubscription: (value) =>
        ['free', 'premium', 'business'].includes(value),
    }
  )
  let sequence = 0
  const deps = {
    ...targets,
    ...authority,
    ...dishPricingHelpers,
    ...promotions,
    ...table,
    ...options,
    ...serviceMenuPolicy,
    ...serviceHoursPolicy,
    ...offeringContract,
    ...operatingHoursPolicy,
    createError,
    requireFirestoreDocumentId,
    runGuardedServerTransaction,
    readRecordString,
    readRecord: (value) => value,
    readDishItemKind: (value) => (value === 'drink' ? 'drink' : 'food'),
    randomUUID: () => `fixture-${++sequence}`,
    normalizeSlug: (value) =>
      value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-'),
    readKitchenMutationActor: async () => ({
      uid: 'operator',
      runtimeAppId: 'app',
    }),
    serverAuditStamp: () => ({ by: 'operator', app_id: 'app', at: 'fixture' }),
    readPlaceCurrencyCode: (place) => place.default_currency_code,
    resolveKitchenOperationHours: () => kitchenHours,
    getRuntimeFirestore: () => db,
    FieldValue: { delete: () => ({ fixtureDelete: true }) },
  }
  Object.assign(
    deps,
    load('kitchen/server/dishes/record-input', 'dishFields,dishText', deps)
  )
  Object.assign(
    deps,
    load('menu/server/display-order', 'nextMenuDisplayOrder', deps)
  )
  const { createDish } = load(
    'kitchen/server/dishes/create',
    'createDish',
    deps
  )
  const { createKitchenMenuSection } = load(
    'menu/server/sections/commands',
    'createKitchenMenuSection',
    deps
  )
  const { createKitchenMenuItem } = load(
    'menu/server/items/write',
    'createKitchenMenuItem',
    deps
  )
  const { saveKitchenPromotion } = load(
    'kitchen/server/promotions/write',
    'saveKitchenPromotion',
    deps
  )
  Object.assign(
    deps,
    load(
      'kitchen/server/offerings/validation',
      'readOfferingUpdate,requireConfiguredOffering,requireServiceMenus,fail',
      { ...deps, ...core }
    )
  )
  Object.assign(
    deps,
    load(
      'kitchen/server/offerings/interaction-validation',
      'readInteractionChanges',
      {
        createError,
        requireFirestoreDocumentId,
        ...interactionValidation,
        KitchenOrderTypes: types,
      }
    )
  )
  Object.assign(
    deps,
    load(
      'kitchen/utils/offering-interaction',
      'patchKitchenOfferingInteraction'
    )
  )
  Object.assign(
    deps,
    load(
      'kitchen/server/offerings/read',
      'readKitchenOfferings,readKitchenOfferingsInTransaction',
      deps
    )
  )
  const { configureKitchenOffering } = load(
    'kitchen/server/offerings/configure',
    'configureKitchenOffering',
    deps
  )
  const { readKitchenMenuSections } = load(
    'menu/server/manifest/sections',
    'readKitchenMenuSections',
    deps
  )
  const { readMenuManifestSections } = load(
    'menu/server/payload/sections',
    'readMenuManifestSections',
    deps
  )
  const { readMenuPromotions } = load(
    'kitchen/server/promotions/read',
    'readMenuPromotions',
    deps
  )
  const { normalizeMenuMetadataPatch } = load(
    'menu/utils/menu-metadata',
    'normalizeMenuMetadataPatch',
    deps
  )
  const { updateKitchenMenu } = load(
    'menu/server/records/update',
    'updateKitchenMenu',
    { ...deps, normalizeMenuMetadataPatch }
  )

  const dish = await createDish(
    {},
    {
      kitchenId: 'k',
      draft: {
        name: 'Fixture pizza',
        price: 13,
        item_kind: 'food',
        price_options: [
          { label: 'Regular', quantity: 1, unit: 'portion', price: 13 },
          { label: 'Large', quantity: 2, unit: 'portion', price: 17 },
        ],
        add_ons: [{ id: 'cheese', label: 'Cheese', price: 2 }],
      },
    }
  )
  const drink = await createDish(
    {},
    {
      kitchenId: 'k',
      draft: {
        name: 'Fixture drink',
        price: 4,
        item_kind: 'drink',
        bottle_deposit: 2,
      },
    }
  )
  const originals = new Map(
    [dish.id, drink.id].map((id) => [
      id,
      structuredClone(records.get(`kitchens/k/dishes/${id}`)),
    ])
  )
  const section = await createKitchenMenuSection(
    {},
    { kitchenId: 'k', menuId: 'm', label: 'Food & drink' }
  )
  for (const id of [dish.id, drink.id])
    await createKitchenMenuItem(
      {},
      { kitchenId: 'k', menuId: 'm', sectionId: section.id, dishId: id }
    )
  await updateKitchenMenu(
    {},
    {
      kitchenId: 'k',
      menuId: 'm',
      changes: {
        serving_hours: {
          ...kitchenHours,
          windows: [{ days: ['sunday'], open: '14:00', close: '20:00' }],
        },
      },
    }
  )
  await fixture.publish()
  assert.equal(records.get('kitchens/k/menus/m').status, 'published')
  const offer = await saveKitchenPromotion(
    {},
    {
      kitchenId: 'k',
      promotion: {
        name: 'Sunday pizza',
        status: 'active',
        currency: 'CHF',
        days: ['sunday'],
        dishes: [{ dishId: dish.id, price: 11 }],
      },
    }
  )
  const bundle = await saveKitchenPromotion(
    {},
    {
      kitchenId: 'k',
      promotion: {
        name: 'Pizza and drink',
        status: 'active',
        currency: 'CHF',
        days: ['sunday'],
        price: 15,
        groups: [
          {
            id: 'pizza',
            name: 'Pizza',
            choose: 1,
            dishes: [{ dishId: dish.id, supplement: 0 }],
          },
          {
            id: 'drink',
            name: 'Drink',
            choose: 1,
            dishes: [{ dishId: drink.id, supplement: 1 }],
          },
        ],
      },
    }
  )
  await createKitchenMenuItem(
    {},
    {
      kitchenId: 'k',
      menuId: 'm',
      sectionId: section.id,
      promotionId: bundle.id,
    }
  )
  await fixture.publish()

  const services = []
  for (const type of ['collection', 'delivery'])
    services.push(
      await configureKitchenOffering(
        {},
        {
          kitchenId: 'k',
          option: type,
          enabled: true,
          menu_ids: ['m'],
          ...(type === 'collection'
            ? { hours_source: 'kitchen' }
            : {
                hours_source: 'custom',
                hours: {
                  ...kitchenHours,
                  windows: [
                    { days: ['sunday'], open: '13:00', close: '21:00' },
                  ],
                },
              }),
          interactions: [
            { type, changes: { customer: { required_fields: ['name'] } } },
          ],
        }
      )
    )
  const publicView = async (type, now = new Date('2026-10-18T12:00:00Z')) => {
    const menus = records.get('kitchens/k/menus/m')
    const offerings = await deps.readKitchenOfferings(db, 'k', {
      kitchen: records.get('kitchens/k'),
      place: records.get('places/k'),
    })
    const entry = projectMenuDirectoryEntry(
      { id: 'm', data: menus },
      { appId: 'app', kitchenId: 'k', kitchenSlug: 'fixture' },
      { kitchenName: 'Fixture venue', kitchenOfferings: offerings }
    )
    if (!entry) return { entry: null, sections: [] }
    const eligible = menuServiceOfferings(entry, type)
    const sections = readMenuManifestSections(
      await readKitchenMenuSections(db, {
        appId: 'app',
        kitchenId: 'k',
        menuId: 'm',
        currencyCode: 'CHF',
      })
    )
    for (const row of sections)
      for (const item of row.items)
        if (item.mealDeal) item.mealDeal.timezone = 'Europe/Zurich'
    const discounts = await readMenuPromotions(
      'k',
      sections
        .flatMap((row) => row.items.map((item) => item.dishId))
        .filter(Boolean),
      'Europe/Zurich',
      'CHF'
    )
    return {
      entry,
      sections: serviceSections(
        [
          {
            manifest: {
              content: {
                id: 'm',
                name: menus.name,
                sections,
                promotions: discounts,
              },
              source: {
                appId: 'app',
                kitchenId: 'k',
                kitchenSlug: 'fixture',
                menuId: 'm',
                menuSlug: menus.slug,
              },
              presentation: {
                currencyCode: 'CHF',
                currencyFormat: 'code',
                showCurrency: true,
              },
            },
            offerings: eligible,
          },
        ],
        now
      ),
    }
  }
  for (const type of ['collection', 'delivery']) {
    const view = await publicView(type)
    const items = view.sections.flatMap((row) =>
      row.items.map((row) => row.item)
    )
    const pizza = items.find((row) => row.dishId === dish.id)
    assert.equal(pizza.price, 11)
    assert.deepEqual(
      pizza.priceOptions.map((option) => option.price),
      [11, 11]
    )
    assert.equal(pizza.addOns[0].price, 2)
    assert.equal(items.find((row) => row.dishId === drink.id).bottleDeposit, 2)
    const deal = items.find((row) => row.mealDeal)
    assert.equal(deal.price, 15)
    assert.equal(deal.mealDeal.groups[1].dishes[0].supplement, 1)
    const eligible = menuServiceOfferings(view.entry, type)
    assert.equal(eligible.length, 1)
    assert.deepEqual(eligible[0].hours.windows, [
      { days: ['sunday'], open: '14:00', close: '20:00' },
    ])
  }
  const persistedOffer = records.get(`kitchens/k/promotions/${offer.id}`)
  await saveKitchenPromotion(
    {},
    {
      kitchenId: 'k',
      promotionId: offer.id,
      promotion: {
        name: persistedOffer.name,
        status: 'paused',
        currency: persistedOffer.currency,
        days: persistedOffer.days,
        dishes: persistedOffer.dishes,
      },
    }
  )
  assert.equal(
    (await publicView('collection')).sections
      .flatMap((row) => row.items)
      .find((row) => row.item.dishId === dish.id).item.price,
    13
  )

  await updateKitchenMenu(
    {},
    { kitchenId: 'k', menuId: 'm', changes: { audience: 'private_link' } }
  )
  assert.equal((await publicView('collection')).entry, null)
  assert.equal(
    serviceMenuPolicy.serviceMenuReadiness(
      ['m'],
      [{ id: 'm', ...records.get('kitchens/k/menus/m') }]
    ).validSelection,
    false
  )
  await configureKitchenOffering(
    {},
    {
      kitchenId: 'k',
      offeringId: services[0].offering.id,
      option: 'collection',
      enabled: true,
      menu_ids: [],
      interactions: [{ type: 'collection', changes: {} }],
    }
  )
  assert.deepEqual(
    records.get(`kitchens/k/offerings/${services[0].offering.id}`).menu_ids,
    []
  )
  assert.equal(
    records.get(`kitchens/k/offerings/${services[0].offering.id}`).hours_source,
    'kitchen'
  )
  assert.deepEqual(
    records
      .get(`kitchens/k/offerings/${services[0].offering.id}`)
      .interactions.find((row) => row.type === 'collection').customer,
    { required_fields: ['name'] }
  )
  assert.deepEqual(
    records.get(`kitchens/k/offerings/${services[1].offering.id}`).menu_ids,
    ['m']
  )
  await updateKitchenMenu(
    {},
    { kitchenId: 'k', menuId: 'm', changes: { audience: 'public' } }
  )
  assert.equal(
    menuServiceOfferings((await publicView('delivery')).entry, 'delivery')
      .length,
    1
  )
  await fixture.unpublish()
  assert.equal((await publicView('delivery')).entry, null)
  await fixture.publish()
  await fixture.archive()
  assert.equal((await publicView('delivery')).entry, null)

  for (const [id, original] of originals)
    assert.deepEqual(records.get(`kitchens/k/dishes/${id}`), original)
  for (const row of rows(`kitchens/k/menus/m/sections/${section.id}/items`)) {
    assert.equal(
      Boolean(row.data.dish_id) !== Boolean(row.data.promotion_id),
      true
    )
    for (const field of ['price', 'price_options', 'add_ons', 'image'])
      assert.equal(Object.hasOwn(row.data, field), false)
  }
  assert.ok(writes.some((path) => path.includes('/promotions/')))
  assert.ok(writes.some((path) => path.includes('/offerings/')))
  assert.ok(
    [...accesses, ...fixture.state.reads].every(
      (path) => !/(^|\/)[^/]*order[^/]*(?:\/|$)/i.test(path)
    )
  )
})
