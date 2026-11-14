import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { ref, reactive, effectScope, nextTick } from 'vue'
import { useCommandScope } from 'fireux-core/runtime/composables/fireux/commands/useCommandScope'
import { useIdentityEditor } from 'fireux-core/runtime/composables/fireux/useIdentityEditor'
import { isFirestoreDocumentId } from 'fireux-core/runtime/utils/firestore-document-id'
import { readRecipeChanges } from '../../runtime/kitchen/recipe/changes.ts'
import {
  recipeDraft,
  recipeDraftChanges,
} from '../../runtime/kitchen/recipe/editor.ts'
import { readPreparationChanges } from '../../runtime/kitchen/preparation/changes.ts'
function load(path, result, deps) {
  let source = readFileSync(
    new URL(`../../runtime/kitchen/${path}`, import.meta.url),
    'utf8'
  )
  if (path.endsWith('.vue'))
    source = source.split('<script setup lang="ts">')[1].split('</script>')[0]
  source = source
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
  return new Function(
    ...Object.keys(deps),
    `${stripTypeScriptTypes(source)};return ${result}`
  )(...Object.values(deps))
}
const error = (input) => Object.assign(new Error(input.statusMessage), input)
const fields = (input, allowed) => {
  if (
    !input ||
    typeof input !== 'object' ||
    Array.isArray(input) ||
    Object.keys(input).some((key) => !allowed.includes(key))
  )
    throw error({ statusCode: 400, statusMessage: 'Invalid input' })
  return input
}
const validate = (read) => {
  try {
    return read()
  } catch (cause) {
    throw error({ statusCode: 400, statusMessage: cause.message })
  }
}
const target = (value) => value.collectionPath
function fixture() {
  const records = new Map([
    ['kitchens/k/prep-items/sauce', { name: 'Sauce' }],
    ['kitchens/k/prep-items/finished', { name: 'Dish' }],
    [
      'kitchens/k/recipes/r',
      {
        name: 'Recipe',
        created: { at: 1 },
        preparation: { method: ['Old'] },
        other: 'keep',
      },
    ],
    ['kitchens/k/ingredients/flour', { ingredient_id: 'flour' }],
    ['ingredients/flour', { name: 'Flour', status: 'active' }],
  ])
  const writes = [],
    reads = []
  let allowed = true,
    wait = null,
    retry = null
  const deps = {
    createError: error,
    readRecipeChanges,
    readPreparationChanges,
    recipeFields: fields,
    validateRecipeInput: validate,
    recipeTarget: (id) => ({ collectionPath: `kitchens/${id}/recipes` }),
    defineFirestoreMutationTarget: (value) => value,
    requireFirestoreDocumentId: (id) => {
      if (!isFirestoreDocumentId(id))
        throw error({ statusCode: 400, statusMessage: 'Invalid id' })
      return id
    },
    serverAuditStamp: () => ({ by: 'actor' }),
    readRecipeUpdate: readRecipeChanges,
    mergeRecipeUpdate: (_before, patch) => patch,
    readKitchenMutationActor: async () => {
      if (wait) await wait
      return { uid: 'actor' }
    },
    requireKitchenRecordMutationAuthority: async () => {
      if (!allowed)
        throw error({ statusCode: 403, statusMessage: 'Membership revoked' })
    },
    requireRecipePreparationReferences: () => {
      throw Error('Legacy write branch should not run')
    },
    requireKitchenIngredientReferences: async (tx, k, ids) => {
      for (const id of ids) {
        const link = await tx.read(
            { collectionPath: `kitchens/${k}/ingredients` },
            id
          ),
          ingredient = await tx.read({ collectionPath: 'ingredients' }, id)
        if (
          !link.exists ||
          link.data.ingredient_id !== id ||
          !ingredient.exists ||
          ingredient.data.status !== 'active'
        )
          throw error({
            statusCode: 409,
            statusMessage: 'Ingredient unavailable',
          })
      }
    },
    runGuardedServerTransaction: async (_scope, work) => {
      const run = async (commit) => {
        const staged = []
        const result = await work({
          read: async (t, id) => {
            assert.equal(staged.length, 0)
            const path = `${target(t)}/${id}`
            reads.push(path)
            return { exists: records.has(path), data: records.get(path) }
          },
          update: (t, id, data) =>
            staged.push({ path: `${target(t)}/${id}`, data }),
        })
        if (commit)
          for (const row of staged) {
            writes.push(row)
            records.set(row.path, { ...records.get(row.path), ...row.data })
          }
        return result
      }
      if (retry) {
        await run(false)
        retry()
      }
      return run(true)
    },
  }
  deps.requireRecipeDefinitionReferences = load(
    'recipe/server/references.ts',
    'requireRecipeDefinitionReferences',
    deps
  )
  const updateRecipe = load('server/recipes/update.ts', 'updateRecipe', deps),
    updatePreparation = load(
      'preparation/server/update.ts',
      'updatePreparation',
      deps
    )
  return {
    records,
    writes,
    reads,
    updateRecipe,
    updatePreparation,
    revoke: () => {
      allowed = false
    },
    wait: (value) => {
      wait = value
    },
    retry: (fn) => {
      retry = fn
    },
  }
}
const recipe = () => ({
  id: 'r',
  name: 'Recipe',
  inputs: [
    { kind: 'ingredient', reference_id: 'flour', quantity: 100, unit: 'g' },
  ],
  method: ['Mix'],
  yield: { quantity: 1, unit: 'portion' },
  output_preparation_id: 'finished',
})

test('Prep and Recipe changes reject protected fields, invalid quantities and unsafe sources; values are detached', () => {
  for (const value of [
    { id: 'x' },
    { created: {} },
    { name: '' },
    { description: null },
  ])
    assert.throws(() => readPreparationChanges(value))
  for (const value of [
    { updated: {} },
    {
      inputs: [
        { kind: 'ingredient', reference_id: 'a/b', quantity: 1, unit: 'g' },
      ],
    },
    { yield: { quantity: Infinity, unit: 'g' } },
    { method: [''] },
    { source: { title: 'Bad', url: 'javascript:alert(1)' } },
  ])
    assert.throws(() => readRecipeChanges(value))
  const raw = { inputs: recipe().inputs }
  const patch = readRecipeChanges(raw)
  raw.inputs[0].quantity = 9
  assert.equal(patch.inputs[0].quantity, 100)
  assert.deepEqual(
    readRecipeChanges({
      yield: null,
      source: null,
      output_preparation_id: null,
    }),
    { yield: null, source: null, output_preparation_id: null }
  )
})
test('Recipe draft sends only edited fields; numeric controls convert at the UI boundary', () => {
  const baseline = recipeDraft(recipe()),
    draft = structuredClone(baseline)
  draft.method.push('Serve')
  draft.inputs[0].quantity = '200'
  assert.deepEqual(recipeDraftChanges(draft, baseline), {
    inputs: [{ ...recipe().inputs[0], quantity: 200, note: '' }],
    method: ['Mix', 'Serve'],
  })
  assert.deepEqual(recipeDraftChanges(baseline, baseline), {})
})
test('Preparation update is sparse, path scoped and preserves image, provenance and historical instructions', async () => {
  const f = fixture()
  f.records.set('kitchens/k/prep-items/sauce', {
    name: 'Sauce',
    image: 'photo',
    recipe_id: 'r',
    method: ['Legacy'],
    created: { at: 1 },
  })
  await f.updatePreparation(
    {},
    { kitchenId: 'k', preparationId: 'sauce', changes: { name: ' New sauce ' } }
  )
  assert.deepEqual(f.writes[0], {
    path: 'kitchens/k/prep-items/sauce',
    data: { name: 'New sauce', updated: { by: 'actor' } },
  })
  assert.equal(f.records.get('kitchens/k/prep-items/sauce').image, 'photo')
  f.revoke()
  await assert.rejects(
    f.updatePreparation(
      {},
      { kitchenId: 'k', preparationId: 'sauce', changes: { description: '' } }
    ),
    { statusCode: 403 }
  )
  assert.equal(f.writes.length, 1)
})
test('Recipe edit checks exact Ingredient and Preparation references and leaves legacy fields untouched', async () => {
  const f = fixture()
  await f.updateRecipe(
    {},
    {
      kitchenId: 'k',
      recipeId: 'r',
      changes: {
        inputs: recipe().inputs,
        output_preparation_id: 'finished',
        method: ['Bake'],
      },
    }
  )
  assert.ok(f.reads.includes('kitchens/k/ingredients/flour'))
  assert.ok(f.reads.includes('ingredients/flour'))
  assert.ok(f.reads.includes('kitchens/k/prep-items/finished'))
  assert.deepEqual(f.records.get('kitchens/k/recipes/r').preparation, {
    method: ['Old'],
  })
  assert.deepEqual(f.records.get('kitchens/k/recipes/r').created, { at: 1 })
  assert.equal(f.records.get('kitchens/k/recipes/r').other, 'keep')
})
test('missing/foreign references, self consumption and revoked authority reject before writes, including retry', async () => {
  for (const corrupt of [
    (f) => f.records.delete('kitchens/k/ingredients/flour'),
    (f) => f.records.set('ingredients/flour', { status: 'archived' }),
    (f) =>
      f.records.set('kitchens/k/prep-items/finished', { kitchen_id: 'other' }),
    (f) => f.revoke(),
  ]) {
    const f = fixture()
    corrupt(f)
    await assert.rejects(
      f.updateRecipe(
        {},
        {
          kitchenId: 'k',
          recipeId: 'r',
          changes: {
            inputs: recipe().inputs,
            output_preparation_id: 'finished',
          },
        }
      )
    )
    assert.equal(f.writes.length, 0)
  }
  const f = fixture()
  await assert.rejects(
    f.updateRecipe(
      {},
      {
        kitchenId: 'k',
        recipeId: 'r',
        changes: {
          output_preparation_id: 'sauce',
          inputs: [
            {
              kind: 'preparation',
              reference_id: 'sauce',
              quantity: 1,
              unit: 'portion',
            },
          ],
        },
      }
    ),
    /own output/
  )
  f.retry(() => f.records.delete('kitchens/k/prep-items/sauce'))
  await assert.rejects(
    f.updateRecipe(
      {},
      {
        kitchenId: 'k',
        recipeId: 'r',
        changes: {
          inputs: [
            {
              kind: 'preparation',
              reference_id: 'sauce',
              quantity: 1,
              unit: 'portion',
            },
          ],
        },
      }
    )
  )
  assert.equal(f.writes.length, 0)
})
test('Prep transport captures input before credentials and stops obsolete account/Kitchen continuations', async () => {
  const scope = effectScope(),
    user = ref({
      uid: 'u',
      getIdToken: () =>
        new Promise((resolve) => {
          release = resolve
        }),
    }),
    access = { outcome: ref('ready'), ids: ref(['k']) },
    calls = []
  let release
  const api = scope.run(() =>
    load('composables/prep/usePrepMutation.ts', 'usePrepMutation', {
      useAuth: () => ({ currentUser: user }),
      useFireUXConfig: () => ({ appId: 'app' }),
      useAppSession: () => ({
        appUser: ref({ role: 'user' }),
        pending: ref(false),
        error: ref(null),
      }),
      useKitchenAccess: () => access,
      useCommandScope,
      isFirestoreDocumentId,
      $fetch: async (...args) => {
        calls.push(args)
        return { id: 'r' }
      },
    })()
  )
  const changes = { method: ['Mix'] },
    flight = api.update('recipes', 'k', 'r', changes, () => true)
  changes.method[0] = 'Changed'
  access.ids.value = []
  access.ids.value = ['k']
  release('token')
  await assert.rejects(flight, /changed/)
  assert.equal(calls.length, 0)
  scope.stop()
})
test('Preparation editor uses the shared lifecycle and preserves an open dirty draft through same-record refresh', async () => {
  const props = reactive({
      record: { id: 'sauce', name: 'Sauce', description: 'Original' },
      kitchenId: 'k',
      canEdit: true,
    }),
    calls = [],
    scope = effectScope()
  const api = scope.run(() =>
    load(
      'components/PrepAndProduction/PreparationEditor.vue',
      '({draft,open,start,save})',
      {
        ref,
        defineProps: () => props,
        useIdentityEditor,
        readPreparationChanges,
        usePrepMutation: () => ({
          update: async (...args) => {
            calls.push(args)
            return { id: 'sauce' }
          },
        }),
      }
    )
  )
  api.start()
  api.draft.value.name = 'Updated'
  props.record = { ...props.record, description: 'Remote' }
  await nextTick()
  assert.equal(api.draft.value.name, 'Updated')
  assert.equal(api.open.value, true)
  await api.save()
  assert.deepEqual(calls[0][3], { name: 'Updated' })
  props.kitchenId = 'other'
  await nextTick()
  assert.equal(api.open.value, false)
  scope.stop()
})
