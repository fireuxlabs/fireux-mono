<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <h2>{{ title }}</h2>
          <p>{{ description }}</p>
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
              :aria-label="searchPlaceholder"
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

            <UBadge v-if="showSettledCount" variant="soft"
              >{{ countLabel }}</UBadge
            >
          </div>
        </div>
      </div>
    </template>

    <MoleculesStateCard
      v-if="outcome === 'pending'"
      entity="chefs"
      state="loading"
      surface="bare"
    />

    <MoleculesStateCard
      v-else-if="outcome === 'error'"
      entity="chefs"
      state="error"
      surface="bare"
    />

    <ChefCollectionList
      v-else-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <ChefCardsPill v-bind="card" :link="linkEnabled" />
      </template>
      <template #cell="{ card }">
        <ChefCardsCell v-bind="card" :link="linkEnabled" />
      </template>
    </ChefCollectionList>

    <MoleculesStateCard
      v-else
      state="empty"
      surface="bare"
      :title="query ? 'No chefs match your search.' : 'No chefs found.'"
      :description="
        query
          ? 'Try a different search term.'
          : 'Chef profiles will appear here once they are available.'
      "
    />

    <div>
      <DevJson
        :title="'Chefs (JSON)'"
        context="collection manager · chefs"
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
import { useChefFetch } from '../../../composables/fireux/firestore/profiles/Chef/fetch/useChefFetch'
import { useChefInterface } from '../../../composables/fireux/firestore/profiles/Chef/utils/view/useChefInterface'
import type { Chef } from '../../../models/chef.model'

type ChefEntry = Partial<Chef> & { id: string, user?: unknown }

const props = withDefaults(
  defineProps<{
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
    title: 'Chefs',
    description: 'Browse chefs available to this runtime.',
    link: true,
    searchPlaceholder: 'Search chefs…',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    initialVariant: 'pill',
  }
)

const fetched = useChefFetch()
const { outcome } = fetched
const collection = computed<ChefEntry[]>(() =>
  [
    ...(fetched.appChefs.value ?? []),
    ...(fetched.coreChefs.value ?? []),
  ] as ChefEntry[]
)
const { devJsonData } = useDevCollectionJson(collection)
const title = computed(() => String(props.title || 'Chefs'))
const description = computed(() =>
  String(props.description || 'Browse chefs available to this runtime.')
)
const linkEnabled = computed(() => props.link !== false)
const searchPlaceholder = computed(() =>
  String(props.searchPlaceholder || 'Search chefs…')
)
const showSearch = computed(() => props.showSearch !== false)
const showVariantToggle = computed(() => props.showVariantToggle !== false)
const showCount = computed(() => props.showCount !== false)
const showSettledCount = computed(
  () =>
    showCount.value &&
    (outcome.value === 'ready' || outcome.value === 'empty')
)
const totalCount = computed(() => collection.value.length)
const showSearchInput = computed(
  () => showSearch.value && totalCount.value > 15
)
const {
  interface: makeCard,
  pill: makePill,
  cell: makeCell,
} = useChefInterface()
const { query, variant, toggleVariant, visibleItems, visibleCount } =
  useCollectionSearch<ChefEntry, NonNullable<ReturnType<typeof makeCard>>>({
    items: collection,
    makeCard: (entry) => makeCard(entry as Chef, (entry as any)?.user ?? null),
    initialVariant: props.initialVariant,
  })

const cardsFiltered = computed<NonNullable<ReturnType<typeof makeCard>>[]>(() =>
  visibleItems.value
    .map((entry) => {
      const user = (entry as any)?.user ?? null

      if (variant.value === 'cell') {
        const base = makeCard(entry as Chef, user)
        const cell = makeCell(entry as Chef, user)
        if (!base || !cell) return null
        return { ...base, ...cell }
      }

      return makePill(entry as Chef, user)
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
