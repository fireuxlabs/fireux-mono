import assert from 'node:assert/strict'
import test from 'node:test'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const root = fileURLToPath(
  new URL('../runtime/pages/workspace/kitchen/', import.meta.url)
)
const files = (directory) =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? files(join(directory, entry.name))
      : [join(directory, entry.name)]
  )
function navigation(file) {
  const script = readFileSync(file, 'utf8').match(
    /<script[^>]*>([\s\S]*?)<\/script>/
  )?.[1]
  if (!script) return
  const source = ts.createSourceFile(
    file,
    script,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS
  )
  let nav
  const visit = (node) => {
    if (
      ts.isCallExpression(node) &&
      node.expression.getText(source) === 'definePageMeta'
    ) {
      nav = Function(`return (${node.arguments[0].getText(source)})`)().nav
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  return nav
}
const destinations = files(root)
  .filter((file) => file.endsWith('.vue'))
  .flatMap((file) => {
    const nav = navigation(file)
    if (!nav || nav.hidden || nav.desktop === false) return []
    const to =
      '/workspace/kitchen/' +
      relative(root, file)
        .replace(/\.vue$/, '')
        .replace(/\/index$/, '')
    return nav.children?.length
      ? nav.children.map((child) => ({ ...child, group: nav.label }))
      : [{ label: nav.label, to, group: nav.group }]
  })

test('Kitchen primary navigation has unique destinations backed by actual pages', () => {
  assert.ok(destinations.length > 0)
  const seen = new Set()
  for (const item of destinations) {
    assert.ok(!seen.has(item.to), `Duplicate destination: ${item.to}`)
    seen.add(item.to)
    assert.ok(
      !item.to.includes('?view='),
      `Page view needs a child route: ${item.to}`
    )
    const path = item.to.split('#')[0].replace('/workspace/kitchen/', '')
    assert.ok(
      existsSync(join(root, path + '.vue')) ||
        existsSync(join(root, path, 'index.vue')),
      `Missing page: ${item.to}`
    )
  }
})

test('Kitchen sidebar groups retain route parents with the explicit direct Menus exception', () => {
  const prefixes = new Map()
  for (const item of destinations.filter((item) => item.group)) {
    if (item.to === '/workspace/kitchen/menus') {
      assert.equal(item.group, 'Menus & Recipes')
      assert.equal(item.label, 'Menus')
      continue
    }
    const prefix = item.to.split(/[?#]/)[0].split('/')[3]
    if (prefixes.has(item.group))
      assert.equal(prefix, prefixes.get(item.group), item.to)
    else prefixes.set(item.group, prefix)
  }
  assert.equal(
    new Set(prefixes.values()).size,
    prefixes.size,
    'Groups must not share competing route parents'
  )
  assert.equal(
    destinations.filter((item) => item.to === '/workspace/kitchen/menus')
      .length,
    1
  )
})

test('Menu record, import and research routes all live in the direct Menu subtree', () => {
  const expected = [
    'index.vue',
    'create.vue',
    'uploads/[uploadId].vue',
    '[menuSlug]/index.vue',
    '[menuSlug]/content.vue',
    '[menuSlug]/publishing.vue',
    '[menuSlug]/source.vue',
    '[menuSlug]/[sectionId].vue',
    'search-demand/index.vue',
    'search-demand/analysis.vue',
    'search-demand/tools.vue',
  ]
  for (const file of expected)
    assert.ok(existsSync(join(root, 'menus', file)), file)
  assert.equal(existsSync(join(root, 'food', 'menus')), false)
})
