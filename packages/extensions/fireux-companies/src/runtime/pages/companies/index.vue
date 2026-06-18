<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />

    <UPageBody>
      <CompanyCTA />
      <CompanyCollectionManager />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'

definePageMeta({
  layout: 'default',
  title: 'Companies',
  description: 'Browse companies.',
  nav: {
    key: 'companies',
    label: 'Companies',
    icon: 'i-lucide-building-2',
    order: 55,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  name: 'CompaniesIndexPage',
})

const pageTitle = 'Companies'
const pageDescription =
  'Browse companies and public business profiles.'

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | ${pageTitle}` })

</script>
