<template>
  <section class="entity-collection portfolio-collection">
    <CollectionHeader
      title="Portfolios"
      description="Browse property portfolios available through this app."
    >
      <template #controls>
        <UInput
          v-if="portfolios.length > 15"
          v-model="query"
          placeholder="Search portfolios…"
          aria-label="Search portfolios"
          icon="i-lucide-search"
          class="entity-collection__search"
        />
        <span class="entity-collection__count"
          >{{ visibleCount }} portfolios</span
        >
      </template>
    </CollectionHeader>
    <PortfolioCollectionList :cards="cards" />
  </section>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
import type { PortfolioPublicSummary } from '../../models/portfolio-read.model'
import {
  usePortfolioInterface,
  type PortfolioCard,
} from '../../composables/firestore/utils/view/usePortfolioInterface'
const props = defineProps<{
  portfolios: PortfolioPublicSummary[]
}>()
const portfolios = computed(() => props.portfolios)
const { cell } = usePortfolioInterface()
const { query, visibleItems, visibleCount } = useCollectionSearch({
  items: portfolios,
  makeCard: cell,
  initialVariant: 'cell',
})
const cards = computed<PortfolioCard.Card[]>(() =>
  visibleItems.value.flatMap((portfolio) => {
    const card = cell(portfolio)
    return card ? [card] : []
  })
)
</script>
