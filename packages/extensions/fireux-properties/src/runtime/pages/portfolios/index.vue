<template>
  <UPage>
    <UPageHeader class="border-b-0" :title="pageTitle" />
    <UPageBody class="pagebody">
      <PortfolioCTA />
      <PortfolioCollectionManager
        :collection="collection"
        title="Available Portfolios"
        description=""
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { usePortfolioCollection } from '../../composables/fireux/firestore/portfolio/fetch/usePortfolioCollection'

definePageMeta({
  tag: 'portfolios',
  layout: 'default',
  title: 'Portfolios',
  description: 'Browse portfolios.',
  nav: {
    key: 'portfolios',
    label: 'Portfolios',
    icon: 'i-lucide-building',
    order: 35,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  name: 'GranitePortfoliosIndexPage',
})

const pageTitle = 'Portfolios'
const { appName } = useFireUXConfig()
useHead({ title: `${appName} | ${pageTitle}` })
const { collection } = usePortfolioCollection()
</script>
