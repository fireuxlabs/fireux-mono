<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <h2>{{ title }}</h2>
          <p>{{ description }}</p>
        </div>

        <div
          class="collection-manager__controls"
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
      entity="professionals"
      state="loading"
      surface="bare"
    />

    <MoleculesStateCard
      v-else-if="outcome === 'error'"
      entity="professionals"
      state="error"
      surface="bare"
    />

    <ProfessionalCollectionList
      v-else-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <ProfessionalCardsPill v-bind="card" :link="linkEnabled" />
      </template>
      <template #cell="{ card }">
        <ProfessionalCardsCell v-bind="card" :link="linkEnabled" />
      </template>
    </ProfessionalCollectionList>

    <MoleculesStateCard
      v-else
      state="empty"
      surface="bare"
      :title="
        query
          ? 'No professionals match your search.'
          : 'No professionals found.'
      "
      :description="
        query
          ? 'Try a different search term.'
          : 'Professional profiles will appear here once they are available.'
      "
    />

    <div>
      <DevJson
        :title="'Professionals (JSON)'"
        context="collection manager · professionals"
        :data="devJsonData"
        :default-open="false"
        @opened="loadDevJson"
        @closed="unloadDevJson"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useDevCollectionJson } from 'fireux-core/runtime/composables/dev/useDevCollectionJson'
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
import { computed } from 'vue'
import { useProfessionalFetch } from '../../../composables/fireux/firestore/profiles/Professional/fetch/useProfessionalFetch'
import { useProfessionalInterface } from '../../../composables/fireux/firestore/profiles/Professional/utils/view/useProfessionalInterface'
import type { Professional } from '../../../models/profiles/Professional/Professional.model'
import ProfessionalCardsCell from '../Cards/Cell.vue'
import ProfessionalCardsPill from '../Cards/Pill.vue'
import ProfessionalCollectionList from './List.vue'

type ProfessionalEntry = Partial<Professional> & { id: string, user?: unknown }

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
    title: 'Professionals',
    description: 'Browse professionals available to this runtime.',
    link: true,
    searchPlaceholder: 'Search professionals…',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    initialVariant: 'pill',
  }
)

const fetched = useProfessionalFetch()
const { outcome } = fetched
const collection = computed<ProfessionalEntry[]>(() =>
  [
    ...(fetched.appProfessionals.value ?? []),
    ...(fetched.coreProfessionals.value ?? []),
  ] as ProfessionalEntry[]
)
const { devJsonData, loadDevJson, unloadDevJson } = useDevCollectionJson(collection)
const title = computed(() => String(props.title || 'Professionals'))
const description = computed(() =>
  String(props.description || 'Browse professionals available to this runtime.')
)
const linkEnabled = computed(() => props.link !== false)
const searchPlaceholder = computed(() =>
  String(props.searchPlaceholder || 'Search professionals…')
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
} = useProfessionalInterface()
const { query, variant, toggleVariant, visibleItems, visibleCount } =
  useCollectionSearch<
    ProfessionalEntry,
    NonNullable<ReturnType<typeof makeCard>>
  >({
    items: collection,
    makeCard: (entry) =>
      makeCard(entry as Professional, (entry as any)?.user ?? null),
    initialVariant: props.initialVariant,
  })

const cardsFiltered = computed<NonNullable<ReturnType<typeof makeCard>>[]>(() =>
  visibleItems.value
    .map((entry) => {
      const user = (entry as any)?.user ?? null

      if (variant.value === 'cell') {
        const base = makeCard(entry as Professional, user)
        const cell = makeCell(entry as Professional, user)
        if (!base || !cell) return null
        return { ...base, ...cell }
      }

      return makePill(entry as Professional, user)
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
