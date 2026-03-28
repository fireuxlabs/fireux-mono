<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <h2>{{ title }}</h2>
          <p v-if="description">{{ description }}</p>
        </div>

        <div class="collection-manager__controls flex flex-1 items-center gap-2">
          <div class="ml-auto flex items-center gap-2">
            <UInput
              v-if="showSearchInput"
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
      </div>
    </template>

    <SupplierCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <SupplierCardsPill v-bind="card" :link="linkEnabled" />
      </template>
      <template #cell="{ card }">
        <SupplierCardsCell v-bind="card" :link="linkEnabled" />
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
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
import {
  type SupplierSurface,
  useSupplierInterface,
} from 'fireux-suppliers/runtime/composables/fireux/firestore/supplier/utils/view/useSupplierInterface'
import { computed } from 'vue'

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
    searchPlaceholder: 'Search suppliers…',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    initialVariant: 'pill',
  }
)

const { interface: makeCard, searchText } = useSupplierInterface()

const collection = computed(() => props.collection ?? [])
const linkEnabled = computed(() => props.link !== false)
const searchPlaceholder = computed(() => String(props.searchPlaceholder || 'Search suppliers…'))
const showSearch = computed(() => props.showSearch !== false)
const showVariantToggle = computed(() => props.showVariantToggle !== false)
const showCount = computed(() => props.showCount !== false)
const totalCount = computed(() => collection.value.length)
const showSearchInput = computed(() => showSearch.value && totalCount.value > 15)
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
</script>
