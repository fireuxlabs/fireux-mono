<template>
  <UCard class="fx-section">
    <template #header>
      <div class="fx-section__header">
        <div class="fx-section__copy">
          <h2 class="text-base font-semibold">Apps</h2>
          <p class="text-xs text-gray-500">
            Browse apps available to this runtime.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <UInput
            v-model="query"
            size="xs"
            placeholder="Search apps…"
            class="w-44"
          />

          <UButton size="xs" variant="ghost" @click="toggleVariant">
            {{ variant === 'pill' ? 'Cells' : 'Pills' }}
          </UButton>

          <UBadge variant="soft">{{ visibleCount }} / {{ totalCount }}</UBadge>
        </div>
      </div>
    </template>

    <OrganismsAppCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    />

    <p v-else class="fx-section__empty">
      {{ query ? 'No apps match your search.' : 'No apps found.' }}
    </p>

    <div v-if="showDebug" class="pt-3">
      <DevJson
        :title="'Apps (JSON)'"
        :data="debugPayload"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAppInterface } from '../../../../composables/fireux/firestore/core/app/utils/view/useAppInterface';
import { useCollectionSearch } from '../../../../composables/shared/useCollectionSearch';
import type { AppModel } from '../../../../models/core/app.model';

const props = defineProps<{ collection?: AppModel[] }>()

const collection = computed(() => props.collection ?? [])
const { card: makeCard, searchText } = useAppInterface()
const {
  query,
  variant,
  toggleVariant,
  cards: cardsFiltered,
  visibleCount,
} = useCollectionSearch<AppModel, ReturnType<typeof makeCard>>({
  items: collection,
  searchText: (app) => searchText(app),
  makeCard: (app) => makeCard(app),
})

const totalCount = computed(() => collection.value.length)
const showDebug = import.meta.dev
const debugPayload = computed(() => ({
  totalApps: collection.value.length,
  apps: collection.value,
}))
</script>
