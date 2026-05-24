<template>
  <UPage>
    <UPageHeader class="pageheader" :title="pageTitle" :description="pageDescription" />
    <UPageBody class="pagebody">
      <PortfolioCTA :count="portfolios.length" />

      <UCard v-if="pending">
        <p>Loading portfolios…</p>
      </UCard>

      <PortfolioCollectionManager
        v-else
        :collection="portfolios"
        :source-mode="sourceMode"
        :show-source-toggle="true"
        @update:source-mode="sourceMode = $event"
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { ref } from 'vue'
import {
  usePortfolioCollection,
  type PortfolioCollectionSource,
} from '../../composables/fireux/firestore/portfolio/fetch/usePortfolioCollection'

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
  title: 'Portfolios',
  description: 'Browse portfolios.',
  layout: 'default',
  name: 'PortfoliosIndexPage',
})

const pageTitle = 'Portfolios'
const pageDescription = 'Select a portfolio runtime for the current workspace.'
const sourceMode = ref<PortfolioCollectionSource>('live')
const { appName } = useFireUXConfig()
useHead({ title: `${appName} | ${pageTitle}` })
const { portfolios, pending } = usePortfolioCollection({
  source: sourceMode,
})
</script>
