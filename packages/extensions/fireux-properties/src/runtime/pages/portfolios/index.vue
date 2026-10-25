<template>
  <UPage>
    <PortfolioHero />
    <UPageBody>
      <PortfolioCreate />
      <FireState v-bind="page.state" />
      <PortfolioCollection
        v-if="page.state.outcome === 'ready'"
        :portfolios="page.portfolios"
      />
      <FireCollectionPagination
        v-if="page.pagination"
        v-bind="page.pagination"
        @load-more="page.loadMore"
      />
      <FireDiagnosticsDebugPanel v-bind="page.diagnostics" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { usePortfolioCollectionPage } from '../../portfolio/composables/usePortfolioCollectionPage'

definePageMeta({
  tag: 'portfolios',
  nav: {
    key: 'portfolios',
    label: 'Portfolios',
    icon: 'i-lucide-building',
    order: 55,
    desktop: true,
    mobile: true,
    layouts: ['default'],
    visibility: {
      apps: ['granite-app'],
    },
  },
  layout: 'default',
  name: 'PortfoliosIndexPage',
  title: 'Portfolios',
  description:
    'Find and join portfolios, or create your own Portfolio Workspace.',
})

const page = usePortfolioCollectionPage()
</script>
