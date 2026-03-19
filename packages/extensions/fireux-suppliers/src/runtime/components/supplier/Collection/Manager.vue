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

    <p v-else>{{ query ? 'No suppliers match your search.' : 'No suppliers found.' }}</p>

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
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch';
import { computed } from 'vue';
import type { SupplierCore } from '../../../models/supplier/Supplier.model';
import { useSupplierInterface } from '../../composables/fireux/firestore/profiles/Supplier/utils/view/useSupplierInterface';
import SupplierCardsCell from '../Cards/Cell.vue';
import SupplierCardsPill from '../Cards/Pill.vue';
import SupplierCollectionList from './List.vue';

type SupplierEntry = SupplierCore & { user?: unknown }

const props = withDefaults(
  defineProps<{
    collection?: SupplierEntry[]
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
    description: 'Browse supplier records available to this runtime.',
    link: true,
    searchPlaceholder: 'Search suppliers…',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    initialVariant: 'pill',
  }
)

const collection = computed(() => props.collection ?? [])
const title = computed(() => String(props.title || 'Suppliers'))
const description = computed(
  () => String(props.description || 'Browse supplier records available to this runtime.')
)
const linkEnabled = computed(() => props.link !== false)
const searchPlaceholder = computed(() => String(props.searchPlaceholder || 'Search suppliers…'))
const showSearch = computed(() => props.showSearch !== false)
const showVariantToggle = computed(() => props.showVariantToggle !== false)
const showCount = computed(() => props.showCount !== false)
const totalCount = computed(() => collection.value.length)
const showSearchInput = computed(() => showSearch.value && totalCount.value > 15)
const { card: makeCard, searchText } = useSupplierInterface()
const { query, variant, toggleVariant, cards: cardsFiltered, visibleCount } =
  useCollectionSearch<SupplierEntry, ReturnType<typeof makeCard>>({
    items: collection,
    searchText: (entry) => searchText(entry as SupplierCore),
    makeCard: (entry) => makeCard(entry as SupplierCore, (entry as any)?.user ?? null),
    initialVariant: props.initialVariant,
  })

const isDev = import.meta.dev
</script>
