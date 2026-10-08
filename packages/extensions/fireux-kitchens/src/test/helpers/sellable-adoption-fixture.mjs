/** Local/test transport only. Real commerce functions with explicit in-memory IO.
 * No Firebase initialization, accounts, network clients or production writes.
 */
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { createHash, randomUUID } from 'node:crypto'

function load(path, names, dependencies = {}) {
  const source = readFileSync(
    new URL(`../../runtime/${path}.ts`, import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export type (?:\*[^\n]*|\{[\s\S]*?\} from [^\n]*)\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)};return {${names}}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const createError = (options) =>
  Object.assign(new Error(options.statusMessage), options)
const segment = (value) => {
  if (
    typeof value !== 'string' ||
    !value ||
    value.includes('/') ||
    ['.', '..'].includes(value)
  )
    throw createError({ statusCode: 400, statusMessage: 'Invalid fixture id' })
  return value
}
const normalizeSlug = (value) =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
const normalizers = load(
  'menu/utils/menu-item',
  'normalizeMenuItemPriceOptions,normalizeMenuItemAddOns'
)
const utils = load(
  'kitchen/utils/sellable',
  'readKitchenSellable,projectSellable,sellableFulfilment'
)
const patch = load('menu/utils/menu-item-patch', 'normalizeMenuItemPatch', {
  ...normalizers,
  normalizeSlug,
})
const legacy = load(
  'kitchen/server/sellables/legacy',
  'legacyPlacementSellable',
  { ...utils, ...patch }
)
const money = load(
  '../../../fireux-finance/src/runtime/utils/money',
  'addFinancialMoney,financialMoneyFromDecimal,multiplyFinancialMoney,financialCurrencyMinorUnitDigits,requireFinancialMoney'
)
const pricing = load(
  'kitchen/server/orders/pricing',
  'createKitchenOrderPricing,requireKitchenOrderPricing',
  money
)
const lifecycle = load(
  'kitchen/models/order-lifecycle.model',
  'isKitchenOrderStatus,kitchenOrderTransitionRule,isKitchenOrderType,isKitchenOrderChannel,deriveKitchenOrderBoardStage'
)
const transition = load(
  'kitchen/server/orders/transition',
  'buildKitchenOrderTransitionPatch',
  { ...lifecycle, createError, Timestamp: { fromMillis: (value) => value } }
)
const saleHelpers = load(
  'kitchen/utils/sale',
  'KitchenSaleSchemaVersion,kitchenSalePath'
)
const facts = load(
  '../../../fireux-finance/src/runtime/server/finance/financial-fact',
  'buildFinancialFact,financialFactPath',
  { createHash, ...money, FinancialFactSchemaVersion: 1 }
)
const sales = load(
  'kitchen/server/orders/sale',
  'buildCompletedKitchenOrderSale',
  { ...money, ...pricing, ...lifecycle, ...saleHelpers, ...facts }
)
const assemble = load(
  'menu/server/ordering/order-record',
  'assembleMenuOrderRecord',
  {
    ...pricing,
    menuOrderTypeStrategy: () => ({ recordsRequestedFor: false }),
    numberValue: (value) => Number(value) || 0,
    normalizeKitchenOrderWhatsAppPhone: () => '',
  }
)
const dishReaders = {
  normalizeDishDealFlag: (value) => value === true,
  readDishItemKind: (value) =>
    ['food', 'drink'].includes(value) ? value : undefined,
}
const manifest = load(
  'menu/server/manifest/sections',
  'readKitchenMenuSections',
  {
    ...normalizers,
    ...utils,
    ...dishReaders,
    readRecord: (value) => value,
    readRecordString: (value, key) => String(value?.[key] || ''),
  }
)
const payload = load(
  'menu/server/payload/sections',
  'readMenuManifestSections',
  dishReaders
)
const lineHelpers = load(
  'menu/server/ordering/lines',
  'resolveMenuOrderVariant,resolveMenuOrderAddOns',
  { createError }
)
const ordering = load(
  'menu/server/ordering/order-items',
  'resolveMenuOrderItems',
  {
    ...lineHelpers,
    ...utils,
    ...manifest,
    createError,
    text: (value) => String(value ?? '').trim(),
    numberValue: (value) => Number(value) || 0,
    // Service eligibility is a controlled fixture input; schedule/configuration is
    // covered separately by the service tests, not claimed by this harness.
    readKitchenMenuOrdering: () => ({
      order_types: [{ kitchen_offering_id: 'pickup', type: 'collection' }],
    }),
    isMenuOrderingEnabled: () => true,
  }
)

export function createSellableAdoptionFixture({
  pizzaPrice = 18,
  pizzaAddOns = [],
} = {}) {
  const records = new Map([
    ['kitchens/fixture/menus/menu', { status: 'published' }],
    [
      'kitchens/fixture/menus/menu/sections/section',
      { label: 'Controlled pickup specimens' },
    ],
    [
      'kitchens/fixture/dishes/pizza',
      { name: 'Margherita', item_kind: 'food' },
    ],
    ['kitchens/fixture/dishes/coke', { name: 'Coke', item_kind: 'drink' }],
    [
      'kitchens/fixture/menus/menu/sections/section/items/pizza',
      {
        dish_id: 'pizza',
        price: pizzaPrice,
        price_options: [],
        add_ons: pizzaAddOns,
      },
    ],
    [
      'kitchens/fixture/menus/menu/sections/section/items/coke',
      {
        dish_id: 'coke',
        price: 4,
        price_options: [
          {
            label: '300ml · glass · fountain',
            quantity: 1,
            unit: '',
            price: 4,
          },
          {
            label: '500ml · glass · fountain',
            quantity: 1,
            unit: '',
            price: 5,
          },
          { label: '500ml · bottle', quantity: 1, unit: '', price: 5.5 },
          { label: '330ml · can', quantity: 1, unit: '', price: 4.5 },
        ],
        add_ons: [],
      },
    ],
  ])
  const snapshot = (path) => ({
    exists: records.has(path),
    data: () => structuredClone(records.get(path)),
  })
  const db = {
    doc: (path) => ({ get: async () => snapshot(path) }),
    collection: (path) => ({
      get: async () => ({
        docs: [...records.keys()]
          .filter(
            (key) =>
              key.startsWith(path + '/') &&
              key.split('/').length === path.split('/').length + 1
          )
          .map((key) => ({ id: key.split('/').at(-1), ...snapshot(key) })),
      }),
    }),
  }
  const targets = {
    serverKitchenSellablesTarget: (k) => `kitchens/${k}/sellables`,
    serverKitchenMenusTarget: (k) => `kitchens/${k}/menus`,
    serverKitchenMenuSectionsTarget: (k, m) =>
      `kitchens/${k}/menus/${m}/sections`,
    serverKitchenMenuItemsTarget: (k, m, s) =>
      `kitchens/${k}/menus/${m}/sections/${s}/items`,
    serverKitchenDishesTarget: (k) => `kitchens/${k}/dishes`,
  }
  const commands = load(
    'kitchen/server/sellables/commands',
    'bindKitchenMenuSellable,updateKitchenSellableTerms',
    {
      ...utils,
      ...legacy,
      ...targets,
      randomUUID,
      createError,
      requireFirestoreDocumentId: segment,
      serverAuditStamp: () => ({
        at: 'fixture',
        by: 'fixture-operator',
        app_id: 'fixture-app',
      }),
      readKitchenMutationActor: async () => ({
        uid: 'fixture-operator',
        runtimeAppId: 'fixture-app',
      }),
      requireKitchenMutationAuthority: async (_tx, _actor, k) => {
        if (k !== 'fixture')
          throw createError({
            statusCode: 403,
            statusMessage: 'Fixture scope only',
          })
        return { rootData: {}, placeData: { default_currency_code: 'CHF' } }
      },
      readPlaceCurrencyCode: (value) => value.default_currency_code,
      runGuardedServerTransaction: async (_placement, work) => {
        const pending = []
        const result = await work({
          read: async (target, id) => ({
            exists: records.has(`${target}/${id}`),
            data: structuredClone(records.get(`${target}/${id}`)),
          }),
          create: (target, id, value) => {
            if (records.has(`${target}/${id}`)) throw Error('Conflict')
            pending.push([`${target}/${id}`, structuredClone(value)])
          },
          update: (target, id, value) =>
            pending.push([
              `${target}/${id}`,
              { ...records.get(`${target}/${id}`), ...structuredClone(value) },
            ]),
        })
        for (const [key, value] of pending) records.set(key, value)
        return result
      },
    }
  )
  const orders = new Map(),
    completed = new Map()
  return {
    orders() {
      return { orders: structuredClone([...orders.values()]) }
    },
    legacyOptions(itemId) {
      return structuredClone(
        records.get(
          `kitchens/fixture/menus/menu/sections/section/items/${segment(itemId)}`
        ).price_options
      )
    },
    async adopt(body) {
      return commands.bindKitchenMenuSellable({}, body)
    },
    async update(body) {
      return commands.updateKitchenSellableTerms({}, body)
    },
    read(id) {
      segment(id)
      return {
        id,
        ...utils.readKitchenSellable(
          records.get(`kitchens/fixture/sellables/${id}`)
        ),
      }
    },
    async menu() {
      return payload.readMenuManifestSections(
        await manifest.readKitchenMenuSections(db, {
          appId: 'fixture-app',
          kitchenId: 'fixture',
          menuId: 'menu',
        })
      )
    },
    async order({ itemId, variant, quantity = 1, lines }) {
      const context = {
        appId: 'fixture-app',
        kitchenId: 'fixture',
        menuId: 'menu',
        currencyCode: 'CHF',
      }
      const resolved = await ordering.resolveMenuOrderItems(db, {
        context,
        kitchenOfferingId: 'pickup',
        orderType: 'collection',
        requestedItems: (lines || [{ itemId, variant, quantity }]).map(
          (line) => ({
            itemId: line.itemId,
            quantity: line.quantity,
            variant: line.variant || null,
            addOns: line.addOns || [],
          })
        ),
      })
      const id = randomUUID()
      const result = assemble.assembleMenuOrderRecord({
        command: {
          actorId: 'menu',
          orderType: 'collection',
          channel: 'menu',
          kitchenOfferingId: 'pickup',
          kitchenOfferingName: 'Controlled pickup',
        },
        context,
        currencyCode: 'CHF',
        fulfilment: {
          status: 'pending_acceptance',
          customer: {},
          deliveryFee: 0,
          total: resolved.subtotal,
          payment: { required: false, status: 'not_required', method: 'cash' },
        },
        identity: {
          id,
          number: String(orders.size + 1),
          capabilityHash: 'fixture',
          capabilityToken: 'fixture-only',
          timestamp: 'fixture',
          receiptCreatedAt: 'fixture',
        },
        items: resolved.items,
        subtotal: resolved.subtotal,
      })
      const order = { ...result.payload, id }
      orders.set(id, order)
      return structuredClone(order)
    },
    transition(id, action) {
      const order = orders.get(id)
      if (!order)
        throw createError({
          statusCode: 404,
          statusMessage: 'Fixture order missing',
        })
      const patch = transition.buildKitchenOrderTransitionPatch(order, action, {
        estimatedMinutes: 20,
        nowMs: 0,
      })
      if (action === 'complete')
        completed.set(
          id,
          sales.buildCompletedKitchenOrderSale({
            appId: 'fixture-app',
            kitchenId: 'fixture',
            orderId: id,
            order,
            actorId: 'fixture-operator',
            timestamp: 'fixture-completion',
          })
        )
      Object.assign(order, patch)
      return structuredClone({
        order,
        stage: lifecycle.deriveKitchenOrderBoardStage(order),
        completion: completed.get(id),
      })
    },
  }
}
