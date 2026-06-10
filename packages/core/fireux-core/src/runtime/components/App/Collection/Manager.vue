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

    <AppCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <div
          v-if="selectable"
          :class="selectionCardClass(card)"
          role="button"
          tabindex="0"
          @click="toggleSelection(card)"
          @keydown.enter.prevent="toggleSelection(card)"
          @keydown.space.prevent="toggleSelection(card)"
        >
          <AppCardsPill v-bind="card" :link="false" />
          <UBadge
            class="absolute right-2 top-2"
            :color="isSelected(card) ? 'primary' : 'neutral'"
            :variant="isSelected(card) ? 'solid' : 'soft'"
          >
            {{ isSelected(card) ? selectedLabel : unselectedLabel }}
          </UBadge>
        </div>
        <AppCardsPill v-else v-bind="card" :link="linkEnabled" />
      </template>
      <template #cell="{ card }">
        <div
          v-if="selectable"
          :class="selectionCardClass(card)"
          role="button"
          tabindex="0"
          @click="toggleSelection(card)"
          @keydown.enter.prevent="toggleSelection(card)"
          @keydown.space.prevent="toggleSelection(card)"
        >
          <AppCardsCell v-bind="card" :link="false" />
          <UBadge
            class="absolute right-3 top-3"
            :color="isSelected(card) ? 'primary' : 'neutral'"
            :variant="isSelected(card) ? 'solid' : 'soft'"
          >
            {{ isSelected(card) ? selectedLabel : unselectedLabel }}
          </UBadge>
        </div>
        <AppCardsCell v-else v-bind="card" :link="linkEnabled" />
      </template>
    </AppCollectionList>

    <p v-else>
      {{ query ? 'No apps match your search.' : 'No apps found.' }}
    </p>

    <div>
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
import {
  useAppInterface,
  type AppCard,
} from '../../../composables/fireux/firestore/core/app/utils/view/useAppInterface'
import { useCollectionSearch } from '../../../composables/shared/useCollectionSearch'
import type { AppModel } from '../../../models/core/app.model'

type AppCollectionCard = AppCard.Card & {
  selectionValue: string
}

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
    selectable?: boolean
    selectedValues?: string[]
    selectionField?: 'id' | 'slug'
    selectedLabel?: string
    unselectedLabel?: string
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
    selectable: false,
    selectedValues: () => [],
    selectionField: 'id',
    selectedLabel: 'Selected',
    unselectedLabel: 'Select',
  }
)

const emit = defineEmits<{
  (event: 'toggle-selection', value: string): void
}>()

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
const selectable = computed(() => props.selectable === true)
const selectedLabel = computed(() => String(props.selectedLabel || 'Selected'))
const unselectedLabel = computed(() => String(props.unselectedLabel || 'Select'))
const selectedSet = computed(
  () =>
    new Set(
      props.selectedValues
        .map((value) => String(value ?? '').trim())
        .filter(Boolean)
    )
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

const selectionValue = (app: AppModel) => {
  const value = props.selectionField === 'slug' ? app.slug : app.id
  return String(value ?? '').trim()
}

const withSelectionValue = (
  app: AppModel,
  card: AppCard.Card | null
): AppCollectionCard | null => {
  if (!card) return null
  return { ...card, selectionValue: selectionValue(app) }
}

const cardsFiltered = computed<AppCollectionCard[]>(() =>
  visibleItems.value
    .map((app) => {
      if (variant.value === 'cell') {
        const base = makeCard(app)
        const cell = makeCell(app)
        if (!base || !cell) return null
        return withSelectionValue(app, { ...base, ...cell })
      }

      return withSelectionValue(app, makePill(app))
    })
    .filter((card): card is AppCollectionCard =>
      Boolean(card)
    )
)

const countLabel = computed(() =>
  showSearchInput.value && query.value
    ? `${visibleCount.value} / ${totalCount.value}`
    : `${totalCount.value}`
)
const devJsonContext = 'collection manager · apps · root: apps'

const isSelected = (card: AppCollectionCard) =>
  selectedSet.value.has(card.selectionValue)

const selectionCardClass = (card: AppCollectionCard) => [
  'relative rounded-lg transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
  isSelected(card)
    ? 'ring-2 ring-primary bg-primary/5'
    : 'ring-1 ring-default hover:ring-primary/40',
]

const toggleSelection = (card: AppCollectionCard) => {
  if (!selectable.value || !card.selectionValue) return
  emit('toggle-selection', card.selectionValue)
}
</script>
