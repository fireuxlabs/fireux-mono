<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      :title="pageTitle"
      :description="pageDescription"
    />

    <UPageBody class="pagebody">
      <UPageCard v-if="pending" variant="subtle">
        <p class="text-sm text-dimmed">Loading portfolio…</p>
      </UPageCard>

      <UPageCard
        v-else-if="!portfolio"
        title="Portfolio not found"
        description="This portfolio could not be found in the current runtime."
        variant="subtle"
      />

      <div v-else class="space-y-4">
        <!-- profile -->
        <PortfolioCardsProfile v-if="profileCard" :card="profileCard" />

        <!-- main -->

        <!-- operator -->
        <PortfolioPublicOperator />

        <!-- dev -->
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useRoute } from '#imports'
import { computed } from 'vue'
import { usePortfolioFetch } from '../../composables/fireux/firestore/portfolio/fetch/usePortfolioFetch'
import { usePortfolioSeo } from '../../composables/fireux/firestore/portfolio/utils/usePortfolioSeo'
import { usePortfolioInterface } from '../../composables/fireux/firestore/portfolio/utils/view/usePortfolioInterface'

definePageMeta({
  layout: 'default',
  title: 'Portfolio',
  description: 'View a portfolio.',
  name: 'PortfolioDetailPage',
})

const route = useRoute()
const routeKey = computed(() => String(route.params.id || '').trim())
const { portfolio, pending } = usePortfolioFetch(routeKey)
const { profile } = usePortfolioInterface()
const profileCard = computed(() => profile(portfolio.value))
const pageTitle = computed(() =>
  profileCard.value?.title || routeKey.value || 'Portfolio'
)
const pageDescription = computed(() =>
  profileCard.value?.summary || 'Portfolio public information surface.'
)
usePortfolioSeo(portfolio)
</script>
