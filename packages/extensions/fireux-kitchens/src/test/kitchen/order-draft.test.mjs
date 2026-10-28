import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import assert from 'node:assert/strict'
import test from 'node:test'
import * as Vue from 'vue'
import { load } from './offering-test-helpers.mjs'
const model = load(
  '../../runtime/kitchen/models/order.model.ts',
  'OrderChannels'
)
const ordering = load(
  '../../runtime/kitchen/utils/ordering.ts',
  'createOrderDraft,addOrderLine,updateOrderLineQuantity,removeOrderLine,readOrder,readSavedOrderDraft,OrderDraftCollection,requireOrderChannel',
  model
)
const createError = (value) =>
  Object.assign(new Error(value.statusMessage), value)
const docId = (value) => {
  if (
    typeof value !== 'string' ||
    !value ||
    value.includes('/') ||
    ['.', '..'].includes(value)
  )
    throw createError({ statusCode: 400, statusMessage: 'Invalid id' })
  return value
}
const empty = () => ({
  ...ordering.createOrderDraft({ id: 'draft-a', number: '' }, 'pos', {
    channels: ['pos'],
  }),
  placed_by: { kind: 'person', id: 'operator', name: 'Alex' },
})
function server() {
  const records = new Map(),
    writes = [],
    checks = []
  let allowed = true,
    actors = 0
  const { saveKitchenOrderDraft } = load(
    '../../runtime/kitchen/server/orders/save-draft.ts',
    'saveKitchenOrderDraft',
    {
      ...ordering,
      USER_MUTATION_TARGETS: { runtimeUsers: { collectionPath: 'users' } },
      createError,
      requireFirestoreDocumentId: docId,
      useRuntimeConfig: () => ({
        public: { ordering: { channels: ['pos', 'website'] } },
      }),
      defineFirestoreMutationTarget: (value) => value,
      readKitchenMutationActor: async () => {
        actors++
        return { uid: 'operator', runtimeAppId: 'app' }
      },
      requireKitchenRecordMutationAuthority: async (_tx, _actor, id) => {
        checks.push(id)
        if (!allowed)
          throw createError({ statusCode: 403, statusMessage: 'Revoked' })
        return { ownerAppId: 'app' }
      },
      serverAuditStamp: (input) => ({ ...input, at: `stamp-${writes.length}` }),
      runGuardedServerTransaction: async (_placement, run) =>
        run({
          read: async (target, id) => ({
            exists: target.collectionPath === 'users' || records.has(id),
            data:
              target.collectionPath === 'users'
                ? { display_name: 'Alex' }
                : records.get(id),
          }),
          create: (target, id, data) => {
            assert.equal(
              target.collectionPath,
              'kitchens/kitchen-a/order-drafts'
            )
            assert.equal(records.has(id), false)
            writes.push('create')
            records.set(id, structuredClone(data))
          },
          update: (_target, id, data) => {
            writes.push('update')
            records.set(id, { ...records.get(id), ...structuredClone(data) })
          },
        }),
    }
  )
  const save = (order, expectedRevision) =>
    saveKitchenOrderDraft(
      {},
      { kitchenId: 'kitchen-a', order, expectedRevision }
    )
  return {
    save,
    command: saveKitchenOrderDraft,
    records,
    writes,
    checks,
    deny: () => {
      allowed = false
    },
    actors: () => actors,
  }
}

test('save and reopen preserve an empty draft, then exact line changes and original creation stamp', async () => {
  const x = server()
  const first = await x.save(empty(), 0)
  assert.equal(first.draft.revision, 1)
  const stored = x.records.get('draft-a')
  assert.equal('id' in stored, false)
  const reopened = ordering.readSavedOrderDraft('draft-a', stored, 'kitchen-a')
  assert.deepEqual(reopened, first.draft)
  const changed = ordering.addOrderLine(reopened.order, {
    id: 'line-1',
    item: { name: 'Soup' },
    quantity: 2,
    unit_code: 'C62',
  })
  const saved = await x.save(changed, reopened.revision)
  assert.equal(saved.draft.revision, 2)
  assert.deepEqual(x.records.get('draft-a').created, stored.created)
  assert.deepEqual(
    ordering.readSavedOrderDraft(
      'draft-a',
      x.records.get('draft-a'),
      'kitchen-a'
    ).order.lines,
    changed.lines
  )
  assert.deepEqual(x.writes, ['create', 'update'])
  assert.deepEqual(x.checks, ['kitchen-a', 'kitchen-a'])
})

test('stale revisions, missing records, malformed saved records and revoked authority cannot write', async () => {
  const x = server()
  await x.save(empty(), 0)
  await assert.rejects(() => x.save(empty(), 0), { statusCode: 409 })
  await assert.rejects(() => x.save({ ...empty(), channel: 'website' }, 1), {
    statusCode: 409,
  })
  await assert.rejects(() => x.save({ ...empty(), id: 'empty' }, 1), {
    statusCode: 409,
  })
  x.records.set('draft-a', { ...x.records.get('draft-a'), schema_version: 0 })
  await assert.rejects(() => x.save(empty(), 1), { statusCode: 409 })
  x.deny()
  await assert.rejects(() => x.save({ ...empty(), id: 'new' }, 0), {
    statusCode: 403,
  })
  assert.deepEqual(x.writes, ['create'])
})

test('invalid input and undeclared channels fail before credentials, and storage ownership is checked', async () => {
  const x = server()
  for (const input of [
    null,
    {
      kitchenId: 'kitchen-a',
      order: { ...empty(), channel: 'website' },
      expectedRevision: 0,
    },
    { kitchenId: 'kitchen-a', order: empty(), expectedRevision: -1 },
    {
      kitchenId: 'kitchen-a',
      order: { ...empty(), status: 'ready' },
      expectedRevision: 0,
    },
    {
      kitchenId: 'kitchen-a',
      order: { ...empty(), channel: 'api' },
      expectedRevision: 0,
    },
  ])
    await assert.rejects(() => x.command({}, input), { statusCode: 400 })
  assert.equal(x.actors(), 0)
  assert.throws(() =>
    ordering.readSavedOrderDraft(
      'draft-a',
      { schema_version: 1, kitchen_id: 'other', revision: 1, ...empty() },
      'kitchen-a'
    )
  )
})

function deferred() {
  let resolve
  const promise = new Promise((yes) => {
    resolve = yes
  })
  return { promise, resolve }
}
test('save captures original data and cannot dispatch or complete into an obsolete account, App, Kitchen or editor scope', async () => {
  for (const change of [
    'kitchen',
    'account',
    'app',
    'membership',
    'active',
    'dispose',
    'none',
    'success',
  ]) {
    const scope = Vue.effectScope(),
      token = deferred(),
      request = deferred(),
      calls = []
    const kitchenId = Vue.ref('kitchen-a'),
      active = Vue.ref(true)
    const user = { uid: 'operator', getIdToken: () => token.promise }
    const currentUser = Vue.ref(user),
      config = Vue.reactive({ appId: 'app' })
    const session = {
      uid: Vue.ref('operator'),
      appUser: Vue.ref({ created: { at: 'one' } }),
      pending: Vue.ref(false),
      error: Vue.ref(null),
    }
    const access = { ids: Vue.ref(['kitchen-a']), outcome: Vue.ref('ready') }
    const { useCommandScope: capture } = load(
      '../../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts',
      'useCommandScope',
      { watch: Vue.watch, onScopeDispose: Vue.onScopeDispose }
    )
    const state = scope.run(() =>
      load(
        '../../runtime/kitchen/composables/useKitchenOrderDraftSave.ts',
        'useKitchenOrderDraftSave',
        {
          ...Vue,
          ...ordering,
          useCommandScope: capture,
          useAuth: () => ({ currentUser }),
          useAppSession: () => session,
          useFireUXConfig: () => config,
          useKitchenAccess: () => access,
          $fetch: (_url, options) => {
            calls.push(options)
            return request.promise
          },
        }
      ).useKitchenOrderDraftSave(kitchenId, active)
    )
    const order = empty(),
      run = state.save(order, 0)
    order.number = 'Edited later'
    const invalidate = () => {
      if (change === 'kitchen') {
        kitchenId.value = 'other'
        kitchenId.value = 'kitchen-a'
      }
      if (change === 'account') {
        currentUser.value = { ...user, uid: 'other' }
        currentUser.value = user
      }
      if (change === 'app') {
        config.appId = 'other'
        config.appId = 'app'
      }
      if (change === 'membership') {
        session.appUser.value = { created: { at: 'two' } }
        session.appUser.value = { created: { at: 'one' } }
      }
      if (change === 'active') {
        active.value = false
        active.value = true
      }
      if (change === 'dispose') scope.stop()
    }
    if (!['none', 'success'].includes(change)) invalidate()
    token.resolve('token')
    await Promise.resolve()
    await Promise.resolve()
    if (!['none', 'success'].includes(change)) {
      assert.equal(await run, null)
      assert.equal(calls.length, 0)
    } else {
      assert.equal(calls[0].body.order.number, '')
      if (change === 'none') config.appId = 'other'
      request.resolve({
        ok: true,
        kitchen_id: 'kitchen-a',
        draft: { order: empty(), revision: 1 },
      })
      const result = await run
      if (change === 'success')
        assert.deepEqual(result, { order: empty(), revision: 1 })
      else assert.equal(result, null)
      assert.equal(state.error.value, '')
    }
    scope.stop()
  }
})

test('paged reader uses authorized Kitchen scope and masks retained or invalid rows', () => {
  const scope = Vue.effectScope(),
    kitchenId = Vue.ref('kitchen-a')
  const session = {
    uid: Vue.ref('operator'),
    appUser: Vue.ref({ created: { at: 'one' } }),
    pending: Vue.ref(false),
    error: Vue.ref(null),
  }
  const access = {
    ids: Vue.ref(['kitchen-a']),
    outcome: Vue.ref('ready'),
    pending: Vue.ref(false),
    error: Vue.ref(null),
  }
  const source = {
    data: Vue.ref([
      {
        id: 'draft-a',
        schema_version: 1,
        kitchen_id: 'kitchen-a',
        revision: 1,
        number: '',
        channel: 'pos',
        lines: [],
      },
    ]),
    outcome: Vue.ref('ready'),
    pending: Vue.ref(false),
    error: Vue.ref(null),
    hasMore: Vue.ref(true),
    loadMore() {},
  }
  let path, options
  const state = scope.run(() =>
    load(
      '../../runtime/kitchen/composables/useKitchenOrderDraftCollection.ts',
      'useKitchenOrderDraftCollection',
      {
        ...Vue,
        ...ordering,
        useAppSession: () => session,
        useFireUXConfig: () => ({ appId: 'app' }),
        useKitchenAccess: () => access,
        isFirestoreDocumentId: (value) =>
          typeof value === 'string' && Boolean(value) && !value.includes('/'),
        orderBy: (...args) => args,
        useFirestoreRead: () => ({
          firestoreCollectionPage: (p, opts) => {
            path = p
            options = opts
            return source
          },
        }),
      }
    ).useKitchenOrderDraftCollection(kitchenId)
  )
  assert.equal(path.value, 'kitchens/kitchen-a/order-drafts')
  assert.deepEqual(options.constraints, [['updated.at', 'desc']])
  assert.equal(state.drafts.value.length, 1)
  for (const outcome of ['pending', 'error', 'idle']) {
    source.outcome.value = outcome
    assert.deepEqual(state.drafts.value, [])
  }
  source.outcome.value = 'ready'
  source.data.value[0].schema_version = 0
  assert.equal(state.outcome.value, 'error')
  assert.deepEqual(state.drafts.value, [])
  source.data.value[0].schema_version = 1
  const before = options.scope.value
  session.appUser.value = null
  assert.equal(path.value, '')
  assert.deepEqual(state.drafts.value, [])
  session.appUser.value = { created: { at: 'one' } }
  assert.notEqual(options.scope.value, before)
  access.ids.value = []
  assert.equal(path.value, '')
  assert.equal(state.hasMore.value, false)
  scope.stop()
})

test('actual draft surface saves/reopens, preserves dirty edits and ignores an obsolete save completion', async () => {
  const scope = Vue.effectScope(),
    scopeVersion = Vue.ref(0),
    pending = Vue.ref(false),
    rows = Vue.ref([])
  const initiateAllowed = Vue.ref(false)
  const staffProfile = Vue.ref({ display_name: 'Alex' })
  const requests = []
  let nextId = 0
  const source = readFileSync(
    new URL(
      '../../runtime/kitchen/components/Orders/Editor.vue',
      import.meta.url
    ),
    'utf8'
  )
    .match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  const deps = {
    ...Vue,
    defineProps: () => ({}),
    ...ordering,
    crypto: { randomUUID: () => `generated-${++nextId}` },
    useRuntimeConfig: () => ({ public: { ordering: { channels: ['pos'] } } }),
    useAuth: () => ({
      currentUser: Vue.ref({ uid: 'operator', isAnonymous: false }),
    }),
    useUserRead: () => ({ user: staffProfile, outcome: Vue.ref('ready') }),
    useKitchenWorkspace: () => ({
      id: Vue.ref('kitchen-a'),
      outcome: Vue.ref('ready'),
    }),
    useKitchenOrderDraftCollection: () => ({
      drafts: rows,
      outcome: Vue.ref('ready'),
      error: Vue.ref(null),
      hasMore: Vue.ref(false),
      loadMore() {},
    }),
    useKitchenOrderDraftSave: () => ({
      pending,
      error: Vue.ref(''),
      canSave: initiateAllowed,
      scopeVersion,
      save: (order, revision) => {
        const response = deferred()
        pending.value = true
        requests.push({ order: ordering.readOrder(order), revision, response })
        return response.promise.finally(() => {
          pending.value = false
        })
      },
    }),
  }
  const state = scope.run(() =>
    compileFunction(
      `${stripTypeScriptTypes(source)}; return {order,itemName,quantity,dirty,revision,submitLine,saveDraft,openDraft,resetDraft,discardChanges,updateQuantity}`,
      Object.keys(deps)
    )(...Object.values(deps))
  )
  assert.equal(state.order.value, null)
  state.resetDraft()
  assert.equal(state.order.value, null)
  initiateAllowed.value = true
  staffProfile.value.display_name = ''
  state.resetDraft()
  assert.equal(state.order.value, null)
  staffProfile.value.display_name = 'Alex'
  state.resetDraft()
  assert.deepEqual(state.order.value.placed_by, {
    kind: 'person',
    id: 'operator',
    name: 'Alex',
  })
  assert.deepEqual(state.order.value.lines, [])
  state.itemName.value = 'Soup'
  state.quantity.value = 2
  state.submitLine()
  assert.equal(state.dirty.value, true)
  const save = state.saveDraft()
  const saved = { order: requests[0].order, revision: 1 }
  requests[0].response.resolve(saved)
  await save
  assert.equal(state.dirty.value, false)
  assert.equal(state.revision.value, 1)
  const lineId = state.order.value.lines[0].id
  state.updateQuantity(lineId, 3)
  state.openDraft({ order: { ...empty(), id: 'another' }, revision: 1 })
  assert.equal(state.order.value.id, saved.order.id)
  assert.equal(state.order.value.lines[0].quantity, 3)
  state.discardChanges()
  assert.equal(state.order.value.lines[0].quantity, 2)
  state.resetDraft()
  state.openDraft(saved)
  assert.equal(state.order.value.id, saved.order.id)
  assert.equal(state.revision.value, 1)
  state.updateQuantity(lineId, 4)
  const oldSave = state.saveDraft()
  scopeVersion.value++
  assert.equal(state.order.value, null)
  state.resetDraft()
  assert.equal(state.order.value, null)
  requests[1].response.resolve({ order: requests[1].order, revision: 2 })
  await oldSave
  assert.equal(state.order.value, null)
  state.resetDraft()
  assert.equal(state.order.value.lines.length, 0)
  assert.equal(state.revision.value, 0)
  scope.stop()
})

test('save/reopen preserves optional context and explicitly clears it on update', async () => {
  const x = server()
  const order = {
    ...empty(),
    fulfilment: 'on_site',
    customer: { name: 'Jamie', phone: '0123456' },
    delivery_address: 'Example address',
    requested_at: '2026-10-20T12:30:00.000Z',
    placed_by: { kind: 'person', id: 'operator', name: 'Alex' },
    location: { id: 'table-12', name: 'Table 12' },
  }
  await x.save(order, 0)
  assert.deepEqual(
    ordering.readSavedOrderDraft(order.id, x.records.get(order.id), 'kitchen-a')
      .order,
    order
  )
  await x.save(empty(), 1)
  assert.deepEqual(
    ordering.readSavedOrderDraft(order.id, x.records.get(order.id), 'kitchen-a')
      .order,
    empty()
  )
})

test('POS initiation cannot save a missing or impersonated staff identity', async () => {
  for (const placed_by of [
    undefined,
    { kind: 'person', id: 'another', name: 'Alex' },
    { kind: 'person', id: 'operator', name: 'Fake' },
    { kind: 'system', id: 'operator', name: 'Alex' },
  ]) {
    const x = server()
    const order = empty()
    if (placed_by) order.placed_by = placed_by
    else delete order.placed_by
    await assert.rejects(() => x.save(order, 0), { statusCode: 409 })
    assert.equal(x.writes.length, 0)
  }
  const x = server()
  await x.save(empty(), 0)
  await assert.rejects(
    () =>
      x.save(
        {
          ...empty(),
          placed_by: { kind: 'person', id: 'other', name: 'Other' },
        },
        1
      ),
    { statusCode: 409 }
  )
  assert.equal(x.writes.length, 1)
})

test('actual library channel switches show correct empty entry context without retaining prior data', () => {
  const scope = Vue.effectScope()
  const source = readFileSync(
    new URL(
      '../../runtime/kitchen/components/Orders/Examples/Index.vue',
      import.meta.url
    ),
    'utf8'
  )
    .match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  const validation = load(
    '../../runtime/kitchen/utils/order-submission.ts',
    'orderSubmissionIssues'
  )
  const deps = { ...Vue, ...ordering, ...model, ...validation }
  const state = scope.run(() =>
    compileFunction(
      `${stripTypeScriptTypes(source)}; return { channel,kioskChoice,websiteEntry,identity,tableName,tableId,order,itemsAdded,channels,postLocation,customerName,phone,address,requestedTime,needsName,needsLocation,initOrder,preOrder,itemsOrder }`,
      Object.keys(deps)
    )(...Object.values(deps))
  )
  const check = () => {
    assert.equal(state.order.value.number, '')
    assert.deepEqual(state.order.value.lines, [])
    return state.order.value
  }
  assert.equal(check().placed_by.id, 'example-staff')
  state.channel.value = 'kiosk'
  assert.equal(check().fulfilment, '')
  state.kioskChoice.value = 'on_site'
  assert.equal(check().fulfilment, 'on_site')
  assert.equal(check().placed_by, undefined)
  state.kioskChoice.value = 'takeaway'
  assert.equal(check().fulfilment, 'takeaway')
  state.channel.value = 'website'
  assert.equal(check().fulfilment, '')
  assert.equal(state.identity.value, '')
  state.websiteEntry.value = 'collection'
  assert.equal(check().fulfilment, 'collection')
  assert.equal(check().placed_by, undefined)
  state.websiteEntry.value = 'delivery'
  assert.equal(check().fulfilment, 'delivery')
  state.websiteEntry.value = 'table'
  assert.equal(check().location, undefined)
  state.tableName.value = 'Table 12'
  assert.deepEqual(check().location, { name: 'Table 12' })
  state.tableId.value = 'table-12'
  assert.equal(check().location.id, 'table-12')
  assert.equal(check().fulfilment, 'on_site')
  state.identity.value = 'identified'
  assert.equal(check().placed_by.name, 'Sam')
  assert.deepEqual(
    state.channels.map((item) => item.value),
    ['pos', 'kiosk', 'website']
  )
  state.channel.value = 'pos'
  assert.equal(check().placed_by.name, 'Alex')
  assert.equal(check().location, undefined)
  assert.equal(state.tableName.value, '')
  assert.equal(state.tableId.value, '')
  state.itemsAdded.value = true
  const fixed = ordering.readOrder(state.order.value).lines
  assert.equal(fixed.length, 2)
  for (const channel of ['kiosk', 'website', 'pos']) {
    state.channel.value = channel
    assert.deepEqual(state.order.value.lines, fixed)
    assert.equal(state.order.value.number, '')
  }
  state.kioskChoice.value = 'takeaway'
  state.customerName.value = 'Jamie'
  assert.deepEqual(state.order.value.customer, { name: 'Jamie' })
  state.kioskChoice.value = 'on_site'
  assert.equal(state.order.value.customer, undefined)
  state.postLocation.value = 'Table 7'
  assert.deepEqual(state.order.value.location, { name: 'Table 7' })
  state.channel.value = 'website'
  state.websiteEntry.value = 'delivery'
  state.customerName.value = 'Taylor'
  state.phone.value = '0123456789'
  state.address.value = '10 Example Street'
  state.requestedTime.value = '2026-10-20T12:30:00Z'
  assert.deepEqual(state.order.value.customer, {
    name: 'Taylor',
    phone: '0123456789',
  })
  assert.equal(state.order.value.delivery_address, '10 Example Street')
  assert.equal(state.order.value.requested_at, '2026-10-20T12:30:00.000Z')
  assert.deepEqual(state.initOrder.value.lines, [])
  assert.equal(state.initOrder.value.fulfilment, undefined)
  assert.equal(state.preOrder.value.fulfilment, 'delivery')
  assert.deepEqual(state.preOrder.value.lines, [])
  assert.equal(state.itemsOrder.value.lines.length, 2)
  for (const snapshot of [
    state.initOrder.value,
    state.preOrder.value,
    state.itemsOrder.value,
  ]) {
    assert.equal(snapshot.customer, undefined)
    assert.equal(snapshot.delivery_address, undefined)
    assert.equal(snapshot.requested_at, undefined)
  }
  state.identity.value = 'identified'
  assert.equal(state.needsName.value, false)
  assert.deepEqual(state.order.value.customer, { name: 'Sam' })
  state.websiteEntry.value = 'table'
  state.tableName.value = 'Table 8'
  assert.equal(state.needsLocation.value, false)
  assert.equal(state.order.value.customer, undefined)
  assert.equal(state.order.value.delivery_address, undefined)
  assert.equal(state.order.value.requested_at, undefined)
  state.itemsAdded.value = false
  assert.deepEqual(check().lines, [])
  scope.stop()
})

test('library review blocks incomplete orders and captures valid local examples for each channel', () => {
  const scope = Vue.effectScope()
  const source = readFileSync(
    new URL(
      '../../runtime/kitchen/components/Orders/Examples/Index.vue',
      import.meta.url
    ),
    'utf8'
  )
    .match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  const validation = load(
    '../../runtime/kitchen/utils/order-submission.ts',
    'orderSubmissionIssues'
  )
  const deps = { ...Vue, ...ordering, ...model, ...validation }
  const state = scope.run(() =>
    compileFunction(
      `${stripTypeScriptTypes(source)}; return { channel,kioskChoice,websiteEntry,identity,itemsAdded,customerName,phone,address,tableName,postLocation,requestedTime,order,reviewIssues,submittedOrder,submitExample,successOutcome,successView }`,
      Object.keys(deps)
    )(...Object.values(deps))
  )
  assert.equal(state.reviewIssues.value.length, 2)
  state.submitExample()
  assert.equal(state.submittedOrder.value, null)
  state.kioskChoice.value = 'takeaway'
  state.itemsAdded.value = true
  assert.deepEqual(state.reviewIssues.value, [])
  state.submitExample()
  assert.deepEqual(state.submittedOrder.value, state.order.value)
  state.channel.value = 'kiosk'
  assert.equal(state.submittedOrder.value, null)
  state.kioskChoice.value = 'on_site'
  assert.deepEqual(state.reviewIssues.value, [])
  state.submitExample()
  assert.equal(state.submittedOrder.value.channel, 'kiosk')
  assert.ok(state.successView.value.message.includes('counter'))
  state.channel.value = 'website'
  state.websiteEntry.value = 'collection'
  assert.equal(state.reviewIssues.value.length, 2)
  state.identity.value = 'identified'
  assert.equal(state.reviewIssues.value.length, 1)
  state.phone.value = '0000000000'
  state.submitExample()
  assert.equal(state.submittedOrder.value.fulfilment, 'collection')
  assert.equal(state.successView.value.action, 'View collection details')
  state.websiteEntry.value = 'delivery'
  assert.equal(state.submittedOrder.value, null)
  state.phone.value = '0000000000'
  assert.ok(state.reviewIssues.value.includes('Delivery address is required.'))
  state.address.value = 'Example Street'
  state.requestedTime.value = 'invalid'
  state.submitExample()
  assert.equal(state.submittedOrder.value, null)
  state.requestedTime.value = ''
  state.submitExample()
  assert.equal(state.submittedOrder.value.delivery_address, 'Example Street')
  assert.equal(state.successView.value.action, 'Track delivery')
  state.requestedTime.value = '2026-10-20T12:30:00Z'
  state.submitExample()
  assert.equal(state.successView.value.title, 'Order scheduled')
  state.successOutcome.value = 'deposit'
  assert.equal(state.successView.value.action, 'Pay deposit')
  state.websiteEntry.value = 'table'
  assert.ok(state.reviewIssues.value.includes('Table or location is required.'))
  state.tableName.value = 'Table 3'
  state.submitExample()
  assert.equal(state.submittedOrder.value.location.name, 'Table 3')
  assert.ok(state.successView.value.message.includes('Table 3'))
  state.itemsAdded.value = false
  assert.equal(state.submittedOrder.value, null)
  assert.ok(state.reviewIssues.value.includes('Add at least one item.'))
  scope.stop()
})

test('board refresh is independent of actions and revoked access clears submitted tickets', async () => {
  const scope = Vue.effectScope()
  const source = readFileSync(
    new URL(
      '../../runtime/kitchen/components/Orders/Board.vue',
      import.meta.url
    ),
    'utf8'
  )
    .match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  const access = {
    outcome: Vue.ref('ready'),
    ids: Vue.ref(['kitchen']),
    error: Vue.ref(null),
  }
  const session = {
    pending: Vue.ref(false),
    error: Vue.ref(null),
    appUser: Vue.ref({ id: 'member' }),
  }
  const transports = []
  let actionResult = null
  const deps = {
    ...Vue,
    onMounted: () => {},
    onUnmounted: () => {},
    useKitchenWorkspace: () => ({ id: Vue.ref('kitchen') }),
    useKitchenAccess: () => access,
    useAppSession: () => session,
    useKitchenOrderDraftCollection: () => ({
      drafts: Vue.ref([]),
      error: Vue.ref(null),
    }),
    useOrderExchange: (id, owner) => {
      const state = {
        pending: Vue.ref(false),
        error: Vue.ref(''),
        version: Vue.ref(0),
        request: async () => (transports[0] === state ? actionResult : []),
      }
      Vue.watch([id, owner], () => state.version.value++, { flush: 'sync' })
      transports.push(state)
      return state
    },
  }
  delete deps.version
  const state = scope.run(() =>
    compileFunction(
      `${stripTypeScriptTypes(source)};return {orders,kitchenId,pending,refresh,respond}`,
      Object.keys(deps)
    )(...Object.values(deps))
  )
  transports[1].pending.value = true
  assert.equal(state.pending.value, false)
  const entry = { order: { id: 'a' }, state: 'accepted', revision: 1 }
  state.orders.value = [entry]
  actionResult = { ...entry, state: 'preparing', revision: 2 }
  await state.respond(entry, 'preparing')
  assert.equal(state.orders.value[0].state, 'preparing')
  access.ids.value = []
  assert.equal(state.kitchenId.value, '')
  assert.deepEqual(state.orders.value, [])
  scope.stop()
})
