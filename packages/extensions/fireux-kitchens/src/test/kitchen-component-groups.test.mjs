import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { stripTypeScriptTypes } from 'node:module'

const runtime = fileURLToPath(new URL('../runtime/', import.meta.url))
function registrations() {
  const scans = [],
    explicit = []
  const source = readFileSync(
    new URL('../config/module/components-config.ts', import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
  const configure = new Function(
    'registerComponentsDir',
    'addComponent',
    `${stripTypeScriptTypes(source)}; return configureComponents`
  )(
    (_resolver, path, options) => scans.push({ path, ...options }),
    (value) => explicit.push(value)
  )
  configure({
    resolve: (value) =>
      new URL('../' + value.replace(/^\.\//, ''), import.meta.url).pathname,
  })
  return { scans, explicit }
}

test('document Workspace groups register once under their Entity and retain the navigation integration ABI', () => {
  const { scans, explicit } = registrations()
  const workspace = scans.find(
    (scan) => scan.path === './runtime/kitchen/components/Workspace'
  )
  for (const name of ['Menu', 'Prep']) {
    const matches = scans.filter(
      (scan) => scan.path === `./runtime/kitchen/components/Workspace/${name}`
    )
    assert.equal(matches.length, 1)
    assert.equal(matches[0].prefix, `KitchenWorkspace${name}`)
    assert.ok(
      scans.indexOf(matches[0]) < scans.indexOf(workspace),
      'specific scan precedes the parent scan'
    )
    assert.equal(matches[0].pathPrefix, true)
    assert.ok(workspace.ignore.includes(`${name}/**`))
    assert.ok(
      existsSync(`${runtime}/kitchen/components/Workspace/${name}/Index.vue`)
    )
  }
  const neutral = scans.find(
    (scan) => scan.path === './runtime/kitchen/components'
  )
  assert.ok(neutral.ignore.includes('Workspace/**'))
  const navigation = explicit.find(
    (component) => component.name === 'WorkspaceKitchenNavigation'
  )
  assert.equal(navigation.global, true)
  assert.ok(navigation.filePath.endsWith('/Workspace/Navigation/Index.vue'))
})

test('group entrances compose their named responsibilities without preview markers or a second frame', () => {
  const menu = readFileSync(
    `${runtime}/kitchen/components/Workspace/Menu/Index.vue`,
    'utf8'
  )
  const prep = readFileSync(
    `${runtime}/kitchen/components/Workspace/Prep/Index.vue`,
    'utf8'
  )
  for (const source of [menu, prep]) {
    assert.doesNotMatch(
      source,
      /border-(?:red|blue|orange|purple|pink|green|yellow|cyan)-500|WorkspaceGroupPage|<NuxtPage/
    )
    assert.doesNotMatch(source, /\/>\s*[1-6](?:\s|$)/)
  }
  for (const child of [
    'Overview',
    'Create',
    'Ai',
    'ItemsOverview',
    'PromotionsOverview',
    'ServicesOverview',
  ])
    assert.ok(menu.includes(`<Menu.${child}`), child)
  const namespace = readFileSync(
    `${runtime}/kitchen/components/Workspace/Menu/index.ts`,
    'utf8'
  )
  for (const [, file] of namespace.matchAll(/from ['"]([^'"]+)['"]/g))
    assert.ok(
      existsSync(`${runtime}/kitchen/components/Workspace/Menu/${file}`)
    )
  assert.ok(prep.includes('<KitchenWorkspacePrepRecipesOverview'))
  assert.ok(prep.includes('<KitchenWorkspacePrepPreparationsOverview'))
})
