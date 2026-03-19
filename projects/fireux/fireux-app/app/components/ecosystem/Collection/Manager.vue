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

    <EcosystemCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <EcosystemCardsPill v-bind="card" :link="linkEnabled" />
      </template>
      <template #cell="{ card }">
        <EcosystemCardsCell v-bind="card" :link="linkEnabled" />
      </template>
    </EcosystemCollectionList>

    <p v-else>
      {{ query ? 'No ecosystems match your search.' : 'No ecosystems found.' }}
    </p>

    <div v-if="isDev">
      <DevJson
        title="Ecosystems (JSON)"
        context="collection manager · ecosystems · raw collection"
        :data="rawCollection"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
import { computed } from 'vue'
import {
  useEcosystemInterface,
  type EcosystemCard,
  type EcosystemView,
} from '../../../composables/useEcosystemInterface'
import EcosystemCardsCell from '../Cards/Cell.vue'
import EcosystemCardsPill from '../Cards/Pill.vue'
import EcosystemCollectionList from './List.vue'

const props = withDefaults(defineProps<{
  collection?: EcosystemView.Row[]
  title?: string
  description?: string
  link?: boolean
  searchPlaceholder?: string
  showSearch?: boolean
  showVariantToggle?: boolean
  showCount?: boolean
  initialVariant?: 'pill' | 'cell'
}>(), {
  collection: () => [],
  title: 'Ecosystems',
  description: 'Browse ecosystems available in this workspace.',
  link: false,
  searchPlaceholder: 'Search ecosystems…',
  showSearch: true,
  showVariantToggle: true,
  showCount: true,
  initialVariant: 'cell',
})

const rawCollection = computed(() => props.collection ?? [])
const title = computed(() => String(props.title || 'Ecosystems'))
const description = computed(() => String(props.description || '').trim())
const linkEnabled = computed(() => props.link !== false)
const searchPlaceholder = computed(() => String(props.searchPlaceholder || 'Search ecosystems…'))
const showSearch = computed(() => props.showSearch !== false)
const showVariantToggle = computed(() => props.showVariantToggle !== false)
const showCount = computed(() => props.showCount !== false)
const { item, card: makeCard, searchText } = useEcosystemInterface()

const collection = computed<EcosystemView.Item[]>(() =>
  rawCollection.value
    .map((row) => item(row))
    .filter((row): row is EcosystemView.Item => Boolean(row))
)

const {
  query,
  variant,
  toggleVariant,
  cards: cardsFiltered,
  visibleCount,
} = useCollectionSearch<EcosystemView.Item, EcosystemCard.Card>({
  items: collection,
  searchText: (row) => searchText(row),
  makeCard: (row) => makeCard(row),
  initialVariant: props.initialVariant,
})

const totalCount = computed(() => collection.value.length)
const showSearchInput = computed(() => showSearch.value && totalCount.value > 15)
const isDev = import.meta.dev
</script>
