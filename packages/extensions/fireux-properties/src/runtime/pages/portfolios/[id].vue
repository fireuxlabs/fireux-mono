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
        <PortfolioPublicOperatorPanel :portfolio="portfolio" />

        <!-- dev -->
        <DevDebugPanel
          object-origin="fetched"
          launcher
          include-route
          title="Portfolio detail (JSON)"
          context="portfolio detail · canonical root"
          :objects="[portfolio]"
          :derived="{ routeKey }"
          :default-open="false"
        />
      </div>
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { usePortfolioDetail } from '../../portfolio/composables/usePortfolioDetail'
import { usePortfolioSeo } from '../../portfolio/composables/usePortfolioSeo'
import { usePortfolioInterface } from '../../portfolio/composables/firestore/utils/view/usePortfolioInterface'

definePageMeta({
  layout: 'default',
  title: 'Portfolio',
  description: 'View a portfolio.',
  name: 'PortfolioDetailPage',
})

const routeKey = useRouteParam('id')
const { portfolio, pending } = await usePortfolioDetail(routeKey)
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
