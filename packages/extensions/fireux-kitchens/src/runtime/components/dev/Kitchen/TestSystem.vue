<template>
  <section class="space-y-10">
    <UCard>
      <DevModel
        :title="'Test Kitchens · Model'"
        :model="kitchenModelRuntime"
      />
    </UCard>

    <UCard>
      <template #header>
        <div class="flex items-start justify-between gap-3">
          <div class="space-y-3">
            <p class="text-sm font-semibold text-gray-900 dark:text-gray-100">
              Test kitchens collection
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Browse test kitchens resolved for this runtime and filter by model drift.
            </p>
            <DevDriftToolbar
              :drift-kind="kitchensDriftKind"
              :selected-field="kitchensSelectedField"
              :filter-options="kitchensFilterOptions"
              :copy-label="'Copy drift · Test Kitchens'"
              :copy-payload="kitchensDriftCopyPayload"
              @update:drift-kind="setKitchensDriftKind"
              @update:selected-field="setKitchensSelectedField"
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
import { useFirestoreRead } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreRead'
import { computed } from 'vue'
import { useKitchenFetch } from '../../../composables/fireux/firestore/kitchen/fetch/useKitchenFetch'
import type { Kitchen, KitchenCollection } from '../../../models/kitchen.model'
import { KitchenCollection as KitchenModelRuntime } from '../../../models/kitchen.model'

defineOptions({ name: 'DevTestKitchenSystem' })

const kitchenModelRuntime = KitchenModelRuntime

const { firestoreFetchCollection } = useFirestoreRead()
const kitchensCollection = firestoreFetchCollection<KitchenCollection>('test-kitchens')
const { kitchens: hydratedKitchens } = useKitchenFetch({
  collectionPath: 'test-kitchens',
})

const kitchensCollectionValue = computed(() => kitchensCollection.value ?? [])

const {
  driftKind: kitchensDriftKind,
  setDriftKind: setKitchensDriftKind,
  selectedField: kitchensSelectedField,
  setSelectedField: setKitchensSelectedField,
  filterOptions: kitchensFilterOptions,
  filteredCollection: filteredKitchens,
  buildDriftPayload: buildKitchensDriftPayload,
  buildCopyPayload: buildKitchensCopyPayload,
} = useDevDriftFilter({
  collection: kitchensCollectionValue,
  runtimeModel: kitchenModelRuntime,
  driftMode: 'extras-only',
  requiredPaths: ['name'],
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

const filteredKitchensDriftPayload = buildKitchensDriftPayload({
  map: ({ doc, id, drift }) => ({
    id,
    name: hydratedById.value.get(id)?.name ?? (doc as any).name ?? '',
    drift,
  }),
})

const kitchensDriftCopyPayload = buildKitchensCopyPayload({
  modelPath: 'packages/extensions/fireux-kitchens/src/runtime/models/kitchen.model.ts',
  itemsKey: 'testKitchens',
  items: filteredKitchensDriftPayload,
  total: computed(() => kitchensCollectionValue.value.length),
})
</script>
