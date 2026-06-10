<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <h2>{{ title }}</h2>
          <p v-if="description">{{ description }}</p>
        </div>

        <div
          class="collection-manager__controls flex flex-1 items-center gap-2"
        >
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
              :icon="
                variant === 'pill' ? 'i-lucide-list' : 'i-lucide-layout-grid'
              "
              :aria-label="
                variant === 'pill'
                  ? 'Switch to list view'
                  : 'Switch to grid view'
              "
              @click="toggleVariant"
            />
            <UBadge v-if="showCount" variant="soft"
              >{{ countLabel }}</UBadge
            >
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
        <ClientCardsPill v-bind="card" :link="linkEnabled" :show-meta="true" />
      </template>
      <template #cell="{ card }">
        <ClientCardsCell v-bind="card" :link="linkEnabled" :show-meta="true" />
      </template>
    </ClientCollectionList>

    <p v-else>
      {{ query ? 'No clients match your search.' : 'No clients found.' }}
    </p>

    <div>
      <DevJson
        :title="'Clients (JSON)'"
        context="collection manager · clients"
        :data="devJsonData"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useDevCollectionJson } from 'fireux-core/runtime/composables/dev/useDevCollectionJson'
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
import { computed } from 'vue'
import { useClientInterface } from '../../../composables/fireux/console/portfolio/Operations/Clients/utils/view/useClientInterface'
import type { Client } from '../../../models/client.model'
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

const {
  interface: makeCard,
  pill: makePill,
  cell: makeCell,
} = useClientInterface()

const collection = computed(() => props.collection ?? [])
const { devJsonData } = useDevCollectionJson(collection)
const title = computed(() => String(props.title || 'Clients'))
const description = computed(() => String(props.description || '').trim())
const searchPlaceholder = computed(() =>
  String(props.searchPlaceholder || 'Search clients...')
)
const showSearch = computed(() => props.showSearch !== false)
const showVariantToggle = computed(() => props.showVariantToggle !== false)
const showCount = computed(() => props.showCount !== false)
const linkEnabled = computed(() => props.link !== false)
const totalCount = computed(() => collection.value.length)
const showSearchInput = computed(
  () => showSearch.value && totalCount.value > 15
)

const { query, variant, toggleVariant, visibleItems, visibleCount } =
  useCollectionSearch<Client, NonNullable<ReturnType<typeof makeCard>>>({
    items: collection,
    makeCard: (client: Client) => makeCard(client),
    initialVariant: props.initialVariant,
  })

const cardsFiltered = computed<NonNullable<ReturnType<typeof makeCard>>[]>(() =>
  visibleItems.value
    .map((client) => {
      if (variant.value === 'cell') {
        const base = makeCard(client)
        const cell = makeCell(client)
        if (!base || !cell) return null
        return { ...base, ...cell }
      }

      return makePill(client)
    })
    .filter((card): card is NonNullable<ReturnType<typeof makeCard>> =>
      Boolean(card)
    )
)

const countLabel = computed(() =>
  showSearchInput.value && query.value
    ? `${visibleCount.value} / ${totalCount.value}`
    : `${totalCount.value}`
)
</script>
