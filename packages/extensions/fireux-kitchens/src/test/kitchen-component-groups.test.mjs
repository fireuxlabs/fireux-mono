import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'

const root = fileURLToPath(new URL('../runtime/kitchen/components/', import.meta.url))
function files(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
    entry.isDirectory() ? files(join(dir, entry.name)) : [join(dir, entry.name)]
  )
}

test('Kitchen groups stable capabilities and keeps Workspace mechanics separate', () => {
  for (const child of ['Items', 'Menus', 'Promotions', 'Services']) {
    assert.ok(existsSync(join(root, 'FoodAndDrink', child, 'Index.vue')))
    assert.ok(existsSync(join(root, 'FoodAndDrink', child, 'Overview.vue')))
  }
  for (const child of ['Recipes', 'Ingredients', 'Stations', 'PrepItems'])
    assert.ok(existsSync(join(root, 'PrepAndProduction', child)))
  assert.ok(existsSync(join(root, 'PrepAndProduction', 'Planning.vue')))
  assert.doesNotMatch(readFileSync(join(root, 'PrepAndProduction', 'Index.vue'), 'utf8'), /WorkspaceGroupPage/)
  for (const child of ['Finance', 'Identity', 'Team'])
    assert.ok(existsSync(join(root, child, 'Index.vue')))
  assert.deepEqual(readdirSync(join(root, 'Workspace')).filter(name =>
    !name.endsWith('.vue')
  ).sort(), ['AI', 'Collection', 'Home', 'Navigation', 'Overview', 'Research', 'Selector', 'Test', 'Tools'])
})

test('component registration uses current owner paths without retired-name aliases', () => {
  const registration = readFileSync(new URL('../config/module/components-config.ts', import.meta.url), 'utf8')
  assert.match(registration, /runtime\/kitchen\/components'/)
  assert.match(registration, /prefix: 'Kitchen'/)
  assert.match(registration, /ignore: \['Workspace\/\*\*'\]/)
  const sources = files(root).filter(path => path.endsWith('.vue')).map(path => readFileSync(path, 'utf8')).join('\n')
  assert.doesNotMatch(sources, /WorkspaceKitchen(?:Dishes|Menus|Offerings|Recipes|Ingredients|Promotions|Finance|Identity|Team)/)
  for (const name of ['KitchenFoodAndDrinkServices', 'KitchenFoodAndDrinkItemsOverview', 'KitchenPrepAndProductionRecipes'])
    assert.ok(sources.includes(name), name)
})
