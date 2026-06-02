<template>
  <UPage>
    <UPageHeader class="pageheader" :title="pageTitle" :description="pageDescription" />

    <UPageBody class="pagebody">
      <UAlert
        v-if="pending"
        color="neutral"
        variant="soft"
        title="Loading portfolio"
        description="Fetching the selected portfolio."
      />
      <UAlert
        v-else-if="!portfolio"
        color="warning"
        variant="soft"
        title="Portfolio not found"
        description="This portfolio could not be found in the current runtime."
      />
      <template v-else-if="portfolioCard">
        <PortfolioCardsProfile :card="portfolioCard" />

        <EntityOperatorPanel entity-label="Portfolio" />
      </template>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePortfolioFetch } from '../../composables/fireux/firestore/portfolio/fetch/usePortfolioFetch'
import { usePortfolioSeo } from '../../composables/fireux/firestore/portfolio/utils/usePortfolioSeo'
import { usePortfolioInterface } from '../../composables/fireux/firestore/portfolio/utils/view/usePortfolioInterface'

definePageMeta({
  layout: 'default',
  name: 'PortfolioDetailPage',
})

const route = useRoute()
const portfolioId = computed(() => String(route.params.id || '').trim())
const { portfolio, pending } = usePortfolioFetch(portfolioId)
const { profile } = usePortfolioInterface()
const portfolioCard = computed(() => profile(portfolio.value))
const pageTitle = computed(() =>
  portfolioCard.value?.title || portfolioId.value || 'Portfolio'
)
const pageDescription = computed(() =>
  portfolioCard.value?.summary || 'Portfolio public information surface.'
)

usePortfolioSeo(portfolio)
</script>
