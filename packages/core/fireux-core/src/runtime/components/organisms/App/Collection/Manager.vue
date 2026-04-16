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
              >{{ visibleCount }} / {{ totalCount }}</UBadge
            >
          </div>
        </div>
      </div>
    </template>

    <AppCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <AppCardsPill v-bind="card" :link="linkEnabled" />
      </template>
      <template #cell="{ card }">
        <AppCardsCell v-bind="card" :link="linkEnabled" />
      </template>
    </AppCollectionList>

    <p v-else>
      {{ query ? 'No apps match your search.' : 'No apps found.' }}
    </p>

    <div v-if="isDev">
      <DevJson
        :title="'Apps (JSON)'"
        :context="devJsonContext"
        :data="devJsonData"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useDevCollectionJson } from 'fireux-core/runtime/composables/dev/useDevCollectionJson'
import { computed } from 'vue'
import { useAppInterface } from '../../../../composables/fireux/firestore/core/app/utils/view/useAppInterface'
import { useCollectionSearch } from '../../../../composables/shared/useCollectionSearch'
import type { AppModel } from '../../../../models/core/app.model'

const props = withDefaults(
  defineProps<{
    collection?: AppModel[]
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
    title: 'Apps',
    description: 'Browse canonical app records for the current ecosystem.',
    link: true,
    searchPlaceholder: 'Search apps…',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    initialVariant: 'pill',
  }
)

const collection = computed(() => props.collection ?? [])
const { devJsonData } = useDevCollectionJson(collection)
const title = computed(() => String(props.title || 'Apps'))
const description = computed(() =>
  String(
    props.description ||
      'Browse canonical app records for the current ecosystem.'
  )
)
const linkEnabled = computed(() => props.link !== false)
const searchPlaceholder = computed(() =>
  String(props.searchPlaceholder || 'Search apps…')
)
const showSearch = computed(() => props.showSearch !== false)
const showVariantToggle = computed(() => props.showVariantToggle !== false)
const showCount = computed(() => props.showCount !== false)
const totalCount = computed(() => collection.value.length)
const showSearchInput = computed(
  () => showSearch.value && totalCount.value > 15
)
const {
  interface: makeCard,
  pill: makePill,
  cell: makeCell,
} = useAppInterface()
const { query, variant, toggleVariant, visibleItems, visibleCount } =
  useCollectionSearch<AppModel, NonNullable<ReturnType<typeof makeCard>>>({
    items: collection,
    makeCard: (app) => makeCard(app),
    initialVariant: props.initialVariant,
  })

const cardsFiltered = computed<NonNullable<ReturnType<typeof makeCard>>[]>(() =>
  visibleItems.value
    .map((app) => {
      if (variant.value === 'cell') {
        const base = makeCard(app)
        const cell = makeCell(app)
        if (!base || !cell) return null
        return { ...base, ...cell }
      }

      return makePill(app)
    })
    .filter((card): card is NonNullable<ReturnType<typeof makeCard>> =>
      Boolean(card)
    )
)

const isDev = import.meta.dev
const devJsonContext = 'collection manager · apps · root: apps'
</script>
