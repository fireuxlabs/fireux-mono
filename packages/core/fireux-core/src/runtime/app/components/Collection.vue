<template>
  <section class="entity-collection app-collection">
    <CollectionHeader :title="title" :description="description">
      <template #controls>
        <UInput
          v-if="showSearchInput"
          v-model="query"
          :placeholder="searchPlaceholder"
          :aria-label="searchPlaceholder"
          icon="i-lucide-search"
          class="entity-collection__search"
        />

        <span v-if="showCount" class="entity-collection__count">
          {{ countLabel }}
        </span>
      </template>
    </CollectionHeader>

    <AppCollectionList v-if="cardsFiltered.length" :cards="cardsFiltered" />
  </section>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-19 15:47 CEST — Repo Efficiency Pass 4: shared pill/cell card mechanics; domain manager retained.
import { computed } from 'vue'
import { useAppInterface } from '../composables/useAppInterface'
import type { App } from '../models/app.model'
import { useCollectionSearch } from '../../composables/shared/useCollectionSearch'

const props = defineProps<{
  apps: App[]
  scope: 'ecosystem' | 'platform'
}>()

const collection = computed<App[]>(() => props.apps)
const title = computed(() =>
  props.scope === 'platform' ? 'Platform Apps' : 'Ecosystem Apps'
)
const description = computed(() =>
  props.scope === 'platform'
    ? 'All Apps from their canonical ecosystem collections.'
    : 'Browse Apps available through this Ecosystem.'
)
const searchPlaceholder = 'Search apps…'
const showCount = true
const totalCount = computed(() => collection.value.length)
const showSearchInput = computed(() => totalCount.value > 15)
const { interface: makeCard } = useAppInterface()
const { query, visibleItems, visibleCount } = useCollectionSearch<
  App,
  NonNullable<ReturnType<typeof makeCard>>
>({
  items: collection,
  makeCard: (app) => makeCard(app),
})

const cardsFiltered = computed(() =>
  visibleItems.value
    .map((app) => makeCard(app))
    .filter((card): card is NonNullable<typeof card> => Boolean(card))
)

const countLabel = computed(() =>
  showSearchInput.value && query.value
    ? `${visibleCount.value} / ${totalCount.value}`
    : `${totalCount.value}`
)
</script>
