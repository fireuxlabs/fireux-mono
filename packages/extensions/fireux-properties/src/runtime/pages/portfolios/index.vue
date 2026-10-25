<template>
  <UPage>
    <UPageBody>
      <PortfolioHero />
      <PortfolioCreate />
      <PortfolioCollection :portfolios="portfolios" />
      <FireCollectionPagination
        :has-more="hasMore"
        :loading="loadingMore"
        @load-more="loadMore"
      />
      <FireDiagnosticsDebugPanel
        title="Portfolios index acquisition"
        context="Canonical Portfolios and pagination inputs used by the FL index surface."
        object-origin="fetched"
        :objects="{ portfolios }"
        :derived="{ count: portfolios.length, hasMore, loadingMore }"
        include-route
        launcher
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { usePortfolioDirectory } from '../../portfolio/composables/usePortfolioDirectory'

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

const pageTitle = 'Portfolios'
const pageDescription =
  'Browse property portfolios and open the tools for managing one.'
const { appName } = useFireUXConfig()
const { portfolios, hasMore, loadingMore, loadMore } = usePortfolioDirectory()
useSeo({
  title: `${appName} | ${pageTitle}`,
  description: pageDescription,
  path: '/portfolios',
})
</script>
