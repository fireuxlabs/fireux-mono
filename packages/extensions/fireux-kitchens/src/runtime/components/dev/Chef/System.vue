<template>
  <section class="space-y-10">
    <DevChefDummy />

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
              Chefs collection
            </p>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Browse chefs resolved for this runtime and filter by model drift.
            </p>
            <DevDriftToolbar
              :drift-kind="driftKind"
              :selected-field="selectedField"
              :filter-options="filterOptions"
              :copy-label="'Copy drift · Chefs'"
              :copy-payload="driftCopyPayload"
              @update:drift-kind="setDriftKind"
              @update:selected-field="setSelectedField"
            />
          </div>
        </div>
      </template>

      <UCard v-if="pending" variant="subtle">
        <p class="text-sm text-dimmed">Loading chefs...</p>
      </UCard>

      <OrganismsProfilesChefCollectionManager
        v-else
        :collection="filteredCollection"
      />
    </UCard>
  </section>
</template>

<script setup lang="ts">
import { useDevDriftFilter } from 'fireux-core/runtime/composables/dev/useDevDriftFilter'
import { computed } from 'vue'
import { useChefFetch } from '../../../composables/fireux/firestore/profiles/Chef/main/useChefFetch'
import { ChefCore as ChefCoreModelRuntime } from '../../../models/profiles/Chef/Chef.model'

defineOptions({ name: 'DevChefSystem' })

const chefCoreModelRuntime = ChefCoreModelRuntime

const { coreChefs, appChefs, pending } = useChefFetch()

const collection = computed(() => [
  ...(appChefs?.value ?? []),
  ...(coreChefs.value ?? []),
])


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
  collection,
  runtimeModel: chefCoreModelRuntime,
  driftMode: 'extras-only',
  prepareForDrift: (entry) => {
    const { user, ...rest } = (entry as Record<string, unknown>) ?? {}
    return rest
  },
})

const filteredDriftPayload = buildDriftPayload({
  map: ({ doc, id, drift }) => ({
    id,
    displayName:
      (doc as any)?.user?.display_name ??
      (doc as any)?.user?.handle ??
      id,
    chefHeadline: (doc as any)?.chef_headline ?? '',
    drift,
  }),
})

const driftCopyPayload = buildCopyPayload({
  modelPath: 'packages/extensions/fireux-kitchens/src/runtime/models/profiles/Chef/Chef.model.ts',
  itemsKey: 'chefs',
  items: filteredDriftPayload,
  total: computed(() => collection.value.length),
})
</script>
