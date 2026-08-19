<template>
  <DirectorySurface
    eyebrow="Discover"
    :title="pageTitle"
    :description="pageDescription"
    icon="i-lucide-building-2"
    secondary-label="Company tools"
  >
    <CompanyCollectionManager />

    <template #secondary>
      <CompanyCTA />
    </template>
  </DirectorySurface>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'

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
const pageDescription = 'Browse companies and their business profiles.'

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | ${pageTitle}` })
</script>
