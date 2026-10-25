<template>
  <UPage>
    <UPageBody>
      <PortfolioDetail v-if="portfolio" :portfolio="portfolio" />
      <FireDiagnosticsDebugPanel
        title="Portfolio detail acquisition"
        context="Canonical Portfolio fetched by the detail route."
        object-origin="fetched"
        :objects="{ portfolio }"
        :derived="{ routeKey }"
        include-route
        launcher
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { usePortfolioDetail } from '../../portfolio/composables/usePortfolioDetail'

definePageMeta({
  layout: 'default',
  title: 'Portfolio',
  description: 'View Portfolio details.',
})

const routeKey = useRouteParam('id')
const { portfolio, ready } = usePortfolioDetail(routeKey)
await ready
</script>
