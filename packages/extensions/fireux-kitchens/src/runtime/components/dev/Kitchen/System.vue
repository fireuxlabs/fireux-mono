<template>
  <section class="space-y-10">
    <DevKitchenDummy />

    <UCard>
      <template #header>
        <div class="space-y-1">
          <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Kitchen entities
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400">
            Open entity indexes for kitchens operations.
          </p>
        </div>
      </template>

      <div class="flex flex-wrap gap-2">
        <UButton to="/kitchens" size="sm" color="neutral" variant="soft" icon="i-lucide-store">
          Kitchens
        </UButton>
        <UButton to="/ingredients" size="sm" color="neutral" variant="soft" icon="i-lucide-carrot">
          Ingredients
        </UButton>
        <UButton to="/chefs" size="sm" color="neutral" variant="soft" icon="i-lucide-egg-fried">
          Chefs
        </UButton>
      </div>
    </UCard>

    <UCard>
      <DevModel
        :title="'Kitchens · Model'"
        :model="kitchenModelRuntime"
      />
    </UCard>

    <UCard>
      <DevModel
        :title="'Ingredients · Model'"
        :model="ingredientModelRuntime"
      />
    </UCard>

    <UCard>
      <DevModel
        :title="'Chefs · Core Model'"
        :model="chefCoreModelRuntime"
      />
    </UCard>

    <UCard>
      <template #header>
        <div class="flex items-start justify-between gap-3">
          <div class="space-y-3">
            <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Kitchens collection
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Browse kitchens resolved for this runtime and filter by model drift.
            </p>
            <DevDriftToolbar
              :drift-kind="kitchensDriftKind"
              :selected-field="kitchensSelectedField"
              :filter-options="kitchensFilterOptions"
              :copy-label="'Copy drift · Kitchens'"
              :copy-payload="kitchensDriftCopyPayload"
              @update:drift-kind="setKitchensDriftKind"
              @update:selected-field="updateKitchensSelectedField"
            />
          </div>
        </div>
      </template>

      <KitchenCollectionManager :collection="filteredKitchensResolved" />
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { useDevDriftFilter } from 'fireux-core/runtime/composables/dev/useDevDriftFilter'
import { computed } from 'vue'
import { useKitchenFetch } from '../../../composables/fireux/firestore/objects/kitchen/fetch/useKitchenFetch'
import { useKitchens } from '../../../composables/fireux/firestore/objects/kitchen/useKitchens'
import { Ingredient as IngredientModelRuntime } from '../../../models/objects/ingredient.model'
import { ChefCore as ChefCoreModelRuntime } from '../../../models/profiles/Chef/Chef.model'
import type { Kitchen, KitchenCollection } from '../../../models/objects/kitchen.model'
import { KitchenCollection as KitchenModelRuntime } from '../../../models/objects/kitchen.model'

defineOptions({ name: 'DevKitchenSystem' })

const kitchenModelRuntime = KitchenModelRuntime
const ingredientModelRuntime = IngredientModelRuntime
const chefCoreModelRuntime = ChefCoreModelRuntime

const { collection } = useKitchens<KitchenCollection>()
const { kitchens: hydratedKitchens } = useKitchenFetch()

const kitchensCollection = computed(() => collection.value ?? [])

const {
  driftKind: kitchensDriftKind,
  setDriftKind: setKitchensDriftKind,
  selectedField: kitchensSelectedField,
  driftById: kitchensDriftById,
  filterOptions: kitchensFilterOptions,
  filteredCollection: filteredKitchens,
} = useDevDriftFilter({
  collection: kitchensCollection,
  runtimeModel: kitchenModelRuntime,
})

const hydratedById = computed(() => {
  const map = new Map<string, Kitchen>()
  for (const kitchen of hydratedKitchens.value ?? []) {
    if (kitchen?.id) map.set(String(kitchen.id), kitchen)
  }
  return map
})

const filteredKitchensResolved = computed(() =>
  filteredKitchens.value
    .map((kitchen) => hydratedById.value.get(String(kitchen.id)))
    .filter(Boolean) as Kitchen[]
)

const filteredKitchensDriftPayload = computed(() =>
  filteredKitchens.value.map((kitchen) => {
    const drift = kitchensDriftById.value.get(kitchen.id) ?? { missing: [], extra: [] }
    return {
      id: kitchen.id,
      name: (kitchen as any).name ?? '',
      drift,
    }
  })
)

const kitchensDriftCopyPayload = computed(() => ({
  modelPath: 'packages/extensions/fireux-kitchens/src/runtime/models/objects/kitchen.model.ts',
  driftKind: kitchensDriftKind.value,
  selectedField: kitchensSelectedField.value || null,
  totalKitchens: filteredKitchens.value.length,
  kitchens: filteredKitchensDriftPayload.value,
}))

const updateKitchensSelectedField = (value: string) => {
  kitchensSelectedField.value = value
}
</script>
