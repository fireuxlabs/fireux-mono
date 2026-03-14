<template>
  <UCard>
    <template #header>
      <div class="collection-manager__header">
        <div class="collection-manager__title">
          <div>{{ title }}</div>
          <p v-if="description">{{ description }}</p>
        </div>

        <div class="collection-manager__controls">
          <UInput
            v-model="query"
            size="xs"
            placeholder="Search portfolios…"
          />

          <UBadge variant="soft">{{ visibleCount }} / {{ totalCount }}</UBadge>
        </div>
      </div>
    </template>

    <div v-if="cardsFiltered.length" class="space-y-2">
      <PortfolioCardsPill
        v-for="item in cardsFiltered"
        :key="item.id"
        :to="''"
        :title="item.title"
        :subtitle="item.subtitle"
        :badges="item.badges"
        :action="true"
        @action="select(item.id)"
      />
    </div>

    <p v-else>
      {{ query ? 'No portfolios match your search.' : 'No portfolios found.' }}
    </p>

    <div v-if="isDev">
      <DevJson
        title="Portfolios (JSON)"
        context="collection manager · portfolios · root: portfolios"
        :data="collection"
        :default-open="false"
      />
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useRouter } from '#imports'
import { computed } from 'vue'
import { useCollectionSearch } from 'fireux-core/runtime/composables/shared/useCollectionSearch'
import { useRuntimePortfolioSelection } from '../../../../composables/fireux/app/portfolio-runtime/state'
import { usePortfolioInterface } from '../../../../composables/fireux/firestore/portfolio/utils/view/usePortfolioInterface'
import type { Portfolio } from '../../../../models/portfolio.model'
import PortfolioCardsPill from '../Cards/Pill.vue'

const props = withDefaults(
  defineProps<{
    collection?: Portfolio[]
    title?: string
    description?: string
  }>(),
  {
    title: 'Available Portfolios',
    description: '',
  }
)

const router = useRouter()
const { setRuntimePortfolio } = useRuntimePortfolioSelection()
const { pill: makeCard, searchText } = usePortfolioInterface()
const collection = computed(() => props.collection ?? [])

const {
  query,
  cards: cardsFiltered,
  visibleCount,
} = useCollectionSearch<Portfolio, NonNullable<ReturnType<typeof makeCard>>>({
  items: collection,
  searchText: (portfolio) => searchText(portfolio),
  makeCard: (portfolio) => makeCard(portfolio),
})

const totalCount = computed(() => collection.value.length)
const isDev = import.meta.dev

const select = async (portfolioId: string) => {
  const resolvedId = String(portfolioId || '').trim()
  setRuntimePortfolio({ portfolioId: resolvedId, mode: 'live' })
  await router.push('/console/portfolio/overview')
}
</script>
