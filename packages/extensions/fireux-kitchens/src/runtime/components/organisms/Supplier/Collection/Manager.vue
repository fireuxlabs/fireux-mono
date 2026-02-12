<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <div>{{ title }}</div>
          <p>{{ description }}</p>
        </div>

        <div class="collection-manager__controls">
          <UInput
            v-model="query"
            size="xs"
            placeholder="Search suppliers..."
          />
          <UButton
            size="xs"
            variant="ghost"
            :icon="variant === 'pill' ? 'i-lucide-list' : 'i-lucide-layout-grid'"
            :aria-label="variant === 'pill' ? 'Switch to list view' : 'Switch to grid view'"
            @click="toggleVariant"
          />
          <UBadge variant="soft">{{ visibleCount }} / {{ totalCount }}</UBadge>
        </div>
      </div>
    </template>

    <SupplierCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <component
          :is="linkEnabled && card.to ? 'NuxtLink' : 'div'"
          :to="linkEnabled && card.to ? card.to : undefined"
          class="block"
          :class="linkEnabled ? '' : 'cursor-default'"
        >
          <SupplierCardsPill v-bind="card" />
        </component>
      </template>
      <template #cell="{ card }">
        <component
          :is="linkEnabled && card.to ? 'NuxtLink' : 'div'"
          :to="linkEnabled && card.to ? card.to : undefined"
          class="block"
          :class="linkEnabled ? '' : 'cursor-default'"
        >
          <SupplierCardsCell v-bind="card" />
        </component>
      </template>
    </SupplierCollectionList>

    <p v-else class="text-sm text-dimmed">
      {{ query ? 'No suppliers match your search.' : 'No suppliers found.' }}
    </p>
  </UCard>
</template>

<script setup lang="ts">
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
import { computed } from 'vue'
import { useSupplierInterface, type SupplierSurface } from '../../../../composables/fireux/firestore/supplier/utils/view/useSupplierInterface'
import SupplierCardsCell from '../Cards/Cell.vue'
import SupplierCardsPill from '../Cards/Pill.vue'
import SupplierCollectionList from './List.vue'

type SupplierCollectionEntry = SupplierSurface

const props = withDefaults(
  defineProps<{
    collection?: SupplierCollectionEntry[]
    title?: string
    description?: string
    link?: boolean
  }>(),
  {
    title: 'Suppliers',
    description: 'Browse suppliers for this runtime.',
    link: true,
  }
)

const { card: makeCard, searchText } = useSupplierInterface()

const collection = computed(() => props.collection ?? [])
const linkEnabled = computed(() => props.link !== false)
const totalCount = computed(() => collection.value.length)
const {
  query,
  variant,
  toggleVariant,
  cards: cardsFiltered,
  visibleCount,
} = useCollectionSearch<SupplierCollectionEntry, ReturnType<typeof makeCard>>({
  items: collection,
  searchText: (supplier: SupplierCollectionEntry) => searchText(supplier),
  makeCard: (supplier: SupplierCollectionEntry) => makeCard(supplier),
})
</script>
