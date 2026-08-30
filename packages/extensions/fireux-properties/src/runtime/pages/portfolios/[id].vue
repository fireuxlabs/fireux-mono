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
  description: 'View a portfolio.',
  name: 'PortfolioDetailPage',
})

const routeKey = useRouteParam('id')
const { portfolio } = await usePortfolioDetail(routeKey)
</script>
