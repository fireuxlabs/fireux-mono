import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import {
  computed,
  ref,
  watch,
  nextTick,
  reactive,
  onScopeDispose,
  effectScope,
} from 'vue'

const helper = readFileSync(
  new URL(
    '../../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts',
    import.meta.url
  ),
  'utf8'
)
  .replace(/^import[^\n]*\n/gm, '')
  .replace(/^export /gm, '')
const useCommandScope = compileFunction(
  `${stripTypeScriptTypes(helper)};return useCommandScope`,
  ['watch', 'onScopeDispose']
)(watch, onScopeDispose)

function harness() {
  const scope = effectScope()
  const app = { uid: ref('actor'), appUser: ref({ created: { at: 1 } }) }
  const route = reactive({
    path: '/workspace/kitchen/create',
    fullPath: '/workspace/kitchen/create',
  })
  const config = reactive({ appId: 'app' })
  const events: unknown[] = []
  const collection = ref<Array<{ id: string }>>([])
  let timeout: () => void = () => {}
  const source = readFileSync(
    new URL(
      '../../runtime/kitchen/composables/useKitchenOnboarding.ts',
      import.meta.url
    ),
    'utf8'
  )
    .replace(/^import[\s\S]*?from '[^']+'\n/gm, '')
    .replace(/^export /gm, '')
  const create = compileFunction(
    `${stripTypeScriptTypes(source)}\nreturn useKitchenOnboarding`,
    [
      'useCommandScope',
      'useFireUXConfig',
      'onScopeDispose',
      'computed',
      'useKitchenCreate',
      'useOnboarding',
      'ref',
      'watch',
      'useAppSession',
      'useKitchenTargets',
      'useWorkspace',
      'useRoute',
      'useRouter',
      'setTimeout',
      'clearTimeout',
    ]
  )(
    useCommandScope,
    () => config,
    onScopeDispose,
    computed,
    () => ({}),
    () => ({ reset() {}, error: ref('') }),
    ref,
    watch,
    () => app,
    () => ({ kitchens: collection }),
    () => ({ select: (id: string) => events.push(['select', id]) }),
    () => route,
    () => ({
      push: async (path: string) => {
        events.push(['navigate', path])
      },
    }),
    (callback: () => void) => {
      timeout = callback
      return 1
    },
    () => {}
  )
  const modal = readFileSync(
    new URL(
      '../../runtime/kitchen/components/Workspace/Home/Create.vue',
      import.meta.url
    ),
    'utf8'
  )
    .split('<script setup lang="ts">')[1]
    .split('</script>')[0]
    .replace(/^import .* from .+\n/gm, '')
  const close = compileFunction(
    `${stripTypeScriptTypes(modal)}\nreturn onCreated`,
    ['defineProps', 'defineEmits', 'useWorkspaceEntryCta', 'withDefaults']
  )(
    () => ({}),
    () =>
      (...args: unknown[]) =>
        events.push(args),
    () => ({ workspaceEntryPath: '/' }),
    (props: object, defaults: object) => ({ ...defaults, ...props })
  )
  const flow = scope.run(() =>
    create({
      selectWorkspace: () => true,
      returnTo: () => '/',
      onCreated: close,
      onError: (message: string) => events.push(['error', message]),
    })
  )
  const result = { kitchen_id: 'new', owner_user_id: 'actor' }
  return {
    scope,
    app,
    route,
    config,
    events,
    collection,
    flow,
    result,
    expire: () => timeout(),
  }
}

test('completion waits for collection, selects, closes the existing modal and returns home once', async () => {
  const h = harness()
  const pending = h.flow.finishSelection(h.result)
  await h.flow.finishSelection(h.result)
  assert.equal(h.flow.finishing.value, true)
  assert.deepEqual(h.events, [])
  h.collection.value = [{ id: 'new' }]
  await nextTick()
  await pending
  assert.deepEqual(h.events, [
    ['select', 'new'],
    ['created', h.result],
    ['update:open', false],
    ['navigate', '/'],
  ])
  assert.equal(h.flow.finishing.value, false)
})

test('slow collection retains the modal and a later retry opens without a second command', async () => {
  const h = harness()
  const pending = h.flow.finishSelection(h.result)
  h.expire()
  await pending
  assert.equal(h.events.length, 1)
  assert.equal((h.events[0] as string[])[0], 'error')
  h.collection.value = [{ id: 'new' }]
  await h.flow.finishSelection(h.result)
  assert.deepEqual(h.events.slice(1), [
    ['select', 'new'],
    ['created', h.result],
    ['update:open', false],
    ['navigate', '/'],
  ])
})

test('provisioning for another user does not select their Kitchen in the acting user workspace', async () => {
  const h = harness()
  const result = { ...h.result, owner_user_id: 'beneficiary' }
  await h.flow.finishSelection(result)
  assert.deepEqual(h.events, [
    ['created', result],
    ['update:open', false],
    ['navigate', '/'],
  ])
})

for (const changed of ['account', 'membership', 'app', 'route', 'disposal'])
  test(`completion suppresses obsolete ${changed} round trip`, async () => {
    const h = harness()
    const pending = h.flow.finishSelection(h.result)
    if (changed === 'account') {
      h.app.uid.value = 'other'
      h.app.uid.value = 'actor'
    }
    if (changed === 'membership') {
      const old = h.app.appUser.value
      h.app.appUser.value = { created: { at: 2 } }
      h.app.appUser.value = old
    }
    if (changed === 'app') {
      h.config.appId = 'other'
      h.config.appId = 'app'
    }
    if (changed === 'route') {
      h.route.fullPath = '/other'
      h.route.fullPath = h.route.path
    }
    if (changed === 'disposal') h.scope.stop()
    h.collection.value = [{ id: 'new' }]
    await nextTick()
    await pending
    assert.deepEqual(h.events, [])
    h.scope.stop()
  })

test('clearing selection cancels the old live wait and permits the next handoff', async () => {
  const h = harness()
  const old = h.flow.finishSelection(h.result)
  h.flow.clearSelection()
  await old
  assert.equal(h.flow.finishing.value, false)
  assert.deepEqual(h.events, [])
  h.collection.value = [{ id: 'next' }]
  await h.flow.finishSelection({ ...h.result, kitchen_id: 'next' })
  assert.deepEqual(h.events[0], ['select', 'next'])
  h.scope.stop()
})
