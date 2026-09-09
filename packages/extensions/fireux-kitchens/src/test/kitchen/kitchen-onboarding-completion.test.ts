import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref, watch, nextTick } from 'vue'

function harness() {
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
      'computed',
      'useKitchenCreate',
      'useOnboarding',
      'ref',
      'watch',
      'useAppSession',
      'useKitchenWorkspaceIndex',
      'useRoute',
      'useRouter',
      'setTimeout',
      'clearTimeout',
    ]
  )(
    computed,
    () => ({}),
    () => ({ reset() {}, error: ref('') }),
    ref,
    watch,
    () => ({ uid: ref('actor') }),
    () => ({ collection, select: (id: string) => events.push(['select', id]) }),
    () => ({ path: '/workspace/kitchen/create' }),
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
      '../../runtime/kitchen/components/Workspace/Crud/Create.vue',
      import.meta.url
    ),
    'utf8'
  )
    .split('<script setup lang="ts">')[1]
    .split('</script>')[0]
    .replace(/^import .* from .+\n/gm, '')
  const close = compileFunction(
    `${stripTypeScriptTypes(modal)}\nreturn onCreated`,
    ['defineProps', 'defineEmits']
  )(
    () => ({}),
    () =>
      (...args: unknown[]) =>
        events.push(args)
  )
  const flow = create({
    selectWorkspace: () => true,
    returnTo: () => '/',
    onCreated: close,
    onError: (message: string) => events.push(['error', message]),
  })
  const result = { kitchen_id: 'new', app_user: { id: 'actor' } }
  return { events, collection, flow, result, expire: () => timeout() }
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
  const result = { ...h.result, app_user: { id: 'beneficiary' } }
  await h.flow.finishSelection(result)
  assert.deepEqual(h.events, [
    ['created', result],
    ['update:open', false],
    ['navigate', '/'],
  ])
})
