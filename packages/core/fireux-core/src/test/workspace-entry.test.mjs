import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref, watch } from 'vue'
import * as routes from '../runtime/composables/fireux/workspace/workspaceRoutes.ts'
import {
  resolvePostAuthDestination,
  userOnboardingPath,
} from '../runtime/utils/onboarding-route.ts'

const source = readFileSync(
  new URL(
    '../runtime/composables/fireux/workspace/useWorkspaceEntryCta.ts',
    import.meta.url
  ),
  'utf8'
)
  .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
  .replace(/^export /gm, '')
const createEntry = (config, family, entryPath = '/') =>
  compileFunction(
    `${stripTypeScriptTypes(source)}; return useWorkspaceEntryCta(family)`,
    [
      'family',
      'computed',
      'useFireUXConfig',
      'useRouter',
      'useRequestURL',
      'navigateTo',
      'normalizeWorkspaceFamily',
      'toWorkspaceFamilyLabel',
      'toWorkspaceFamilyPath',
    ]
  )(
    family,
    computed,
    () => ({ workspaceConfig: {}, ...config }),
    () => ({
      getRoutes: () => [
        {
          path: entryPath,
          meta: { nav: { key: `workspace-${family || config.workspaces[0]}` } },
        },
      ],
    }),
    () => new URL('http://localhost:3001'),
    (target) => target,
    routes.normalizeWorkspaceFamily,
    routes.toWorkspaceFamilyLabel,
    routes.toWorkspaceFamilyPath
  )

test('tenant workspace actions open the enabled family without replacing the customer root', () => {
  const entry = createEntry({ role: 'tenant', workspaces: ['kitchen'] })
  assert.equal(entry.workspaceEntryPath.value, '/workspace/kitchen')
  assert.equal(entry.workspaceActions.value[0].path, '/workspace/kitchen')
})

test('global and standalone workspace entries retain their root and empty Apps have no action', () => {
  for (const role of ['global', 'standalone']) {
    assert.equal(
      createEntry({ role, workspaces: ['kitchen'] }).workspaceEntryPath.value,
      '/'
    )
  }
  const entry = createEntry({ role: 'tenant', workspaces: [] })
  assert.equal(entry.hasWorkspaceEntry.value, false)
  assert.equal(entry.workspaceEntryPath.value, '/')
})

test('a public landing keeps Workspace return links on the explicit App entry route', () => {
  const entry = createEntry(
    { role: 'global', workspaces: ['kitchen'] },
    'kitchen',
    '/workspace/kitchen'
  )
  assert.equal(entry.workspaceEntryPath.value, '/workspace/kitchen')
  assert.equal(entry.workspaceActions.value[0].path, '/workspace/kitchen')
})

test('auth return preserves workspace query and hash through User setup', () => {
  const destination = '/workspace/kitchen/menus?menu=food#editor'
  assert.equal(resolvePostAuthDestination(destination), destination)
  const setup = userOnboardingPath(destination)
  assert.equal(resolvePostAuthDestination(setup), destination)
  assert.equal(resolvePostAuthDestination(undefined), '/dashboard')
})

test('auth return rejects external destinations and auth loops', () => {
  for (const value of [
    'https://example.com',
    '//example.com',
    '/\\example.com',
    '/\n/example.com',
    '/auth',
    '/auth/?redirect=/workspace/kitchen',
  ]) {
    assert.equal(resolvePostAuthDestination(value), '/dashboard', value)
  }
})

function workspaceGuard(
  config,
  { server = false, authenticated = false, registeredHome = true } = {}
) {
  const source = readFileSync(
    new URL(
      '../runtime/middleware/fireux-workspace.global.ts',
      import.meta.url
    ),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace('export default ', 'const middleware = ')
    .replaceAll('import.meta.server', String(server))
    .replaceAll('import.meta.dev', 'true')
  const bindings = {
    defineNuxtRouteMiddleware: (callback) => callback,
    navigateTo: (target) => target,
    useRuntimeConfig: () => ({ public: { fireux: config } }),
    useWorkspaceEntryCta: () => createEntry(config),
    normalizeWorkspaceFamily: routes.normalizeWorkspaceFamily,
    workspaceFamilyFromRouteContext: routes.workspaceFamilyFromRouteContext,
    useRouter: () => ({
      currentRoute: ref({ fullPath: '/' }),
      getRoutes: () => registeredHome ? [{ path: '/workspace' }] : [],
    }),
    createClientRouteCheck: () => ({
      signal: new AbortController().signal,
      dispose() {},
    }),
    resolveClientAuthState: async () => ({ isAuthenticated: authenticated }),
  }
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return middleware`,
    Object.keys(bindings)
  )(...Object.values(bindings))
}

test('server and client resolve the same workspace entrance for tenant and global Apps', async () => {
  for (const server of [true, false]) {
    for (const [role, expected] of [
      ['tenant', '/workspace/kitchen'],
      ['global', '/'],
    ]) {
      const guard = workspaceGuard(
        { role, workspaces: ['kitchen'] },
        { server }
      )
      assert.equal(await guard({ path: '/workspace', meta: {} }), expected)
    }
  }
})

test('guest workspace access retains the full destination and authenticated access proceeds', async () => {
  const target = {
    path: '/workspace/kitchen/menus',
    fullPath: '/workspace/kitchen/menus?menu=food',
    query: {},
    meta: { requiresAuth: true },
  }
  const config = { role: 'tenant', workspaces: ['kitchen'] }
  assert.deepEqual(await workspaceGuard(config)(target), {
    path: '/auth',
    query: { redirect: target.fullPath },
  })
  assert.equal(
    await workspaceGuard(config, { authenticated: true })(target),
    undefined
  )
})

test('Kitchen return targets stay in Kitchen when another tenant workspace is first', () => {
  const config = { role: 'tenant', workspaces: ['supplier', 'kitchen'] }
  assert.equal(
    createEntry(config, 'kitchen').workspaceEntryPath.value,
    '/workspace/kitchen'
  )
  assert.equal(
    createEntry({ ...config, role: 'global' }, 'kitchen').workspaceEntryPath
      .value,
    '/'
  )
})

test('a removed generic Workspace page is not recreated by a middleware redirect', async () => {
  for (const server of [true, false]) {
    const guard = workspaceGuard(
      { role: 'global', workspaces: ['kitchen'] },
      { server, registeredHome: false }
    )
    assert.equal(await guard({ path: '/workspace', meta: {} }), undefined)
  }
})
