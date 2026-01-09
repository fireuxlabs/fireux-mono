<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />

    <UPageBody class="pagebody">
      <OrganismsObjectsCompanyCTA />
      <OrganismsObjectsCompanyCollectionManager />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'

definePageMeta({
  layout: 'default',
  title: 'Companies',
  description: 'Saved companies.',
  nav: {
    key: 'companies',
    label: 'Companies',
    icon: 'i-lucide-building-2',
    order: 24,
    desktop: true,
    mobile: true,
    layouts: ['default'],
  },
  head: { title: 'Companies' },
  name: 'CompaniesIndexPage',
})

const pageTitle = 'Companies'
const pageDescription =
  'Create a company and browse all companies available to this runtime.'

useHead({ title: pageTitle })
</script>
