<template>
  <section class="space-y-10">
    <UCard>
      <DiagnosticsModel
        :title="'Ingredients · Model'"
        :model="ingredientModelRuntime"
      />
    </UCard>

    <UCard>
      <template #header>
        <div class="flex items-start justify-between gap-3">
          <div class="space-y-3">
            <p class="text-sm font-semibold text-highlighted">
              Ingredients collection
            </p>
            <p class="text-xs text-muted">
              Browse ingredients resolved for this runtime and filter by model
              drift.
            </p>
            <DiagnosticsDriftToolbar
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

      <DiagnosticsDebugPanel
        object-origin="fetched"
        launcher
        include-route
        title="Ingredients (JSON)"
        context="dev ingredients · filtered collection"
        :objects="filteredCollection"
        :derived="{}"
        :default-open="false"
        :hide-when-empty="false"
      />
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { useDiagnosticsDriftFilter } from 'fireux-core/runtime/composables/diagnostics/useDiagnosticsDriftFilter'
import { computed } from 'vue'
import { useIngredientCollection } from '../../composables/useIngredientCollection'
import {
  IngredientStorage,
  IngredientDefaults,
  type Ingredient,
} from '../../utils/ingredient.ts'

defineOptions({ name: 'DiagnosticsIngredientSystem' })

const ingredientModelRuntime = { ...IngredientDefaults }

const { ingredients } = useIngredientCollection()
const ingredientsCollection = computed<Ingredient[]>(
  () => ingredients.value ?? []
)

const {
  driftKind,
  setDriftKind,
  selectedField,
  setSelectedField,
  filterOptions,
  filteredCollection,
  buildDriftPayload,
  buildCopyPayload,
} = useDiagnosticsDriftFilter({
  collection: ingredientsCollection,
  runtimeModel: ingredientModelRuntime,
  driftMode: 'extras-only',
})

const filteredDriftPayload = buildDriftPayload({
  map: ({ doc, id, drift }) => ({
    id,
    name: doc.name,
    drift: {
      extra: drift.extra,
    },
  }),
})

const driftCopyPayload = buildCopyPayload({
  modelPath:
    'packages/extensions/fireux-kitchens/src/runtime/ingredient/utils/ingredient.ts',
  itemsKey: IngredientStorage.collection,
  items: filteredDriftPayload,
  total: computed(() => ingredientsCollection.value.length),
})
</script>
