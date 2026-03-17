<template>
  <UPage>
    <UPageHeader class="pageheader" :title="pageTitle" :description="pageDescription" />
    <UPageBody class="pagebody">
      <PortfolioCTA />
      <PortfolioCollectionManager :collection="collection" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { computed } from 'vue'
import { usePortfolioFetch } from '../../composables/fireux/firestore/portfolio/fetch/usePortfolioFetch'

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
  },
  title: 'Portfolios',
  description: 'Browse portfolios.',
  layout: 'default',
  name: 'PortfoliosIndexPage',
})

const pageTitle = 'Portfolios'
const pageDescription = 'Browse portfolios.'
const { appName } = useFireUXConfig()
useHead({ title: `${appName} | ${pageTitle}` })
const { portfolios } = usePortfolioFetch()
const collection = computed(() => portfolios.value ?? [])
</script>
