<template>
  <DirectorySurface
    eyebrow="Discover"
    :title="pageTitle"
    :description="pageDescription"
    icon="i-lucide-building-2"
    secondary-label="Portfolio tools"
  >
    <PortfolioCollectionManager />

    <template #secondary>
      <PortfolioCTA />
    </template>
  </DirectorySurface>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'

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
useHead({ title: `${appName} | ${pageTitle}` })
</script>
