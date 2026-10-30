import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import {
  createHash,
  timingSafeEqual,
  randomUUID,
  randomBytes,
} from 'node:crypto'
import Stripe from 'stripe'

function load(path, deps, names) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replaceAll('import.meta.dev', 'true')
    .replace(/^export default /m, 'const handler = ')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)};return {${names}}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
const createError = (data) => Object.assign(new Error(data.statusMessage), data)
const contract = load(
  '../server/menu-express/contract.ts',
  { createHash, timingSafeEqual, createError },
  'fail,intake,requestId,text,requirePaid,requireReview,dto'
)
const id = '11111111-1111-4111-8111-111111111111',
  token = 'a'.repeat(64)
const time = (millis) => ({
  toMillis: () => millis,
  toDate: () => new Date(millis),
})
const Timestamp = { now: () => time(Date.now()), fromMillis: time }
const target = { collectionPath: 'apps/misebox-app/menu_express_requests' }
const appTarget = (collection) => (appId) => ({
  collectionPath: `apps/${appId}/${collection}`,
})
const messagesTarget = (appId, id) => ({
  collectionPath: `apps/${appId}/conversations/${id}/messages`,
})
const privateTarget = (appId, id) => ({
  collectionPath: `apps/${appId}/conversations/${id}/private`,
})
const chat = load(
  '../../../../packages/core/fireux-core/src/runtime/server/utils/chat/session.ts',
  {
    createHash,
    timingSafeEqual,
    randomUUID,
    randomBytes,
    Timestamp,
    FieldValue: { serverTimestamp: () => time(Date.now()) },
    createError,
    requireFirestoreDocumentId: (value) => value,
    ConversationAccessStorage: { document: 'session' },
    serverAppConversationsTarget: appTarget('conversations'),
    serverConversationMessagesTarget: messagesTarget,
    serverConversationPrivateTarget: privateTarget,
  },
  'stageChatSessionCreation,stageChatMessage,requireChatSessionAccess,assertChatSessionAccess,hashChatRecoveryToken'
)

function fixture() {
  const records = new Map(),
    fail = contract.fail
  let revision = 'review-a',
    published = 0
  const review = () => ({
    revision,
    name: 'TEST Demo Menu',
    description: 'Do not sell',
    currency: 'CHF',
    kitchenSlug: 'demo-kitchen',
    menuSlug: 'test-menu',
    sections: [
      {
        id: 'section',
        label: 'Snacks',
        items: [
          {
            id: 'item',
            name: 'TEST soup',
            description: 'Tomato',
            price: 8.5,
            options: [],
          },
        ],
      },
    ],
  })
  const key = (target, id) => `${target.collectionPath}/${id}`
  const transaction = async (_, work) => {
    const writes = [],
      tx = {
        read: async (target, id) => ({
          exists: records.has(key(target, id)),
          data: records.get(key(target, id)),
        }),
        create: (target, id, data) =>
          writes.push(() => {
            if (records.has(key(target, id))) throw Error('Duplicate')
            records.set(key(target, id), data)
          }),
        update: (target, id, data) =>
          writes.push(() => {
            const next = { ...records.get(key(target, id)) }
            for (const [field, value] of Object.entries(data)) {
              if (field.includes('.')) {
                const [parent, child] = field.split('.')
                next[parent] = { ...next[parent], [child]: value }
              } else next[field] = value
            }
            records.set(key(target, id), next)
          }),
      }
    const result = await work(tx)
    for (const write of writes) write()
    return result
  }
  const dependencies = {
    ...contract,
    ...chat,
    requireCustomer: (tx, appId, id, token, writable = false) =>
      chat.requireChatSessionAccess(tx, {
        appId,
        conversationId: id,
        token,
        writable,
      }),
    createHash,
    randomUUID,
    Timestamp,
    context: () => ({ appId: 'misebox-app', target }),
    operator: async (event) => {
      if (!event.admin) fail('Denied', 403)
      return { appId: 'misebox-app', target, uid: 'operator' }
    },
    assertOperator: async (_, __, uid) => {
      if (uid !== 'operator') fail('Denied', 403)
    },
    runGuardedServerTransaction: transaction,
    serverAppConversationsTarget: appTarget('conversations'),
    serverConversationMessagesTarget: messagesTarget,
    serverConversationPrivateTarget: privateTarget,
    requireChatStartBudget() {},
    readChatSession: async () => ({ messages: [] }),
    requireKitchenWriterAccount: async (input) => {
      if (input.kitchenId !== 'kitchen') fail('Foreign Kitchen', 403)
    },
    readKitchenMenuReview: async () => review(),
    stagePublishKitchenMenu: async () => {
      published++
    },
  }
  const requests = {
    ...contract,
    ...load('../server/menu-express/intake.ts', dependencies, 'createRequest'),
    ...load('../server/menu-express/read.ts', dependencies, 'readRequest'),
    ...load(
      '../server/menu-express/customer.ts',
      dependencies,
      'customerAction'
    ),
    ...load(
      '../server/menu-express/operator.ts',
      dependencies,
      'operatorAction'
    ),
  }
  const input = {
    id,
    token,
    name: 'Demo Buyer',
    email: 'demo@example.com',
    venue: 'TEST venue',
    location: 'Demo',
    sourceUrl: 'https://example.com/menu.pdf',
    instructions: 'Do not sell',
    demo: true,
  }
  return {
    ...requests,
    input,
    records,
    transaction,
    review,
    setRevision: (value) => {
      revision = value
    },
    published: () => published,
  }
}

test('whole demo delivery: intake retry, correction, approval, changed-content rejection, delivery and reload', async () => {
  const f = fixture(),
    admin = { admin: true }
  assert.equal((await f.createRequest(admin, f.input)).stage, 'received')
  await f.createRequest(admin, f.input)
  assert.equal(
    [...f.records.keys()].filter((k) => k.includes('menu_express_requests'))
      .length,
    1
  )
  assert.equal(
    [...f.records.keys()].filter((k) => /conversations\/[^/]+$/.test(k)).length,
    1
  )
  await assert.rejects(
    f.createRequest(admin, { ...f.input, venue: 'Changed' }),
    /different submission/
  )
  await assert.rejects(
    f.readRequest({}, id, { token: 'b'.repeat(64) }),
    /not found/
  )
  await assert.rejects(
    f.operatorAction({}, id, { action: 'demo-payment' }),
    /Denied/
  )
  await assert.rejects(
    f.operatorAction(admin, id, {
      action: 'prepare',
      kitchenId: 'kitchen',
      menuId: 'menu',
    }),
    /Payment/
  )
  await f.operatorAction(admin, id, { action: 'demo-payment' })
  await f.operatorAction(admin, id, {
    action: 'prepare',
    kitchenId: 'kitchen',
    menuId: 'menu',
  })
  await f.operatorAction(admin, id, { action: 'review' })
  await f.customerAction({}, id, {
    token,
    action: 'correction',
    revision: 'review-a',
    note: 'TEST fix soup description',
  })
  assert.equal(
    (await f.readRequest({}, id, { token })).request.stage,
    'preparing'
  )
  f.setRevision('review-b')
  await f.operatorAction(admin, id, { action: 'review' })
  await assert.rejects(
    f.customerAction({}, id, {
      token,
      action: 'approve',
      revision: 'review-a',
    }),
    /review has changed/
  )
  await f.customerAction({}, id, {
    token,
    action: 'approve',
    revision: 'review-b',
  })
  f.setRevision('review-c')
  await assert.rejects(
    f.operatorAction(admin, id, { action: 'deliver' }),
    /changed after approval/
  )
  assert.equal(f.published(), 0)
  await f.operatorAction(admin, id, { action: 'review' })
  await f.customerAction({}, id, {
    token,
    action: 'approve',
    revision: 'review-c',
  })
  const result = await f.operatorAction(admin, id, { action: 'deliver' })
  assert.equal(result.stage, 'delivered')
  assert.equal(
    result.delivery.qrPath,
    '/kitchens/demo-kitchen/menus/test-menu/qr'
  )
  await f.operatorAction(admin, id, { action: 'deliver' })
  assert.equal(f.published(), 1)
  assert.equal(
    (await f.readRequest({}, id, { token })).request.stage,
    'delivered'
  )
})

test('demo flag is operator-only and a non-demo request cannot receive demo payment', async () => {
  const f = fixture()
  await assert.rejects(f.createRequest({}, f.input), /Denied/)
  await f.createRequest({}, { ...f.input, demo: false })
  await assert.rejects(
    f.operatorAction({ admin: true }, id, { action: 'demo-payment' }),
    /Only local demo/
  )
})

test('customer approval rechecks current content and rejects expiry', async () => {
  const f = fixture(),
    admin = { admin: true }
  await f.createRequest(admin, f.input)
  await f.operatorAction(admin, id, { action: 'demo-payment' })
  await f.operatorAction(admin, id, {
    action: 'prepare',
    kitchenId: 'kitchen',
    menuId: 'menu',
  })
  await f.operatorAction(admin, id, { action: 'review' })
  f.setRevision('changed')
  await assert.rejects(
    f.customerAction({}, id, {
      token,
      action: 'approve',
      revision: 'review-a',
    }),
    /Menu changed/
  )
  f.records.set(`apps/misebox-app/conversations/${id}/private/session`, {
    token_hash: chat.hashChatRecoveryToken(token),
    expires_at: time(1),
  })
  await assert.rejects(f.readRequest({}, id, { token }), /expired/)
})

function paymentFixture(f, session, failFirst = false) {
  let calls = 0
  const keys = []
  class StripeFixture {
    checkout = {
      sessions: {
        retrieve: async () => session,
        listLineItems: async () => ({
          data: [{ price: { id: 'price_test' }, quantity: 1 }],
          has_more: false,
        }),
      },
    }
  }
  const payments = load(
    '../server/menu-express/payment.ts',
    {
      ...contract,
      ...chat,
      Stripe: StripeFixture,
      useRuntimeConfig: () => ({ menuExpress: { productId: 'menu-express' } }),
      STRIPE_API_VERSION: 'fixture',
      context: () => ({ appId: 'misebox-app', target }),
      runGuardedServerTransaction: f.transaction,
      dto: f.dto,
      createProductCheckout: async (_, __, options) => {
        calls++
        keys.push(options.idempotencyKey)
        if (failFirst && calls === 1)
          throw new Error('Interrupted provider response')
        return { id: 'cs_test_demo', url: 'https://checkout.stripe.com/demo' }
      },
      getRuntimeFirestore: () => ({
        collection: () => ({
          where() {
            return this
          },
          limit() {
            return this
          },
          get: async () => ({
            docs: [
              {
                id: 'price_test',
                data: () => ({
                  active: true,
                  type: 'one_time',
                  provider: 'stripe',
                  default: true,
                }),
              },
            ],
          }),
        }),
      }),
      serverConversationPrivateTarget: privateTarget,
    },
    'recordPayment,startCheckout'
  )
  return { ...payments, calls: () => calls, keys }
}

test('verified provider callback is idempotent; unpaid and mismatched sessions never release preparation', async () => {
  const original = process.env.STRIPE_SECRET_KEY
  process.env.STRIPE_SECRET_KEY = 'fixture'
  try {
    const f = fixture()
    await f.createRequest({}, { ...f.input, demo: false })
    const session = {
      id: 'cs_test_demo',
      mode: 'payment',
      status: 'complete',
      payment_status: 'unpaid',
      metadata: {
        appId: 'misebox-app',
        productId: 'menu-express',
        menuExpressRequestId: id,
      },
    }
    const p = paymentFixture(f, session)
    await p.startCheckout({}, id, token)
    const event = {
      type: 'checkout.session.completed',
      data: { object: session },
    }
    await p.recordPayment({}, event)
    assert.equal(
      (await f.readRequest({}, id, { token })).request.payment.status,
      'pending'
    )
    await assert.rejects(
      f.operatorAction({ admin: true }, id, {
        action: 'prepare',
        kitchenId: 'kitchen',
        menuId: 'menu',
      }),
      /Payment/
    )
    session.metadata.appId = 'other'
    await assert.rejects(p.recordPayment({}, event), /does not match/)
    session.metadata.appId = 'misebox-app'
    session.payment_status = 'paid'
    await p.recordPayment({}, event)
    await p.recordPayment({}, event)
    assert.equal(
      (await f.readRequest({}, id, { token })).request.payment.status,
      'paid'
    )
    await assert.rejects(p.startCheckout({}, id, token), /already paid/)
  } finally {
    if (original === undefined) delete process.env.STRIPE_SECRET_KEY
    else process.env.STRIPE_SECRET_KEY = original
  }
})

test('webhook route verifies native Stripe signatures before calling the request owner', async () => {
  const secret = 'whsec_fixture',
    body = JSON.stringify({
      id: 'evt_test',
      type: 'checkout.session.completed',
      data: { object: { id: 'cs_test' } },
    })
  const stripe = new Stripe('sk_test_fixture'),
    signature = stripe.webhooks.generateTestHeaderString({
      payload: body,
      secret,
    })
  let processed = 0
  const { handler } = load(
    '../server/api/menu-express/stripe-webhook.post.ts',
    {
      defineEventHandler: (value) => value,
      getHeader: (event) => event.signature,
      readRawBody: async () => Buffer.from(body),
      stripeClient: () => stripe,
      recordPayment: async () => {
        processed++
        return { received: true }
      },
      fail: contract.fail,
    },
    'handler'
  )
  const previous = process.env.STRIPE_WEBHOOK_SECRET
  process.env.STRIPE_WEBHOOK_SECRET = secret
  try {
    await assert.rejects(
      handler({ signature: 'invalid' }),
      /Invalid webhook signature/
    )
    assert.equal(processed, 0)
    await handler({ signature })
    assert.equal(processed, 1)
  } finally {
    if (previous === undefined) delete process.env.STRIPE_WEBHOOK_SECRET
    else process.env.STRIPE_WEBHOOK_SECRET = previous
  }
})

test('Menu owner fingerprints customer-facing content, not internal context, and rejects unsupported content', async () => {
  const rows = new Map([
    [
      'kitchens/kitchen',
      {
        identity: { slug: 'demo-kitchen', status: 'active', visibility: true },
      },
    ],
    ['places/kitchen', { default_currency_code: 'CHF' }],
    [
      'kitchens/kitchen/menus/menu',
      {
        name: 'TEST Menu',
        description: 'Test only',
        slug: 'test-menu',
        format: 'interactive',
        status: 'draft',
        context: 'PRIVATE',
      },
    ],
    [
      'kitchens/kitchen/dishes/dish',
      {
        name: 'TEST soup',
        description: 'Tomato',
        price: 8.5,
        context: 'PRIVATE',
      },
    ],
  ])
  const target = (path) => ({ collectionPath: path })
  const tx = {
    read: async (t, id) => ({
      exists: rows.has(`${t.collectionPath}/${id}`),
      data: rows.get(`${t.collectionPath}/${id}`),
    }),
    readAll: async (t) =>
      t.collectionPath.endsWith('/sections')
        ? [{ id: 'section', data: { label: 'TEST snacks', sort_order: 0 } }]
        : [{ id: 'item', data: { dish_id: 'dish', sort_order: 0 } }],
  }
  const { readKitchenMenuReview } = load(
    '../../../../packages/extensions/fireux-kitchens/src/runtime/menu/server/publication/review.ts',
    {
      createHash,
      createError,
      PLACE_MUTATION_TARGETS: { places: target('places') },
      KITCHEN_MUTATION_TARGETS: { kitchens: target('kitchens') },
      serverKitchenMenusTarget: (k) => target(`kitchens/${k}/menus`),
      serverKitchenMenuSectionsTarget: (k, m) =>
        target(`kitchens/${k}/menus/${m}/sections`),
      serverKitchenMenuItemsTarget: (k, m, s) =>
        target(`kitchens/${k}/menus/${m}/sections/${s}/items`),
      serverKitchenDishesTarget: (k) => target(`kitchens/${k}/dishes`),
      readDishPricing: (data) => ({
        price: data.price,
        price_options: [],
        add_ons: [],
      }),
    },
    'readKitchenMenuReview'
  )
  const initial = await readKitchenMenuReview(tx, 'kitchen', 'menu')
  assert.equal(JSON.stringify(initial).includes('PRIVATE'), false)
  rows.get('kitchens/kitchen/dishes/dish').context = 'Changed internal context'
  assert.equal(
    (await readKitchenMenuReview(tx, 'kitchen', 'menu')).revision,
    initial.revision
  )
  rows.get('kitchens/kitchen/dishes/dish').price = 9
  assert.notEqual(
    (await readKitchenMenuReview(tx, 'kitchen', 'menu')).revision,
    initial.revision
  )
  rows.get('kitchens/kitchen/menus/menu').format = 'document'
  await assert.rejects(
    readKitchenMenuReview(tx, 'kitchen', 'menu'),
    /regular interactive Menu/
  )
})

test('interrupted checkout stays unpaid and retries the same provider operation', async () => {
  const original = process.env.STRIPE_SECRET_KEY
  process.env.STRIPE_SECRET_KEY = 'fixture'
  try {
    const f = fixture()
    await f.createRequest({}, { ...f.input, demo: false })
    const p = paymentFixture(f, {}, true)
    await assert.rejects(p.startCheckout({}, id, token), /Interrupted provider/)
    assert.equal(
      (await f.readRequest({}, id, { token })).request.payment.status,
      'unpaid'
    )
    await p.startCheckout({}, id, token)
    assert.equal(p.keys.length, 2)
    assert.equal(p.keys[0], p.keys[1])
    assert.equal(
      (await f.readRequest({}, id, { token })).request.payment.status,
      'pending'
    )
  } finally {
    if (original === undefined) delete process.env.STRIPE_SECRET_KEY
    else process.env.STRIPE_SECRET_KEY = original
  }
})
