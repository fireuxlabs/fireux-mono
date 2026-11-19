import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { compileFunction } from 'node:vm'
import { stripTypeScriptTypes } from 'node:module'
import { computed, effectScope, reactive, ref, toValue, watch } from 'vue'
import { parse } from 'vue/compiler-sfc'
import { useCommandScope } from '../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts'
import { readKitchenDocument } from '../runtime/kitchen/utils/read-kitchen-document.ts'
import {
  kitchenGuidance,
  resolveKitchenGuidance,
} from '../runtime/kitchen/content/guidance.ts'

test('common guidance resolves only explicitly chosen known patterns once', () => {
  assert.deepEqual(resolveKitchenGuidance(undefined), [])
  assert.deepEqual(resolveKitchenGuidance('high-street'), [])
  assert.deepEqual(
    resolveKitchenGuidance(['another-kitchen', 'ignore rules']),
    []
  )
  assert.deepEqual(
    resolveKitchenGuidance(['small-team', 'small-team', 'high-street']),
    [kitchenGuidance[0], kitchenGuidance[1]]
  )
  assert.deepEqual(resolveKitchenGuidance(['existing-ingredients']), [
    kitchenGuidance[2],
  ])
})

function load(path, result, dependencies) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${result}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
function commandFixture() {
  const root = { context: 'We rarely run specials.', prices: [12, 15] }
  const writes = []
  let allowed = true
  const command = load(
    '../runtime/kitchen/server/context/guidance.ts',
    'updateKitchenGuidance',
    {
      kitchenGuidance,
      resolveKitchenGuidance,
      createError: (value) =>
        Object.assign(new Error(value.statusMessage), value),
      requireFirestoreDocumentId: (id) => {
        if (typeof id !== 'string' || !id || id.includes('/'))
          throw new Error('Invalid Kitchen id')
        return id
      },
      readKitchenMutationActor: async () => ({
        uid: 'operator',
        runtimeAppId: 'misebox',
      }),
      requireKitchenRecordMutationAuthority: async (_tx, _actor, id) => {
        assert.equal(id, 'selected-kitchen')
        if (!allowed) throw new Error('Access denied')
        return { rootData: root }
      },
      runGuardedServerTransaction: async (_placement, execute) =>
        execute({
          update: (target, id, patch) => {
            writes.push({ target, id, patch })
            Object.assign(root, patch)
          },
        }),
      KITCHEN_MUTATION_TARGETS: { kitchens: 'kitchens-target' },
      serverAuditStamp: () => ({ by: 'operator' }),
    }
  )
  return {
    command,
    root,
    writes,
    deny: () => {
      allowed = false
    },
  }
}
test('selection command saves only references on the authorized Kitchen and detects concurrent changes', async () => {
  const f = commandFixture()
  const input = {
    kitchenId: 'selected-kitchen',
    guidanceIds: ['existing-ingredients', 'high-street'],
    previous: [],
  }
  assert.deepEqual(await f.command({}, input), {
    kitchenId: 'selected-kitchen',
    guidanceIds: ['high-street', 'existing-ingredients'],
  })
  assert.deepEqual(f.writes[0], {
    target: 'kitchens-target',
    id: 'selected-kitchen',
    patch: {
      guidance_ids: ['high-street', 'existing-ingredients'],
      updated: { by: 'operator' },
    },
  })
  assert.equal(f.root.context, 'We rarely run specials.')
  assert.deepEqual(f.root.prices, [12, 15])
  await assert.rejects(f.command({}, input), /changed elsewhere/)
  f.deny()
  await assert.rejects(
    f.command({}, { ...input, previous: f.root.guidance_ids }),
    /Access denied/
  )
  assert.equal(f.writes.length, 1)
})
test('selection command rejects unknown, duplicate, injected and malformed input; clearing remains explicit', async () => {
  const f = commandFixture()
  const input = { kitchenId: 'selected-kitchen', guidanceIds: [], previous: [] }
  for (const ids of [
    'high-street',
    ['unreviewed'],
    ['high-street', 'high-street'],
    [null],
    ['x'.repeat(1000)],
  ])
    await assert.rejects(
      f.command({}, { ...input, guidanceIds: ids }),
      /known guidance/
    )
  await assert.rejects(
    f.command({}, { ...input, context: 'Overwrite' }),
    /Invalid guidance/
  )
  await assert.rejects(
    f.command({}, { ...input, kitchenId: 'other/kitchen' }),
    /Invalid Kitchen/
  )
  await f.command({}, { ...input, guidanceIds: ['small-team'] })
  await f.command({}, { ...input, previous: ['small-team'] })
  assert.deepEqual(f.root.guidance_ids, [])
})
test('operator context resolves only this Kitchen’s selected common guidance without another Kitchen lookup', async () => {
  const reads = []
  const db = {
    collection: (path) => ({
      doc: (id) => ({
        get: async () => {
          reads.push([path, id])
          return { data: () => ({ context: 'Venue note' }) }
        },
      }),
    }),
  }
  const read = load(
    '../runtime/kitchen/server/context/read.ts',
    'readKitchenOperatorContext',
    {
      resolveKitchenGuidance,
      readRecordString: (owner, key) => owner[key] || '',
    }
  )
  const context = await read(db, 'selected-kitchen', {
    context: 'Kitchen differences',
    guidance_ids: ['small-team', 'unknown'],
  })
  assert.deepEqual(context.guidance, [kitchenGuidance[1]])
  assert.equal(context.kitchen, 'Kitchen differences')
  assert.equal(context.venue, 'Venue note')
  assert.deepEqual(reads, [['places', 'selected-kitchen']])
  assert.deepEqual((await read(db, 'another', {})).guidance, [])
})
test('Workspace Kitchen reader admits saved references and rejects malformed values', () => {
  const root = {
    identity: { slug: 'kitchen', status: 'active', visibility: true },
    created: { at: { seconds: 123, nanoseconds: 0 } },
    guidance_ids: ['high-street'],
  }
  assert.deepEqual(readKitchenDocument(root, 'kitchen').guidance_ids, [
    'high-street',
  ])
  for (const value of [
    'high-street',
    [false],
    ['high-street', 'high-street'],
    ['x'.repeat(81)],
  ])
    assert.equal(
      readKitchenDocument({ ...root, guidance_ids: value }, 'kitchen'),
      null
    )
})

const deferred = () => {
  let resolve
  const promise = new Promise((done) => {
    resolve = done
  })
  return { promise, resolve }
}
function clientFixture(fetch) {
  const owner = effectScope()
  const selected = ref('one'),
    canWrite = ref(true)
  const route = reactive({ path: '/identity' })
  const account = ref({ uid: 'operator', getIdToken: async () => 'token' })
  const root = ref({ id: 'one', guidance_ids: [] })
  const workspace = { root, id: selected, outcome: ref('ready') }
  const useGuidance = load(
    '../runtime/kitchen/composables/workspace/useKitchenGuidance.ts',
    'useKitchenGuidance',
    {
      computed,
      ref,
      watch,
      toValue,
      resolveKitchenGuidance,
      useCommandScope,
      useKitchenWorkspace: () => workspace,
      useAuth: () => ({ currentUser: account }),
      useAppSession: () => ({
        appUser: ref({ created: { at: 1 } }),
        pending: ref(false),
        error: ref(null),
      }),
      useFireUXConfig: () => ({ appId: 'misebox' }),
      useRoute: () => route,
      $fetch: fetch,
    }
  )
  const state = owner.run(() => useGuidance(selected, canWrite))
  return { owner, state, selected, account, root, route }
}
test('selection captures its baseline, retains failed drafts and prevents credential dispatch after switching', async () => {
  const calls = []
  const f = clientFixture(async (_url, options) => {
    calls.push(options.body)
    throw new Error('Retry')
  })
  f.root.value.guidance_ids = ['small-team']
  await f.state.save(['high-street'])
  assert.deepEqual(calls[0].previous, [])
  assert.equal(f.state.error.value, 'Retry')
  assert.deepEqual(f.state.value.value, [])
  f.state.reload()
  assert.deepEqual(f.state.value.value, ['small-team'])
  const token = deferred()
  f.account.value.getIdToken = () => token.promise
  const saving = f.state.save(['high-street'])
  f.selected.value = 'two'
  token.resolve('token')
  await saving
  assert.equal(calls.length, 1)
  assert.equal(f.state.saving.value, false)
  f.owner.stop()
})
test('a dispatched save cannot update another page after navigation', async () => {
  const response = deferred()
  const f = clientFixture(() => response.promise)
  const saving = f.state.save(['high-street'])
  await Promise.resolve()
  f.route.path = '/prep'
  response.resolve({ kitchenId: 'one', guidanceIds: ['high-street'] })
  await saving
  assert.equal(f.state.saved.value, false)
  assert.deepEqual(f.state.value.value, [])
  f.owner.stop()
})

test('a successful save replaces only its local baseline and validates the exact response', async () => {
  let wrongKitchen = false
  const f = clientFixture(async (_url, { body }) => ({
    kitchenId: wrongKitchen ? 'another' : body.kitchenId,
    guidanceIds: resolveKitchenGuidance(body.guidanceIds).map(
      (guide) => guide.id
    ),
  }))
  await f.state.save(['existing-ingredients'])
  assert.deepEqual(f.state.value.value, ['existing-ingredients'])
  assert.equal(f.state.saved.value, true)
  wrongKitchen = true
  await f.state.save([])
  assert.match(f.state.error.value, /did not match/)
  assert.deepEqual(f.state.value.value, ['existing-ingredients'])
  assert.deepEqual(f.root.value.guidance_ids, [])
  f.owner.stop()
})

test('guidance choices retain the operator draft on failure and reset to a reloaded selection', async () => {
  const source = readFileSync(
    new URL(
      '../runtime/kitchen/components/Workspace/Identity/Context/Guidance/Choices.vue',
      import.meta.url
    ),
    'utf8'
  )
  const script = parse(source).descriptor.scriptSetup.content.replace(
    /^import[\s\S]*?from ['"][^'"]+['"];?\n/gm,
    ''
  )
  const props = reactive({ value: [], saving: false, error: '' })
  const owner = effectScope()
  const state = owner.run(() =>
    compileFunction(
      `${stripTypeScriptTypes(script)}; return {selected,dirty,toggle}`,
      [
        'computed',
        'ref',
        'watch',
        'kitchenGuidance',
        'defineProps',
        'defineEmits',
      ]
    )(
      computed,
      ref,
      watch,
      kitchenGuidance,
      () => props,
      () => () => {}
    )
  )
  state.toggle('high-street', true)
  state.toggle('high-street', true)
  props.error = 'Save failed'
  await Promise.resolve()
  assert.deepEqual([...state.selected.value], ['high-street'])
  assert.equal(state.dirty.value, true)
  props.value = ['small-team']
  await Promise.resolve()
  assert.deepEqual([...state.selected.value], ['small-team'])
  assert.equal(state.dirty.value, false)
  state.toggle('small-team', false)
  assert.deepEqual([...state.selected.value], [])
  assert.equal(state.dirty.value, true)
  owner.stop()
})
