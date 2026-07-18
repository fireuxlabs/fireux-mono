<template>
  <section class="kitchen-directory">
    <CollectionDirectoryHeader :title="title" :description="description">
      <template #controls>
        <UInput
          v-if="showSearchInput"
          v-model="query"
          :placeholder="searchPlaceholder"
          :aria-label="searchPlaceholder"
          icon="i-lucide-search"
          class="kitchen-directory__search"
        />

        <UButton
          v-if="showVariantToggle"
          size="sm"
          color="neutral"
          variant="ghost"
          :icon="
            variant === 'pill' ? 'i-lucide-layout-grid' : 'i-lucide-list'
          "
          :aria-label="
            variant === 'pill'
              ? 'Switch to card view'
              : 'Switch to compact view'
          "
          @click="toggleVariant"
        />

        <span v-if="showCount && isSettled" class="kitchen-directory__count">
          {{ countLabel }}
        </span>
      </template>
    </CollectionDirectoryHeader>

    <CollectionDirectoryState
      v-if="outcome === 'pending'"
      title="Loading kitchens"
      loading
      icon="i-lucide-loader-circle"
      description="Finding kitchens…"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-atomic="true"
    />

    <CollectionDirectoryState
      v-else-if="outcome === 'error'"
      title="Kitchens unavailable"
      description="Published kitchens could not be loaded. Please try again."
      icon="i-lucide-triangle-alert"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    />

    <KitchenCollectionList
      v-else-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <KitchenCardsPill
          v-bind="card"
          :link="linkEnabled"
          :show-badges="showBadges"
        />
      </template>
      <template #cell="{ card }">
        <KitchenCardsCell
          v-bind="card"
          :link="linkEnabled"
          :show-badges="showBadges"
          directory
        />
      </template>
    </KitchenCollectionList>

    <CollectionDirectoryState
      v-else
      icon="i-lucide-utensils"
      :title="query ? 'No matching kitchens' : 'No kitchens yet'"
      :description="query
        ? 'Try a different kitchen name or location.'
        : 'Published kitchens will appear here when they are ready.'"
    />

    <div>
      <DevJson
        :title="devJsonTitle"
        :context="devJsonContext"
        :data="devJsonData"
        :default-open="false"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { useDevCollectionJson } from 'fireux-core/runtime/composables/dev/useDevCollectionJson'
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
import {
  computed,
} from 'vue'
import { useKitchenCollection } from '../../../composables/fireux/firestore/kitchen/useKitchen'
import { useKitchenInterface } from '../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import type { KitchenSurface } from '../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'

type KitchenCollectionItem = KitchenSurface

const props = withDefaults(
  defineProps<{
    title?: string
    description?: string
    searchPlaceholder?: string
    showSearch?: boolean
    showVariantToggle?: boolean
    showCount?: boolean
    initialVariant?: 'pill' | 'cell'
    link?: boolean
    showBadges?: boolean
    devJsonTitle?: string
    devJsonContext?: string
  }>(),
  {
    title: 'Kitchens',
    description: 'Choose a kitchen to explore its public profile and menus.',
    searchPlaceholder: 'Search kitchens…',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    initialVariant: 'cell',
    link: true,
    showBadges: false,
    devJsonTitle: 'Kitchens (JSON)',
    devJsonContext: 'collection manager · kitchens · collection surface',
  }
)

const fetched = useKitchenCollection()
const collectionSurface = computed<KitchenCollectionItem[]>(
  () => fetched.kitchens.value ?? []
)
const outcome = computed(() => fetched.outcome.value)
const isSettled = computed(() =>
  outcome.value === 'ready' || outcome.value === 'empty'
)
const { devJsonData } = useDevCollectionJson(collectionSurface)
const title = computed(() => String(props.title || 'Kitchens'))
const description = computed(() =>
  String(
    props.description || 'Browse kitchen records available to this runtime.'
  ).trim()
)
const searchPlaceholder = computed(() =>
  String(props.searchPlaceholder || 'Search kitchens…')
)
const showSearch = computed(() => props.showSearch !== false)
const showCount = computed(() => props.showCount !== false)
const linkEnabled = computed(() => props.link !== false)
const showVariantToggle = computed(() => props.showVariantToggle !== false)
const showBadges = computed(() => props.showBadges !== false)
const devJsonTitle = computed(() =>
  String(props.devJsonTitle || 'Kitchens (JSON)').trim()
)
const devJsonContext = computed(() =>
  String(
    props.devJsonContext || 'collection manager · kitchens · collection surface'
  ).trim()
)
const {
  interface: makeCard,
  pill: makePill,
  cell: makeCell,
} = useKitchenInterface()

const collection = computed<KitchenCollectionItem[]>(() =>
  collectionSurface.value
    .filter((row): row is KitchenCollectionItem => Boolean(makeCard(row)))
)

const { query, variant, toggleVariant, visibleItems, visibleCount } =
  useCollectionSearch<
    KitchenCollectionItem,
    NonNullable<ReturnType<typeof makeCard>>
  >({
    items: collection,
    makeCard: (kitchen: KitchenCollectionItem) => makeCard(kitchen),
    initialVariant: props.initialVariant,
  })

const cardsFiltered = computed<NonNullable<ReturnType<typeof makeCard>>[]>(() =>
  visibleItems.value
    .map((kitchen) => {
      if (variant.value === 'cell') {
        const base = makeCard(kitchen)
        const cell = makeCell(kitchen)
        if (!base || !cell) return null
        return { ...base, ...cell }
      }

      return makePill(kitchen)
    })
    .filter((card): card is NonNullable<ReturnType<typeof makeCard>> =>
      Boolean(card)
    )
)

const totalCount = computed(() => collection.value.length)
const showSearchInput = computed(
  () => showSearch.value && totalCount.value > 15
)
const countLabel = computed(() =>
  showSearchInput.value && query.value
    ? `${visibleCount.value} of ${totalCount.value} kitchens`
    : `${totalCount.value} kitchen${totalCount.value === 1 ? '' : 's'}`
)
</script>

<style scoped>
.kitchen-directory {
  display: grid;
  gap: clamp(calc(var(--spacing) * 7), 4vw, calc(var(--spacing) * 12));
}

.kitchen-directory__search {
  width: min(18rem, 65vw);
}

.kitchen-directory__count {
  min-width: max-content;
  padding-left: 0.35rem;
  color: var(--ui-text-muted);
  font-size: var(--text-xs);
  font-weight: var(--font-weight-semibold);
}

.kitchen-directory :deep(.collection-stack) {
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
  gap: calc(var(--spacing) * 4);
}

@media (max-width: 640px) {
  .kitchen-directory__count {
    margin-left: auto;
    align-self: center;
  }
}
</style>
