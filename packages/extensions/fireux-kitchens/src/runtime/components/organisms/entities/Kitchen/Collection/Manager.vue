<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <div>Kitchens</div>
          <p>Browse {{ appName }} kitchens.</p>
        </div>

        <div class="collection-manager__controls">
          <UInput
            v-model="query"
            size="xs"
            placeholder="Search kitchens…"
          />

          <UButton
            size="xs"
            variant="ghost"
            :icon="variant === 'pill' ? 'i-lucide-list' : 'i-lucide-layout-grid'"
            :aria-label="variant === 'pill' ? 'Switch to list view' : 'Switch to grid view'"
            @click="toggleVariant"
          />
          <UBadge variant="soft">{{ visibleCount }} / {{ visibleTotalCount }}</UBadge>
        </div>
      </div>
    </template>

    <p v-if="hiddenTestKitchenCount > 0" class="mb-2 text-xs text-dimmed">
      Hidden {{ hiddenTestKitchenCount }} test kitchen{{ hiddenTestKitchenCount === 1 ? '' : 's' }}.
    </p>

    <OrganismsEntitiesKitchenCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <NuxtLink :to="card.to">
          <KitchenCardsPill v-bind="card" />
        </NuxtLink>
      </template>
      <template #cell="{ card }">
        <NuxtLink :to="card.to">
          <KitchenCardsCell v-bind="card" />
        </NuxtLink>
      </template>
    </OrganismsEntitiesKitchenCollectionList>

    <p v-else>
      {{ query ? 'No kitchens match your search.' : 'No kitchens found.' }}
    </p>

    <div v-if="isDev">
      <DevJson
        :title="'Kitchens (JSON)'"
        context="Kitchens collection manager · kitchens list · runtime-resolved"
        :data="visibleCollection"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch';
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig';
import { computed } from 'vue';
import { useKitchenInterface } from '../../../../../composables/fireux/firestore/objects/kitchen/utils/view/useKitchenInterface';
import type { Kitchen } from '../../../../../models/objects/kitchen.model';

const props = defineProps<{ collection?: Kitchen[] }>()
const { appName } = useFireUXConfig()

const collection = computed(() => props.collection ?? [])
const isTestKitchen = (kitchen: Kitchen) => {
  if ((kitchen as any)?.is_test_kitchen === true) return true

  const tags = Array.isArray((kitchen as any)?.tags)
    ? (kitchen as any).tags.map((tag: unknown) => String(tag || '').trim().toLowerCase())
    : []
  if (tags.includes('test-kitchen')) return true

  const name = String((kitchen as any)?.name || '').trim().toLowerCase()
  const shortName = String((kitchen as any)?.short_name || '').trim().toLowerCase()
  return name === 'test kitchen' || shortName === 'test kitchen'
}
const visibleCollection = computed(() =>
  collection.value.filter((kitchen) => !isTestKitchen(kitchen))
)
const hiddenTestKitchenCount = computed(
  () => collection.value.length - visibleCollection.value.length
)

const { card: makeCard, searchText } = useKitchenInterface()

const {
  query,
  variant,
  toggleVariant,
  cards: cardsFiltered,
  visibleCount,
} = useCollectionSearch<Kitchen, ReturnType<typeof makeCard>>({
  items: visibleCollection,
  searchText: (kitchen: Kitchen) => searchText(kitchen),
  makeCard: (kitchen: Kitchen) => makeCard(kitchen),
})
const visibleTotalCount = computed(() => visibleCollection.value.length)
const isDev = import.meta.dev
</script>
