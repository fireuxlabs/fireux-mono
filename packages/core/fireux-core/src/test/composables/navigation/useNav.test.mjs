import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, reactive, ref, toValue } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import {
  isNavVisibleForScope,
  normaliseNavVisibility,
} from '../../../runtime/utils/navigation/visibility.ts'

const source = readFileSync(
  new URL('../../../runtime/composables/navigation/useNav.ts', import.meta.url),
  'utf8'
)
  .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  .replace(/^export /gm, '')

function navigation(
  routes,
  appConfig = reactive({ navigation: {} }),
  target = ref('default')
) {
  const router = createRouter({ history: createMemoryHistory(), routes })
  const scope = reactive({
    appId: 'test-app',
    role: 'global',
    isGlobal: true,
    isTenant: false,
    isStandalone: false,
    ecosystem: 'test',
    modules: ['test-domain'],
    domains: [],
    profiles: [],
  })
  const useNav = compileFunction(
    `${stripTypeScriptTypes(source)}; return useNav`,
    [
      'computed',
      'toValue',
      'useRouter',
      'useFireUXConfig',
      'useAppConfig',
      'isNavVisibleForScope',
      'normaliseNavVisibility',
    ]
  )(
    computed,
    toValue,
    () => router,
    () => scope,
    () => appConfig,
    isNavVisibleForScope,
    normaliseNavVisibility
  )
  return { ...useNav(target), router, scope, target, appConfig }
}

const page = (path, meta = {}, children) => ({
  path,
  component: { render: () => null },
  meta,
  ...(children ? { children } : {}),
})
const keys = (state) => state.items.value.map((item) => item.key).sort()

test('navigation opt-in and its default menu are independent of every native layout shape', () => {
  const state = navigation([
    page('/no-nav', { layout: 'workspace' }),
    page('/hidden', {
      layout: 'workspace',
      nav: { key: 'hidden', hidden: true },
    }),
    page('/unspecified', { nav: { key: 'unspecified' } }),
    page('/named', { layout: 'workspace', nav: { key: 'named' } }),
    page('/bare', { layout: false, nav: { key: 'bare' } }),
    page('/object', {
      layout: { name: 'workspace', props: { compact: true } },
      nav: { key: 'object' },
    }),
    page('/empty', { layout: 'dashboard', nav: { key: 'empty', menus: [] } }),
    page('/parent', { layout: 'workspace' }, [
      page('child', { nav: { key: 'inherited' } }),
    ]),
    page('/explicit', {
      layout: 'default',
      nav: { key: 'workspace', menus: ['workspace'] },
    }),
    page('/multiple', {
      nav: { key: 'multiple', menus: ['workspace', 'dashboard'] },
    }),
  ])
  assert.deepEqual(keys(state), [
    'bare',
    'empty',
    'inherited',
    'named',
    'object',
    'unspecified',
  ])
  for (const item of state.items.value) {
    assert.deepEqual(item.menus, ['default'])
    assert.equal(item.requiresAuth, false)
    assert.equal(item.requiresSelection, undefined)
  }
  state.target.value = 'workspace'
  assert.deepEqual(keys(state), ['multiple', 'workspace'])
  state.target.value = ['dashboard', 'workspace']
  assert.deepEqual(keys(state), ['multiple', 'workspace'])
  state.target.value = []
  assert.deepEqual(keys(state), [
    'bare',
    'empty',
    'inherited',
    'named',
    'object',
    'unspecified',
  ])
})

test('App placement overrides precede defaults and preserve the inherited descriptor', () => {
  const appConfig = reactive({
    navigation: {
      hiddenKeys: ['hidden-by-app'],
      overrides: {
        linked: { menus: ['default', 'workspace'], label: 'App label' },
      },
    },
  })
  const state = navigation(
    [
      page('/linked', {
        requiresAuth: true,
        requiresSelection: true,
        roles: ['admin'],
        visibility: { modules: ['test-domain'] },
        nav: { key: 'linked', label: 'Domain label', menus: ['dashboard'] },
      }),
      page('/hidden-by-app', { nav: { key: 'hidden-by-app' } }),
    ],
    appConfig
  )
  assert.deepEqual(keys(state), ['linked'])
  assert.equal(state.items.value[0].label, 'App label')
  assert.equal(state.items.value[0].requiresAuth, true)
  assert.equal(state.items.value[0].requiresSelection, true)
  assert.deepEqual(state.items.value[0].roles, ['admin'])
  assert.deepEqual(state.items.value[0].visibility, {
    modules: ['test-domain'],
  })
  assert.deepEqual(
    state.router.getRoutes().find((route) => route.path === '/linked').meta.nav
      .menus,
    ['dashboard']
  )
  state.target.value = 'workspace'
  assert.deepEqual(keys(state), ['linked'])
  appConfig.navigation.overrides.linked.menus = []
  assert.deepEqual(keys(state), [])
  state.target.value = 'default'
  assert.deepEqual(keys(state), ['linked'])
  state.scope.modules = []
  assert.deepEqual(keys(state), [])
})

test('hidden descriptors and aliases do not manufacture duplicate or unauthorized menu entries', () => {
  const state = navigation([
    { ...page('/canonical', { nav: { key: 'canonical' } }), alias: '/alias' },
    page('/tenant', { appRole: 'tenant', nav: { key: 'tenant' } }),
    page('/missing-domain', {
      visibility: { modules: ['missing'] },
      nav: { key: 'missing-domain' },
    }),
    page('/hidden', {
      nav: { key: 'hidden', hidden: true, menus: ['default', 'workspace'] },
    }),
  ])
  assert.deepEqual(keys(state), ['canonical'])
  state.target.value = 'workspace'
  assert.deepEqual(keys(state), [])
})
