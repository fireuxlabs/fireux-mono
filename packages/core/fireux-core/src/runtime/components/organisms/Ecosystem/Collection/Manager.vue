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
        :data="devJsonData"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useDevCollectionJson } from 'fireux-core/runtime/composables/dev/useDevCollectionJson'
import { computed } from 'vue'
import { useCollectionSearch } from '../../../../composables/shared/useCollectionSearch'
import {
  useEcosystemInterface,
  type EcosystemInterfaceInput,
} from '../../../../composables/fireux/firestore/system/ecosystem/utils/view/useEcosystemInterface'

const props = withDefaults(
  defineProps<{
    collection?: EcosystemInterfaceInput[]
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
    collection: () => [],
    title: 'Ecosystems',
    description: 'Browse ecosystems available in this workspace.',
    link: false,
    searchPlaceholder: 'Search ecosystems…',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    initialVariant: 'cell',
  }
)

const rawCollection = computed(() => props.collection ?? [])
const { devJsonData } = useDevCollectionJson(rawCollection)
const title = computed(() => String(props.title || 'Ecosystems'))
const description = computed(() => String(props.description || '').trim())
const linkEnabled = computed(() => props.link !== false)
const searchPlaceholder = computed(() =>
  String(props.searchPlaceholder || 'Search ecosystems…')
)
const showSearch = computed(() => props.showSearch !== false)
const showVariantToggle = computed(() => props.showVariantToggle !== false)
const showCount = computed(() => props.showCount !== false)
const {
  interface: makeCard,
  pill: makePill,
  cell: makeCell,
} = useEcosystemInterface()

const collection = computed<EcosystemInterfaceInput[]>(() =>
  rawCollection.value.filter((row): row is EcosystemInterfaceInput =>
    Boolean(makeCard(row))
  )
)

const { query, variant, toggleVariant, visibleItems, visibleCount } =
  useCollectionSearch<
    EcosystemInterfaceInput,
    NonNullable<ReturnType<typeof makeCard>>
  >({
    items: collection,
    makeCard: (row) => makeCard(row),
    initialVariant: props.initialVariant,
  })

const cardsFiltered = computed<NonNullable<ReturnType<typeof makeCard>>[]>(() =>
  visibleItems.value
    .map((row) => {
      if (variant.value === 'cell') {
        const base = makeCard(row)
        const cell = makeCell(row)
        if (!base || !cell) return null
        return { ...base, ...cell }
      }

      return makePill(row)
    })
    .filter((card): card is NonNullable<ReturnType<typeof makeCard>> =>
      Boolean(card)
    )
)

const totalCount = computed(() => collection.value.length)
const showSearchInput = computed(
  () => showSearch.value && totalCount.value > 15
)
const isDev = import.meta.dev
</script>
