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

    <PropertyCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <PropertyCardsPill
          v-bind="card"
          :link="linkEnabled"
          :show-meta="true"
        />
      </template>
      <template #cell="{ card }">
        <PropertyCardsCell
          v-bind="card"
          :link="linkEnabled"
          :show-meta="true"
        />
      </template>
    </PropertyCollectionList>

    <p v-else>
      {{ query ? 'No properties match your search.' : 'No properties found.' }}
    </p>

    <div v-if="isDev">
      <DevJson
        :title="'Properties (JSON)'"
        context="collection manager · properties"
        :data="collection"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
import { computed } from 'vue'
import { usePropertyInterface } from '../../../../composables/fireux/firestore/property/utils/view/usePropertyInterface'
import type { Property } from '../../../../models/property.model'
import PropertyCardsCell from '../Cards/Cell.vue'
import PropertyCardsPill from '../Cards/Pill.vue'
import PropertyCollectionList from './List.vue'

const props = withDefaults(
  defineProps<{
    collection?: Property[]
    title?: string
    description?: string
    searchPlaceholder?: string
    showSearch?: boolean
    showVariantToggle?: boolean
    showCount?: boolean
    initialVariant?: 'pill' | 'cell'
    link?: boolean
  }>(),
  {
    title: 'Properties',
    description: 'Portfolio-scoped properties.',
    searchPlaceholder: 'Search properties...',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    initialVariant: 'pill',
    link: true,
  }
)

const { card: makeCard, searchText } = usePropertyInterface()

const collection = computed(() => props.collection ?? [])
const title = computed(() => String(props.title || 'Properties'))
const description = computed(() => String(props.description || '').trim())
const searchPlaceholder = computed(() => String(props.searchPlaceholder || 'Search properties...'))
const showSearch = computed(() => props.showSearch !== false)
const showVariantToggle = computed(() => props.showVariantToggle !== false)
const showCount = computed(() => props.showCount !== false)
const linkEnabled = computed(() => props.link !== false)
const totalCount = computed(() => collection.value.length)
const showSearchInput = computed(() => showSearch.value && totalCount.value > 15)

const {
  query,
  variant,
  toggleVariant,
  cards: cardsFiltered,
  visibleCount,
} = useCollectionSearch<Property, ReturnType<typeof makeCard>>({
  items: collection,
  searchText: (property: Property) => searchText(property),
  makeCard: (property: Property) => makeCard(property),
  initialVariant: props.initialVariant,
})

const isDev = import.meta.dev
</script>
