import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed } from 'vue'

function load(relative, name, bindings) {
  const source = readFileSync(new URL(relative, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replaceAll('import.meta.dev', 'false')
    .replace(/^export /gm, '')
  return compileFunction(
    stripTypeScriptTypes(source) + `\nreturn ${name}`,
    Object.keys(bindings)
  )(...Object.values(bindings))
}
const normalize = (value) => String(value || '').trim().toLowerCase().replace(/^kitchens$/, 'kitchen')
function entry({ origin = 'http://localhost:3001', role = 'global', config = {}, routes, family = 'kitchen' } = {}) {
  const calls = []
  const useEntry = load('../runtime/workspace/composables/useWorkspaceEntryCta.ts', 'useWorkspaceEntryCta', {
    computed,
    useRequestURL: () => new URL(origin),
    useRouter: () => ({ getRoutes: () => routes || [{ path: '/', meta: { nav: { key: 'workspace-kitchen' } } }] }),
    useFireUXConfig: () => ({ role, workspaces: ['kitchen'], workspaceConfig: config }),
    navigateTo: (to, options) => { calls.push({ to, options }); return calls.at(-1) },
    normalizeWorkspaceFamily: normalize,
    toWorkspaceFamilyPath: (key) => `/workspace/${key}`,
    toWorkspaceFamilyLabel: (key) => key[0].toUpperCase() + key.slice(1),
  })
  return { value: useEntry(family), calls }
}

test('public links open the declared Workspace origin while internal return paths stay local', () => {
  const { value } = entry({ config: { kitchen: { origin: 'http://workspace.localhost:3001' } } })
  assert.equal(value.workspaceEntryPath.value, '/')
  assert.equal(value.workspaceEntryHref.value, 'http://workspace.localhost:3001/')
  assert.equal(value.workspaceActions.value[0].path, value.workspaceEntryHref.value)
  assert.equal(value.homePath('kitchen'), '/')
})

test('Workspace Home links remain internal on the Workspace host', () => {
  const origin = 'http://workspace.localhost:3001'
  const { value, calls } = entry({ origin, config: { kitchen: { origin } } })
  assert.equal(value.workspaceEntryHref.value, '/')
  value.openWorkspace({ kitchenId: 'allowed-kitchen', source: 'operator' })
  assert.deepEqual(calls, [{ to: '/?kitchenId=allowed-kitchen&source=operator', options: { external: false } }])
})

test('public operator intent preserves its Kitchen query and explicitly crosses origins', () => {
  const { value, calls } = entry({ config: { kitchen: { origin: 'http://workspace.localhost:3001' } } })
  value.openWorkspace({ kitchenId: 'allowed/kitchen + 2' })
  assert.deepEqual(calls[0], {
    to: 'http://workspace.localhost:3001/?kitchenId=allowed%2Fkitchen+%2B+2', options: { external: true },
  })
})

test('Apps without a split origin and tenant entrances retain their registered mechanics', () => {
  const routes = [{ path: '/workspace/kitchen', meta: { nav: { key: 'workspace-kitchen' } } }]
  for (const role of ['global', 'tenant']) {
    const { value } = entry({ role, routes })
    assert.equal(value.workspaceEntryPath.value, '/workspace/kitchen')
    assert.equal(value.workspaceEntryHref.value, '/workspace/kitchen')
    assert.equal(value.homePath('kitchen'), '/workspace/kitchen')
  }
})

test('unknown families cannot borrow another Workspace origin', () => {
  const { value, calls } = entry({ family: 'property', config: { kitchen: { origin: 'http://workspace.localhost:3001' } } })
  assert.equal(value.workspaceEntryHref.value, '/')
  value.openWorkspace()
  assert.deepEqual(calls[0], { to: '/', options: { external: false } })
})

test('runtime projection accepts only ordinary origins and excludes embedded credentials', () => {
  for (const candidate of ['javascript:alert(1)', 'file:///tmp/a', 'https://user:password@example.org', 'not a URL']) {
    const useConfig = load('../runtime/app/composables/config/FireUXConfig.ts', 'useFireUXConfig', {
      useRuntimeConfig: () => ({ public: { fireux: {
        ecosystem: 'misebox', projectId: 'misebox', ecosystemId: 'misebox', id: 'misebox-app',
        name: 'Misebox', shortName: 'Misebox', role: 'global', workspaceConfig: { kitchen: { origin: candidate } },
      } } }),
    })
    assert.equal(useConfig().workspaceConfig.kitchen?.origin, undefined)
  }
})
