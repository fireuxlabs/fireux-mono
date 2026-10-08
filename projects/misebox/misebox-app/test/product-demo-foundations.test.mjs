import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

function load(path, name) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export \{[\s\S]*?\} from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(`${stripTypeScriptTypes(source)}; return ${name}`)()
}
const project = load(
  '../app/composables/product-demo/projectMiseboxProductDemoWorkspaceFoundations.ts',
  'projectMiseboxProductDemoWorkspaceFoundations'
)
const readKitchenTableCount = load(
  '../../../../packages/extensions/fireux-kitchens/src/runtime/kitchen/utils/kitchen-readers.ts',
  'readKitchenTableCount'
)
function inputs(kitchen, configuration = {}) {
  return {
    workspaceScenario: {
      kitchen,
      configuration,
      finance: {},
      stations: [],
      kitchenIngredients: [],
    },
    workspaceMenuCascade: { ingredients: [] },
    kitchenSpineModule: { readKitchenTableCount },
    financeModule: {
      projectKitchenDemoFinanceSummary: () => ({
        currencyCode: 'CHF',
        minorUnitDigits: 2,
        saleCount: 0,
        grossSalesMinor: 0,
        averageSaleMinor: 0,
      }),
    },
    loadIngredientRoots: async () => [],
  }
}

test('Product Demo reads the canonical Kitchen table count, not retired configuration data', async () => {
  const result = await project(
    inputs({ tables: { count: 8 } }, { tables: { count: 99 } })
  )
  assert.equal(result.workspaceTableCount, 8)
})
test('Missing tables do not block the Product Demo foundations projection', async () => {
  const result = await project(inputs({}, { tables: { count: 99 } }))
  assert.equal(result.workspaceTableCount, 0)
  assert.deepEqual(result.workspaceIngredients, [])
  assert.equal(result.workspaceFinancePeriods.length, 3)
})

test('An explicit zero table count is a valid unconfigured Product Demo state', async () => {
  const result = await project(
    inputs({ tables: { count: 0 } }, { tables: { count: 99 } })
  )
  assert.equal(result.workspaceTableCount, 0)
})
