<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <div>{{ title }}</div>
          <p>{{ description }}</p>
        </div>

        <div class="collection-manager__controls">
          <UInput
            v-if="showSearch"
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
    </template>

    <KitchenCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
      :variant="variant"
    >
      <template #pill="{ card }">
        <NuxtLink
          :to="linkEnabled ? card.to : undefined"
          class="block"
          :class="linkEnabled ? '' : 'cursor-default'"
        >
          <KitchenCardsPill v-bind="card" />
        </NuxtLink>
      </template>
      <template #cell="{ card }">
        <NuxtLink
          :to="linkEnabled ? card.to : undefined"
          class="block"
          :class="linkEnabled ? '' : 'cursor-default'"
        >
          <KitchenCardsCell v-bind="card" />
        </NuxtLink>
      </template>
    </KitchenCollectionList>

    <p v-else>
      {{ query ? 'No kitchens match your search.' : 'No kitchens found.' }}
    </p>

    <div v-if="isDev">
      <DevJson
        :title="'Kitchens (JSON)'"
        context="collection manager · kitchens"
        :data="collection"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
import { computed } from 'vue'
import { useKitchenInterface } from '../../../../composables/fireux/firestore/kitchen/utils/view/useKitchenInterface'
import type { Kitchen } from '../../../../models/kitchen.model'

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
  }>(),
  {
    title: 'Kitchens',
    searchPlaceholder: 'Search kitchens…',
    showSearch: true,
    showVariantToggle: true,
    showCount: true,
    initialVariant: 'pill',
    link: true,
  }
)
const { appName } = useFireUXConfig()

const collection = computed(() => props.collection ?? [])
const title = computed(() => String(props.title || 'Kitchens'))
const description = computed(
  () => String(props.description || `Browse ${appName} kitchens.`)
)
const searchPlaceholder = computed(() => String(props.searchPlaceholder || 'Search kitchens…'))
const showSearch = computed(() => props.showSearch !== false)
const showVariantToggle = computed(() => props.showVariantToggle !== false)
const showCount = computed(() => props.showCount !== false)
const linkEnabled = computed(() => props.link !== false)
const { card: makeCard, searchText } = useKitchenInterface()

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
const isDev = import.meta.dev
</script>
