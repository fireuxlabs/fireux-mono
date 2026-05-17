<template>
  <EntityOperatorBridge
    entity-label="Portfolio"
    :entity-title="portfolioTitle"
    :public-to="publicTo"
    console-to="/console/portfolio"
    :signed-in="Boolean(userId)"
    :has-authority="hasAuthority"
    :missing="!publicPortfolio && !pending"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import EntityOperatorBridge from 'fireux-core/runtime/components/entity/OperatorBridge.vue'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import {
  usePortfolioCollection,
  type PortfolioCollectionFilter,
} from '../../../composables/fireux/firestore/portfolio/fetch/usePortfolioCollection'

definePageMeta({
  layout: 'default',
  name: 'PortfolioOperatorBridgePage',
})

const route = useRoute()
const { uid } = useAuth()
const portfolioId = computed(() => String(route.params.id || '').trim())
const userId = computed(() => String(uid.value || '').trim())
const operatorFilter = computed<PortfolioCollectionFilter>(() =>
  userId.value ? { operatorId: userId.value } : { ids: [] }
)
const { portfolios: publicPortfolios, pending } = usePortfolioCollection()
const { portfolios: operatorPortfolios } = usePortfolioCollection({
  filter: operatorFilter,
})

const publicPortfolio = computed(() =>
  publicPortfolios.value.find((portfolio) => portfolio.id === portfolioId.value) ?? null
)
const hasAuthority = computed(() =>
  Boolean(portfolioId.value && operatorPortfolios.value.some((portfolio) => portfolio.id === portfolioId.value))
)
const portfolioTitle = computed(() =>
  String(publicPortfolio.value?.name || portfolioId.value || 'Portfolio').trim()
)
const publicTo = computed(() =>
  portfolioId.value ? `/portfolios/${encodeURIComponent(portfolioId.value)}` : '/portfolios'
)
</script>
