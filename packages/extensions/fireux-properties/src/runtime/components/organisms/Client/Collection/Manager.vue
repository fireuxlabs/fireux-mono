<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <div>{{ title }}</div>
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

    <ClientCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <ClientCardsPill
          v-bind="card"
          :link="linkEnabled"
          :show-meta="true"
        />
      </template>
      <template #cell="{ card }">
        <ClientCardsCell
          :card="card"
          :link="linkEnabled"
          :show-meta="true"
        />
      </template>
    </ClientCollectionList>

    <p v-else>
      {{ query ? 'No clients match your search.' : 'No clients found.' }}
    </p>

    <div v-if="isDev">
      <DevJson
        :title="'Clients (JSON)'"
        context="collection manager · clients"
        :data="collection"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
import { computed } from 'vue'
import { useClientInterface } from '../../../../composables/fireux/firestore/client/utils/view/useClientInterface'
import type { Client } from '../../../../models/client.model'
import ClientCardsCell from '../Cards/Cell.vue'
import ClientCardsPill from '../Cards/Pill.vue'
import ClientCollectionList from './List.vue'

const props = withDefaults(
  defineProps<{
    collection?: Client[]
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
    title: 'Clients',
    description: 'Portfolio-scoped clients.',
    searchPlaceholder: 'Search clients...',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    initialVariant: 'pill',
    link: false,
  }
)

const { card: makeCard, searchText } = useClientInterface()

const collection = computed(() => props.collection ?? [])
const title = computed(() => String(props.title || 'Clients'))
const description = computed(() => String(props.description || '').trim())
const searchPlaceholder = computed(() => String(props.searchPlaceholder || 'Search clients...'))
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
} = useCollectionSearch<Client, ReturnType<typeof makeCard>>({
  items: collection,
  searchText: (client: Client) => searchText(client),
  makeCard: (client: Client) => makeCard(client),
  initialVariant: props.initialVariant,
})

const isDev = import.meta.dev
</script>
