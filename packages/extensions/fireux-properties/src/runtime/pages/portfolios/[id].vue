<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription">
      <template #links>
        <UButton
          v-if="portfolioId"
          :to="`/portfolios/${encodeURIComponent(portfolioId)}/operator`"
          color="neutral"
          variant="soft"
          icon="i-lucide-key-round"
        >
          Operator
        </UButton>
      </template>
    </UPageHeader>

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
      <PortfolioCardsProfile
        v-else-if="portfolioCard"
        :card="portfolioCard"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePortfolioCollection } from '../../composables/fireux/firestore/portfolio/fetch/usePortfolioCollection'
import { usePortfolioInterface } from '../../composables/fireux/firestore/portfolio/utils/view/usePortfolioInterface'

definePageMeta({
  layout: 'default',
  name: 'PortfolioDetailPage',
})

const route = useRoute()
const portfolioId = computed(() => String(route.params.id || '').trim())
const { portfolios, pending } = usePortfolioCollection()
const { profile } = usePortfolioInterface()
const portfolio = computed(() =>
  portfolios.value.find((entry) => entry.id === portfolioId.value) ?? null
)
const portfolioCard = computed(() => profile(portfolio.value))
const pageTitle = computed(() =>
  portfolioCard.value?.title || portfolioId.value || 'Portfolio'
)
const pageDescription = computed(() =>
  portfolioCard.value?.summary || 'Portfolio public information surface.'
)
</script>
