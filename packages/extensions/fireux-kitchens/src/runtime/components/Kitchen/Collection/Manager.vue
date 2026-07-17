<template>
  <section class="kitchen-directory">
    <div class="kitchen-directory__header">
      <div class="kitchen-directory__title">
        <p class="kitchen-directory__eyebrow">Browse</p>
        <h2>{{ title }}</h2>
        <p v-if="description">{{ description }}</p>
      </div>

      <div class="kitchen-directory__controls">
        <UInput
          v-if="showSearchInput"
          v-model="query"
          :placeholder="searchPlaceholder"
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

        <span v-if="showCount" class="kitchen-directory__count">
          {{ countLabel }}
        </span>
      </div>
    </div>

    <div v-if="pending" class="kitchen-directory__state">
      <UIcon name="i-lucide-loader-circle" class="animate-spin" />
      <p>Finding kitchens…</p>
    </div>

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

    <div v-else class="kitchen-directory__state">
      <UIcon name="i-lucide-utensils" />
      <div>
        <h3>{{ query ? 'No matching kitchens' : 'No kitchens yet' }}</h3>
        <p>
          {{ query
            ? 'Try a different kitchen name or location.'
            : 'Published kitchens will appear here when they are ready.' }}
        </p>
      </div>
    </div>

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
  onMounted,
  ref,
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
const hydrated = ref(false)
const pending = computed(() =>
  fetched.pending.value || (!hydrated.value && !collectionSurface.value.length)
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

onMounted(() => {
  hydrated.value = true
})
</script>

<style scoped>
.kitchen-directory {
  display: grid;
  gap: clamp(1.75rem, 4vw, 3rem);
}

.kitchen-directory__header {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1.5rem 3rem;
  flex-wrap: wrap;
}

.kitchen-directory__title {
  max-width: 40rem;
}

.kitchen-directory__eyebrow {
  margin: 0 0 0.6rem;
  color: var(--ui-primary);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.kitchen-directory__title h2 {
  margin: 0;
  color: var(--ui-text-highlighted);
  font-size: clamp(2rem, 5vw, 3.75rem);
  font-weight: 650;
  letter-spacing: -0.045em;
  line-height: 1;
}

.kitchen-directory__title > p:last-child {
  margin: 1rem 0 0;
  color: var(--ui-text-muted);
  font-size: 1rem;
  line-height: 1.6;
}

.kitchen-directory__controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 2.5rem;
}

.kitchen-directory__search {
  width: min(18rem, 65vw);
}

.kitchen-directory__count {
  min-width: max-content;
  padding-left: 0.35rem;
  color: var(--ui-text-muted);
  font-size: 0.78rem;
  font-weight: 600;
}

.kitchen-directory__state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  min-height: 13rem;
  padding: 2rem;
  border: 1px dashed color-mix(in srgb, var(--ui-primary) 28%, var(--ui-border));
  border-radius: 1.25rem;
  background: color-mix(in srgb, var(--ui-primary) 3%, var(--ui-bg));
  color: var(--ui-text-muted);
  text-align: left;
}

.kitchen-directory__state > svg {
  width: 1.5rem;
  height: 1.5rem;
  flex: 0 0 auto;
  color: var(--ui-primary);
}

.kitchen-directory__state h3,
.kitchen-directory__state p {
  margin: 0;
}

.kitchen-directory__state h3 {
  color: var(--ui-text-highlighted);
  font-weight: 650;
}

.kitchen-directory__state p {
  margin-top: 0.25rem;
  font-size: 0.875rem;
}

.kitchen-directory :deep(.collection-stack) {
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
  gap: 1rem;
}

@media (max-width: 640px) {
  .kitchen-directory__header,
  .kitchen-directory__controls {
    align-items: flex-start;
  }

  .kitchen-directory__controls {
    width: 100%;
  }

  .kitchen-directory__count {
    margin-left: auto;
    align-self: center;
  }
}
</style>
