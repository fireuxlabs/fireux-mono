<template>
  <UPage>
    <UPageHeader
      :title="pageTitle"
      description="Find and join portfolios, or create your own Portfolio Console."
    />

    <UPageBody>
      <!-- Console CTA family: actions live in PortfolioCTA; browse lives in PortfolioCollectionManager. -->
      <PortfolioCTA />

      <PortfolioCollectionManager />
    </UPageBody>
  </UPage>
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
  description: 'Find and join portfolios, or create your own Portfolio Console.',
})

const pageTitle = 'Portfolios'
const { appName } = useFireUXConfig()
useHead({ title: `${appName} | ${pageTitle}` })
</script>
