<template>
  <UPage>
    <UPageBody>
      <PortfolioDetail v-if="portfolio" :portfolio="portfolio" />
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
