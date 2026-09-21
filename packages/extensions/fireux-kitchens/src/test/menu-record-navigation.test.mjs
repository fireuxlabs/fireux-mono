import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'
import { ref, computed, watch, reactive } from 'vue'
import { menuWorkspaceDestination } from '../runtime/kitchen/utils/menu-workspace-destination.ts'

function fixture() {
  const uid = ref('user-a'),
    selectedId = ref('kitchen-a'),
    state = ref(null)
  const config = reactive({ appId: 'misebox' })
  let now = 1000
  const visits = []
  const afterEach = []
  const dependencies = {
    computed,
    watch,
    onScopeDispose: () => {},
    useRouter: () => ({
      afterEach: (fn) => {
        afterEach.push(fn)
        return () => {}
      },
    }),
    useState: () => state,
    useAppSession: () => ({ uid }),
    useWorkspace: () => ({ selectedId }),
    useFireUXConfig: () => config,
    navigateTo: (path, options) => {
      visits.push({ path, options })
    },
    menuWorkspaceDestination,
    Date: { now: () => now },
  }
  const source = stripTypeScriptTypes(
    readFileSync(
      new URL(
        '../runtime/kitchen/composables/workspace/menus/useMenuRecordNavigation.ts',
        import.meta.url
      ),
      'utf8'
    )
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/export /g, '')
  const create = compileFunction(
    source + '\nreturn useMenuRecordNavigation;',
    Object.keys(dependencies)
  )(...Object.values(dependencies))
  return {
    navigation: create(),
    uid,
    selectedId,
    config,
    visits,
    leave: () =>
      afterEach.forEach((fn) => fn({ path: '/workspace/kitchen/menus' })),
    expire: () => {
      now += 60_001
    },
  }
}

test('legacy and programmatic entries carry one intent to a clean canonical URL', async () => {
  const { navigation, visits } = fixture()
  await navigation.openView('food menu', 'publishing', true)
  assert.deepEqual(visits, [
    {
      path: '/workspace/kitchen/menus/food%20menu',
      options: { replace: true },
    },
  ])
  assert.equal(navigation.entryView('food menu'), 'publishing')
  assert.equal(
    navigation.entryView('food menu'),
    'publishing',
    'a Nuxt remount retains the route-entry intent'
  )
  navigation.clearView()
  assert.equal(navigation.entryView('food menu'), null)
})

test('intents cannot leak across user, Kitchen, App, slug or expired navigation', () => {
  for (const change of [
    (f) => {
      f.uid.value = 'user-b'
    },
    (f) => {
      f.selectedId.value = 'kitchen-b'
    },
    (f) => {
      f.config.appId = 'another'
    },
    (f) => f.expire(),
  ]) {
    const f = fixture()
    f.navigation.rememberView('food', 'source')
    change(f)
    assert.equal(f.navigation.entryView('food'), null)
  }
  const { navigation } = fixture()
  navigation.rememberView('food', 'source')
  assert.equal(navigation.entryView('drinks'), null)
  navigation.clearView()
  assert.equal(navigation.entryView('food'), null)
})

test('opening a link in another tab does not leave an intent in the current tab', () => {
  const { navigation } = fixture()
  navigation.rememberView('food', 'content', { button: 0, metaKey: true })
  assert.equal(navigation.entryView('food'), null)
})

test('leaving the destination clears the route-entry intent', () => {
  const { navigation, leave } = fixture()
  navigation.rememberView('food', 'content')
  leave()
  assert.equal(navigation.entryView('food'), null)
})
