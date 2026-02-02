<template>
  <UPage>
    <UPageHeader
      title="Dev · Kitchens (Ext)"
      description="Model shape for Kitchens collection."
    />

    <UPageBody class="space-y-6">
      <UCard>
        <DevModel
          :title="'Kitchens · Model'"
          :model="kitchenModelRuntime"
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
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useDevDriftFilter } from 'fireux-core/runtime/composables/dev/useDevDriftFilter'
import { computed } from 'vue'
import { useKitchenFetch } from '../../composables/fireux/firestore/objects/kitchen/fetch/useKitchenFetch'
import { useKitchens } from '../../composables/fireux/firestore/objects/kitchen/useKitchens'
import type { Kitchen, KitchenCollection } from '../../models/objects/kitchen.model'
import { KitchenCollection as KitchenModelRuntime } from '../../models/objects/kitchen.model'

definePageMeta({
  layout: 'dev',
  nav: {
    key: 'dev-ext-kitchens',
    label: 'Kitchens (Ext)',
    icon: 'i-lucide-chef-hat',
    desktop: true,
    group: 'ext',
    layouts: ['dev'],
  },
})

const kitchenModelRuntime = KitchenModelRuntime

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
      name: kitchen.name,
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
