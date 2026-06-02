<template>
  <UPage>
    <UPageHeader
      class="pageheader"
      :title="pageTitle"
      description="Browse portfolios that can be operated in this app."
    />

    <UPageBody class="pagebody">
      <EntityIndexCta
        family="console"
        cta="Create or open a portfolio console to manage clients, properties, documents, and tasks."
      />

      <PortfolioCollectionManager />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'

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
  description: 'Browse portfolios.',
})

const pageTitle = 'Portfolios'
const { appName } = useFireUXConfig()
useHead({ title: `${appName} | ${pageTitle}` })
</script>
