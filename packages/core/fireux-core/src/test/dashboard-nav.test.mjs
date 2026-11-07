import { useDashboardProfiles } from '../runtime/composables/navigation/useDashboardProfiles.ts'
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
    'useDashboardProfiles',
  ]
)

test('profile navigation stays reactive and prefers one canonical entry per profile without session readers', () => {
  const items = ref([
    {
      group: 'profiles',
      profileId: 'cook',
      label: 'Cook',
      to: '/cook',
      order: 1,
    },
    {
      group: 'profiles',
      profileId: 'cook',
      label: 'Cook profile',
      to: '/cook/profile',
      order: 5,
    },
    {
      group: 'profiles',
      profileId: 'host',
      label: 'Host',
      to: '/host/profile',
      order: 2,
    },
    {
      group: 'other',
      profileId: 'ignored',
      label: 'Other',
      to: '/other',
      order: 0,
    },
  ])
  const profiles = useDashboardProfiles(items)
  assert.deepEqual(
    profiles.availableProfileEntries.value.map((item) => item.to),
    ['/host/profile', '/cook/profile']
  )
  assert.deepEqual(profiles.activeProfileEntries.value, [])
  items.value = []
  assert.deepEqual(profiles.availableProfileEntries.value, [])
})

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
    () => ({ hasWorkspaceEntry: workspace }),
    useDashboardProfiles
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
