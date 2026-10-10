import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'
import { computed, ref } from 'vue'
import { resolveAppUserAccess } from '../../../../core/fireux-core/src/runtime/app/utils/app-user-access.ts'

const raw = readFileSync(
  new URL(
    '../runtime/kitchen/composables/workspace/useKitchenWorkspaceIndex.ts',
    import.meta.url
  ),
  'utf8'
)
const source = stripTypeScriptTypes(
  raw.replace(/^import[\s\S]*?from '[^']+'\n/gm, '').replace(/^export /gm, '')
)

test('tier changes affect presentation without truncating saved Kitchens or selection', () => {
  const session = {
    pending: ref(false),
    error: ref(null),
    appUser: ref({ role: 'dev', subscription: 'free' }),
  }
  const kitchens = ref([{ id: 'one' }, { id: 'two' }])
  const selectedId = ref('two')
  const index = compileFunction(
    `${source}; return useKitchenWorkspaceIndex()`,
    [
      'useCommandScope',
      'computed',
      'watch',
      'useAppSession',
      'resolveAppUserAccess',
      'useState',
      'useRoute',
      'useRouter',
      'useFireUXConfig',
      'useWorkspace',
      'useKitchenWorkspaceKitchens',
    ]
  )(
    () => () => true,
    computed,
    () => {},
    () => session,
    resolveAppUserAccess,
    (_key, initial) => ref(initial()),
    () => ({ query: {}, path: '/workspace/kitchen' }),
    () => ({}),
    () => ({ appId: 'test' }),
    () => ({ selectedId }),
    () => ({ kitchens, outcome: ref('ready') })
  )
  for (const [subscription, multiple] of [
    ['free', false],
    ['premium', false],
    ['business', true],
    ['free', false],
  ]) {
    session.appUser.value.subscription = subscription
    assert.equal(index.multipleKitchenView.value, multiple)
    assert.deepEqual(
      index.collection.value.map((item) => item.id),
      ['one', 'two']
    )
    assert.equal(index.selectedId.value, 'two')
  }
  session.appUser.value.subscription = 'business'
  session.pending.value = true
  assert.equal(index.multipleKitchenView.value, false)
  session.pending.value = false
  session.error.value = new Error('unavailable')
  assert.equal(index.multipleKitchenView.value, false)
})
