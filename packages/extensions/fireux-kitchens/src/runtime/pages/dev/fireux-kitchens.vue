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
                :copy-label="copying ? 'Copying…' : 'Copy drift · Kitchens'"
                :copy-icon="copying ? 'i-heroicons-arrow-path' : 'i-heroicons-clipboard-document-check'"
                :copy-disabled="copying"
                @update:drift-kind="setKitchensDriftKind"
                @update:selected-field="updateKitchensSelectedField"
                @copy="copyKitchensDrift"
              />
            </div>
          </div>
        </template>

        <template #footer>
          <DevJson
            :title="'Kitchens (JSON)'"
            :data="allKitchensJsonPayload"
            :default-open="false"
          />
        </template>

        <KitchenCollectionManager :cards="cards" />
      </UCard>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useDevClipboard } from 'fireux-core/runtime/composables/dev/useDevClipboard'
import { useDevDriftFilter } from 'fireux-core/runtime/composables/dev/useDevDriftFilter'
import { computed } from 'vue'
import { useKitchens } from '../../composables/fireux/firestore/objects/kitchen/useKitchens'
import { useKitchenInterface } from '../../composables/fireux/firestore/objects/kitchen/utils/view/useKitchenInterface'
import type { Kitchen } from '../../models/objects/kitchen.model'
import { Kitchen as KitchenModelRuntime } from '../../models/objects/kitchen.model';

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

const { collection } = useKitchens<Kitchen>()
const { card: makeCard } = useKitchenInterface()

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

const cards = computed(() =>
  filteredKitchens.value
    .map((kitchen) => makeCard(kitchen as Kitchen))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
)

const allKitchensJsonPayload = computed(() => ({
  totalKitchens: kitchensCollection.value.length,
  kitchens: kitchensCollection.value,
}))

const filteredKitchensDriftPayload = computed(() =>
  cards.value.map((card) => {
    const drift = kitchensDriftById.value.get(card.id) ?? { missing: [], extra: [] }
    return {
      id: card.id,
      name: card.name,
      drift,
    }
  })
)

const { copyJSON, copying } = useDevClipboard()

const copyKitchensDrift = async () => {
  await copyJSON(
    {
      modelPath: 'packages/extensions/fireux-kitchens/src/runtime/models/objects/kitchen.model.ts',
      driftKind: kitchensDriftKind.value,
      selectedField: kitchensSelectedField.value || null,
      totalKitchens: cards.value.length,
      kitchens: filteredKitchensDriftPayload.value,
    },
    { label: 'Dev · Kitchens · Filtered drift' }
  )
}

const updateKitchensSelectedField = (value: string) => {
  kitchensSelectedField.value = value
}
</script>
