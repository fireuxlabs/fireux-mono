import { resolveHttpDocumentOutcome } from '../../../../core/fireux-core/src/runtime/utils/http-document-outcome.ts'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { test } from 'node:test'
import { computed, ref } from 'vue'
import { resolveReadOutcome } from '../../../../core/fireux-core/src/runtime/utils/read-outcome.ts'

for (const [folder, suffix] of [
  ['catalogue', 'Catalogue'],
  ['ingredients', 'Ingredients'],
  ['items', 'Items'],
]) {
  test(`${suffix} uses the live Supplier identity projection rather than a hydrated root field`, () => {
    const source = readFileSync(
      new URL(
        `../runtime/supplier/composables/workspace/${folder}/useSupplierWorkspace${suffix}.ts`,
        import.meta.url
      ),
      'utf8'
    )
      .replace(/^import .* from .+\n/gm, '')
      .replace(/^export /gm, '')
    const id = ref('a'),
      place = ref({ name: 'Alpha', short_name: 'A' })
    const workspace = {
      id,
      data: ref({
        id: 'a',
        company_id: 'place-a',
        identity: { status: 'active' },
        catalogue: { mode: 'directory_only' },
      }),
      outcome: ref('ready'),
    }
    const rows = {
      collectionPath: ref(''),
      supplierCatalogues: ref([]),
      supplierItems: ref([]),
      supplierIngredients: ref([]),
      pending: ref(false),
      error: ref(null),
      outcome: ref('empty'),
    }
    const state = compileFunction(
      `${stripTypeScriptTypes(source)}; return useSupplierWorkspace${suffix}()`,
      [
        'resolveReadOutcome',
        'resolveHttpDocumentOutcome',
        'computed',
        'SupplierStorage',
        'useSupplierWorkspace',
        'useSupplierDetail',
        'useSupplierCatalogueCollection',
        'useSupplierItemCollection',
        'useSupplierIngredientCollection',
        'useSupplierIngredientRoots',
      ]
    )(
      resolveReadOutcome,
      resolveHttpDocumentOutcome,
      computed,
      { collection: 'suppliers' },
      () => workspace,
      (target) => {
        assert.equal(target, id)
        return { place }
      },
      () => rows,
      () => rows,
      () => rows,
      () => ({
        rootById: ref(new Map()),
        pending: ref(false),
        error: ref(null),
        outcome: ref('empty'),
      })
    )
    assert.equal(state.supplierLabel.value, 'A')
    place.value = null
    assert.equal(state.supplierLabel.value, '')
    id.value = 'b'
    place.value = { name: 'Beta' }
    assert.equal(state.supplierLabel.value, 'Beta')
  })
}
