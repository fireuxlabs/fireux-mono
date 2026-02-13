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
            v-if="showSearch"
            v-model="query"
            size="xs"
            :placeholder="searchPlaceholder"
          />
          <UButton
            v-if="showVariantToggle"
            size="xs"
            variant="ghost"
            :icon="variant === 'pill' ? 'i-lucide-list' : 'i-lucide-layout-grid'"
            :aria-label="variant === 'pill' ? 'Switch to list view' : 'Switch to grid view'"
            @click="toggleVariant"
          />
          <UBadge v-if="showCount" variant="soft">{{ visibleCount }} / {{ totalCount }}</UBadge>
        </div>
      </div>
    </template>

    <SupplierCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <div
          class="block"
          :class="linkEnabled && card.to ? 'cursor-pointer' : 'cursor-default'"
          @click="openCard(card)"
        >
          <SupplierCardsPill v-bind="card" />
        </div>
      </template>
      <template #cell="{ card }">
        <div
          class="block"
          :class="linkEnabled && card.to ? 'cursor-pointer' : 'cursor-default'"
          @click="openCard(card)"
        >
          <SupplierCardsCell v-bind="card" />
        </div>
      </template>
    </SupplierCollectionList>

    <p v-else class="text-sm text-dimmed">
      {{ query ? 'No suppliers match your search.' : 'No suppliers found.' }}
    </p>

    <div v-if="isDev">
      <DevJson
        :title="'Suppliers (JSON)'"
        context="collection manager · suppliers"
        :data="collection"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { navigateTo } from '#imports'
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
    searchPlaceholder?: string
    showSearch?: boolean
    showVariantToggle?: boolean
    showCount?: boolean
    initialVariant?: 'pill' | 'cell'
  }>(),
  {
    title: 'Suppliers',
    description: 'Browse suppliers for this runtime.',
    link: true,
    searchPlaceholder: 'Search suppliers...',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    initialVariant: 'pill',
  }
)

const { card: makeCard, searchText } = useSupplierInterface()

const collection = computed(() => props.collection ?? [])
const linkEnabled = computed(() => props.link !== false)
const searchPlaceholder = computed(() => String(props.searchPlaceholder || 'Search suppliers...'))
const showSearch = computed(() => props.showSearch !== false)
const showVariantToggle = computed(() => props.showVariantToggle !== false)
const showCount = computed(() => props.showCount !== false)
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
  initialVariant: props.initialVariant,
})
const isDev = import.meta.dev

const openCard = (card: NonNullable<ReturnType<typeof makeCard>>) => {
  if (!linkEnabled.value) return
  const to = String(card?.to || '').trim()
  if (!to) return
  navigateTo(to)
}
</script>
