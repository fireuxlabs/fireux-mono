<template>
  <section class="entity-collection kitchen-collection">
    <div class="kitchen-collection__toolbar">
      <UInput
        v-model="query"
        :placeholder="searchPlaceholder"
        :aria-label="searchPlaceholder"
        icon="i-lucide-search"
        size="xl"
        class="kitchen-collection__search"
      />

      <span v-if="showCount && isSettled" class="kitchen-collection__count">
        {{ countLabel }}
      </span>
    </div>

    <MoleculesStateCard
      surface="collection"
      v-if="outcome === 'pending'"
      title="Loading kitchens"
      loading
      icon="i-lucide-loader-circle"
      description="Finding kitchens…"
      aria-atomic="true"
    />

    <MoleculesStateCard
      surface="collection"
      v-else-if="outcome === 'error'"
      title="Kitchens unavailable"
      description="Kitchens could not be loaded. Please try again."
      icon="i-lucide-triangle-alert"
      state="error"
      aria-atomic="true"
    >
      <template #actions>
        <UButton
          label="Try again"
          color="neutral"
          variant="soft"
          icon="i-lucide-refresh-cw"
          @click="refreshCollection"
        />
      </template>
    </MoleculesStateCard>

    <div v-else-if="cardsFiltered.length" class="kitchen-collection__results">
      <KitchenCollectionList :cards="cardsFiltered" :variant="variant">
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
    </div>

    <div v-else>
      <MoleculesStateCard
        surface="collection"
        icon="i-lucide-utensils"
        :title="query ? 'No matching kitchens' : 'No kitchens yet'"
        :description="
          query
            ? 'Try a different kitchen name or location.'
            : 'Kitchens will appear here when they are added.'
        "
      />
    </div>

    <div>
      <DevDebugPanel
        object-origin="fetched"
        launcher
        include-route
        :title="devJsonTitle"
        :context="devJsonContext"
        :objects="devJsonData"
        :derived="{}"
        :default-open="false"
        @opened="loadDevJson"
        @closed="unloadDevJson"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { useDevCollectionJson } from 'fireux-core/runtime/composables/dev/useDevCollectionJson'
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
import { useCollectionVariantCards } from 'fireux-core/runtime/composables/shared/useCollectionVariantCards'
// Concurrent edit — 2026-07-19 15:47 CEST — Repo Efficiency Pass 4: shared pill/cell card mechanics; domain manager retained.
import { computed } from 'vue'
import { useKitchenCollection } from '../../composables/firestore/fetch/useKitchenCollection'
import { useKitchenInterface } from '../../composables/firestore/utils/view/useKitchenInterface'
import type { KitchenSurface } from '../../composables/firestore/utils/view/useKitchenInterface'

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
    title: 'Kitchen collection',
    description: '',
    searchPlaceholder: 'Search kitchens…',
    showSearch: true,
    showVariantToggle: false,
    showCount: true,
    initialVariant: 'cell',
    link: true,
    showBadges: false,
    devJsonTitle: 'Kitchens (JSON)',
    devJsonContext: 'collection manager · server-resolved Kitchen[]',
  }
)

const fetched = useKitchenCollection()
const {
  interface: makeCard,
  pill: makePill,
  cell: makeCell,
  surface,
} = useKitchenInterface()
const collectionSurface = computed<KitchenCollectionItem[]>(() =>
  fetched.collection.value.flatMap((kitchen) => {
    const item = surface({ kitchen, place: kitchen.place })
    return item ? [item] : []
  })
)
const outcome = computed(() => fetched.outcome.value)
const refreshCollection = async () => {
  await fetched.refresh()
}
const isSettled = computed(
  () => outcome.value === 'ready' || outcome.value === 'empty'
)
const { devJsonData, loadDevJson, unloadDevJson } = useDevCollectionJson(
  fetched.collection
)
const title = computed(() => String(props.title || 'Kitchen collection'))
const description = computed(() =>
  String(
    props.description || 'Choose a Kitchen to view its profile and menus.'
  ).trim()
)
const searchPlaceholder = computed(() =>
  String(props.searchPlaceholder || 'Search kitchens…')
)
const showSearch = computed(() => props.showSearch !== false)
const showCount = computed(() => props.showCount !== false)
const linkEnabled = computed(() => props.link !== false)
const showBadges = computed(
  () => props.showBadges !== false || fetched.canViewHidden.value
)
const devJsonTitle = computed(() =>
  String(props.devJsonTitle || 'Kitchens (JSON)').trim()
)
const devJsonContext = computed(() =>
  String(
    props.devJsonContext || 'collection manager · server-resolved Kitchen[]'
  ).trim()
)
const collection = computed<KitchenCollectionItem[]>(() =>
  collectionSurface.value.filter((row): row is KitchenCollectionItem =>
    Boolean(makeCard(row))
  )
)

const { query, variant, visibleItems, visibleCount } = useCollectionSearch<
  KitchenCollectionItem,
  NonNullable<ReturnType<typeof makeCard>>
>({
  items: collection,
  makeCard: (kitchen: KitchenCollectionItem) => makeCard(kitchen),
  initialVariant: props.initialVariant,
})

const { cards: cardsFiltered } = useCollectionVariantCards({
  items: visibleItems,
  variant,
  makeCard,
  makePill,
  makeCell,
})

const totalCount = computed(() => collection.value.length)
const countLabel = computed(() =>
  showSearch.value && query.value
    ? `${visibleCount.value} of ${totalCount.value} kitchens`
    : `${totalCount.value} kitchen${totalCount.value === 1 ? '' : 's'}`
)
</script>

<style scoped>
.kitchen-collection__results {
  display: grid;
  gap: calc(var(--spacing) * 5);
}

.kitchen-collection__toolbar {
  display: flex;
  gap: calc(var(--spacing) * 4);
  align-items: center;
  margin-bottom: calc(var(--spacing) * 8);
  padding-block: calc(var(--spacing) * 4);
  border-top: 1px solid var(--ui-border);
  border-bottom: 1px solid var(--ui-border);
}

.kitchen-collection__search {
  width: min(100%, 38rem);
}

.kitchen-collection__count {
  margin-left: auto;
  color: var(--ui-text-muted);
  font-size: 0.85rem;
  white-space: nowrap;
}

.kitchen-collection__more {
  display: flex;
  justify-content: center;
}

@media (max-width: 640px) {
  .kitchen-collection__toolbar {
    align-items: stretch;
    flex-direction: column;
  }
  .kitchen-collection__search {
    width: 100%;
  }
  .kitchen-collection__count {
    margin-left: 0;
  }
}
</style>
