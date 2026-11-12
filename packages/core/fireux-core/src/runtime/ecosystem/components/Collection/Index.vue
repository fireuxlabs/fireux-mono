<template>
  <section class="entity-collection ecosystem-collection">
    <FireCollectionHeader :title="title" :description="description">
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
    </FireCollectionHeader>

    <EcosystemCollectionList
      v-if="cardsFiltered.length"
      :cards="cardsFiltered"
    />
  </section>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-19 15:47 CEST — Repo Efficiency Pass 4: shared pill/cell card mechanics; domain manager retained.
import { computed } from 'vue'
import { useCollectionSearch } from '../../../composables/shared/useCollectionSearch'
import {
  useEcosystemView,
  type EcosystemDirectoryCard,
} from '../../composables/useEcosystemView'
import type { EcosystemDirectoryEntry } from '../../models/ecosystem-directory'

const props = defineProps<{
  ecosystems: EcosystemDirectoryEntry[]
}>()

const collection = computed(() => props.ecosystems)
const title = 'Active Ecosystems'
const description = 'Each Ecosystem groups Apps and belongs to one Project.'
const searchPlaceholder = 'Search ecosystems…'
const showCount = true
const { toDirectoryCard } = useEcosystemView()

const { query, visibleItems, visibleCount } = useCollectionSearch<
  EcosystemDirectoryEntry,
  EcosystemDirectoryCard
>({
  items: collection,
  makeCard: toDirectoryCard,
  initialVariant: 'cell',
})

const cardsFiltered = computed(() => visibleItems.value.map(toDirectoryCard))

const totalCount = computed(() => props.ecosystems.length)
const showSearchInput = computed(() => totalCount.value > 15)
const countLabel = computed(() =>
  showSearchInput.value && query.value
    ? `${visibleCount.value} / ${totalCount.value}`
    : `${totalCount.value}`
)
</script>
