<template>
  <section class="space-y-10">
    <UCard>
      <DevModel
        :title="'Ingredients · Model'"
        :model="ingredientModelRuntime"
      />
    </UCard>

    <UCard>
      <template #header>
        <div class="flex items-start justify-between gap-3">
          <div class="space-y-3">
            <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Ingredients collection
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Browse ingredients resolved for this runtime and filter by model drift.
            </p>
            <DevDriftToolbar
              :drift-kind="driftKind"
              :selected-field="selectedField"
              :filter-options="filterOptions"
              :copy-label="'Copy drift · Ingredients'"
              :copy-payload="driftCopyPayload"
              @update:drift-kind="setDriftKind"
              @update:selected-field="setSelectedField"
            />
          </div>
        </div>
      </template>

      <IngredientCollectionManager :collection="filteredCollection" />
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { useDevDriftFilter } from 'fireux-core/runtime/composables/dev/useDevDriftFilter'
import { computed } from 'vue'
import { useIngredientFetch } from '../../../composables/fireux/firestore/objects/ingredient/fetch/useIngredientFetch'
import {
  Ingredient as IngredientModelRuntime,
  type Ingredient as IngredientType,
} from '../../../models/objects/ingredient.model'

defineOptions({ name: 'DevIngredientSystem' })

const ingredientModelRuntime = IngredientModelRuntime

const { ingredients } = useIngredientFetch()
const ingredientsCollection = computed<IngredientType[]>(() => ingredients.value ?? [])

const {
  driftKind,
  setDriftKind,
  selectedField,
  setSelectedField,
  filterOptions,
  filteredCollection,
  buildDriftPayload,
  buildCopyPayload,
} = useDevDriftFilter({
  collection: ingredientsCollection,
  runtimeModel: ingredientModelRuntime,
  driftMode: 'extras-only',
  requiredPaths: ['name', 'unit'],
})

const filteredDriftPayload = buildDriftPayload({
  map: ({ doc, id, drift }) => ({
    id,
    name: doc.name,
    unit: doc.unit,
    supplier: doc.supplier_name,
    drift,
  }),
})

const driftCopyPayload = buildCopyPayload({
  modelPath: 'packages/extensions/fireux-kitchens/src/runtime/models/objects/ingredient.model.ts',
  itemsKey: 'ingredients',
  items: filteredDriftPayload,
  total: computed(() => ingredientsCollection.value.length),
})
</script>
