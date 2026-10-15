<template>
  <section class="entity-collection ecosystem-collection">
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
  type EcosystemInterfaceInput,
} from '../../composables/useEcosystemView'
import type { EcosystemDirectoryEntry } from '../../../models/utils/directory.ts'

const props = defineProps<{
  ecosystems: EcosystemDirectoryEntry[]
}>()

const rawCollection = computed<EcosystemInterfaceInput[]>(() =>
  props.ecosystems.map((entry) => ({
    ...entry,
    href: entry.detail_url,
    appCount: entry.app_count,
  }))
)
const title = 'Active Ecosystems'
const description = 'Each Ecosystem groups Apps and belongs to one Project.'
const searchPlaceholder = 'Search ecosystems…'
const showCount = true
const { interface: makeCard } = useEcosystemView()

const collection = computed<EcosystemInterfaceInput[]>(() =>
  rawCollection.value.filter((row): row is EcosystemInterfaceInput =>
    Boolean(makeCard(row))
  )
)

const { query, visibleItems, visibleCount } = useCollectionSearch<
  EcosystemInterfaceInput,
  NonNullable<ReturnType<typeof makeCard>>
>({
  items: collection,
  makeCard: (row) => makeCard(row),
  initialVariant: 'cell',
})

const cardsFiltered = computed(() =>
  visibleItems.value
    .map(makeCard)
    .filter((card): card is NonNullable<typeof card> => Boolean(card))
)

const totalCount = computed(() => collection.value.length)
const showSearchInput = computed(() => totalCount.value > 15)
const countLabel = computed(() =>
  showSearchInput.value && query.value
    ? `${visibleCount.value} / ${totalCount.value}`
    : `${totalCount.value}`
)
</script>
