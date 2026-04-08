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

    <KitchenCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <KitchenCardsPill
          v-bind="card"
          :link="linkEnabled"
          :action="actionEnabled"
          :show-badges="showBadges"
          @action="emit('select', card.id)"
        />
      </template>
      <template #cell="{ card }">
        <KitchenCardsCell
          v-bind="card"
          :link="linkEnabled"
          :action="actionEnabled"
          :show-source="showBadges"
          @action="emit('select', card.id)"
        />
      </template>
    </KitchenCollectionList>

    <p v-else>
      {{ query ? 'No kitchens match your search.' : 'No kitchens found.' }}
    </p>

    <div v-if="isDev">
      <DevJson
        :title="devJsonTitle"
        :context="devJsonContext"
        :data="devJsonData"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useDevCollectionJson } from 'fireux-core/runtime/composables/dev/useDevCollectionJson'
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch';
import { computed } from 'vue';
import { useKitchenInterface } from '../../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface';
import type { Kitchen } from '../../../../models/kitchen.model';

const props = withDefaults(
  defineProps<{
    collection?: Kitchen[]
    title?: string
    description?: string
    searchPlaceholder?: string
    showSearch?: boolean
    showVariantToggle?: boolean
    showCount?: boolean
    initialVariant?: 'pill' | 'cell'
    link?: boolean
    action?: boolean
    showBadges?: boolean
    devJsonTitle?: string
    devJsonContext?: string
  }>(),
  {
    title: 'Kitchens',
    description: 'Browse kitchen records available to this runtime.',
    searchPlaceholder: 'Search kitchens…',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    initialVariant: 'pill',
    link: true,
    action: false,
    showBadges: true,
    devJsonTitle: 'Kitchens (JSON)',
    devJsonContext: 'collection manager · kitchens',
  }
)

const emit = defineEmits<{
  (event: 'select', kitchenId: string): void
}>()

const collection = computed(() => props.collection ?? [])
const { devJsonData } = useDevCollectionJson(collection)
const title = computed(() => String(props.title || 'Kitchens'))
const description = computed(() => String(props.description || 'Browse kitchen records available to this runtime.').trim())
const searchPlaceholder = computed(() => String(props.searchPlaceholder || 'Search kitchens…'))
const showSearch = computed(() => props.showSearch !== false)
const showVariantToggle = computed(() => props.showVariantToggle !== false)
const showCount = computed(() => props.showCount !== false)
const linkEnabled = computed(() => props.link !== false)
const actionEnabled = computed(() => props.action === true)
const showBadges = computed(() => props.showBadges !== false)
const devJsonTitle = computed(() => String(props.devJsonTitle || 'Kitchens (JSON)').trim())
const devJsonContext = computed(() => String(props.devJsonContext || 'collection manager · kitchens').trim())
const { interface: makeCard, searchText } = useKitchenInterface()

const {
  query,
  variant,
  toggleVariant,
  cards: cardsFiltered,
  visibleCount,
} = useCollectionSearch<Kitchen, ReturnType<typeof makeCard>>({
  items: collection,
  searchText: (kitchen: Kitchen) => searchText(kitchen),
  makeCard: (kitchen: Kitchen) => makeCard(kitchen),
  initialVariant: props.initialVariant,
})
const totalCount = computed(() => collection.value.length)
const showSearchInput = computed(() => showSearch.value && totalCount.value > 15)
const isDev = import.meta.dev
</script>
