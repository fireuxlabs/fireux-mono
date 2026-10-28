import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref } from 'vue'

const source = readFileSync(
  new URL(
    '../runtime/composables/navigation/useDashboardNav.ts',
    import.meta.url
  ),
  'utf8'
)
  .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  .replace(/^export /gm, '')
const load = compileFunction(
  `${stripTypeScriptTypes(source)};return useDashboardNav`,
  [
    'computed',
    'useMounted',
    'useNav',
    'useUserSession',
    'useDeveloperAccess',
    'useWorkspaceEntryCta',
  ]
)

test('cached permissions do not change the pre-hydration Dashboard tree; mounted navigation follows current authority', () => {
  const mounted = ref(false),
    admin = ref(true),
    developer = ref(true),
    workspace = ref(true)
  const nav = load(
    computed,
    () => mounted,
    () => ({ desktop: ref([]) }),
    () => ({ isAdmin: admin }),
    () => ({ isDeveloper: developer }),
    () => ({ hasWorkspaceEntry: workspace })
  )()
  const home = { key: 'dashboard-home' },
    privateItems = [
      { roles: ['admin'] },
      { roles: ['developer'] },
      { key: 'dashboard-workspace' },
    ]
  assert.equal(nav.baseNavFilter(home), true)
  assert.deepEqual(privateItems.map(nav.baseNavFilter), [false, false, false])
  mounted.value = true
  assert.deepEqual(privateItems.map(nav.baseNavFilter), [true, true, true])
  admin.value = false
  developer.value = false
  workspace.value = false
  assert.deepEqual(privateItems.map(nav.baseNavFilter), [false, false, false])
})
