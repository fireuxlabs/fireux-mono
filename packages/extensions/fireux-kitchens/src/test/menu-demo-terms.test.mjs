import test from 'node:test'
import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
const hooks = registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith('.') && context.parentURL) {
      const url = new URL(specifier, context.parentURL)
      for (const suffix of ['.ts', '/index.ts'])
        if (existsSync(fileURLToPath(url) + suffix))
          return next(url.href + suffix, context)
    }
    return next(specifier, context)
  },
})
test('complete Demo scenarios and public manifests resolve commercial terms from Dishes', async () => {
  try {
    const { kitchenDemoScenarios } = await import(
      '../runtime/kitchen/demo/scenarios.ts'
    )
    const { kitchenDemoManifest } = await import(
      '../runtime/kitchen/demo/presentation/index.ts'
    )
    assert.equal(kitchenDemoScenarios.length, 3)
    for (const scenario of kitchenDemoScenarios) {
      const manifest = kitchenDemoManifest(scenario)
      const dishes = new Map(scenario.dishes.map((dish) => [dish.id, dish]))
      for (const section of manifest.content.sections)
        for (const item of section.items) {
          const dish = dishes.get(item.dishId)
          assert.ok(dish)
          assert.equal(item.price, dish.price)
          assert.deepEqual(
            item.priceOptions.map((option) => option.price),
            dish.price_options.map((option) => option.price)
          )
          assert.deepEqual(
            item.addOns.map((option) => option.price),
            dish.add_ons.map((option) => option.price)
          )
        }
      for (const menu of scenario.menus)
        for (const section of menu.menuSections)
          for (const item of section.items) {
            assert.equal(Object.hasOwn(item, 'price'), false)
            assert.equal(Object.hasOwn(item, 'price_options'), false)
            assert.equal(Object.hasOwn(item, 'add_ons'), false)
          }
    }
  } finally {
    hooks.deregister()
  }
})
