<template>
  <UPage>
    <UPageHeader
      title="Create Company"
      description="Coming (company) creation-soon"
    />

    <UPageBody class="pagebody" />
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'

definePageMeta({
  layout: 'default',
  title: 'Create Company',
  description: 'Create a company overlay.',
  nav: {
    key: 'companies-create',
    label: 'Create company',
    icon: 'i-lucide-plus',
    order: 56,
    desktop: false,
    mobile: false,
    layouts: ['default'],
  },
  head: { title: 'Create Company' },
  name: 'CompaniesCreatePage',
})

const { appName } = useFireUXConfig()
useHead({ title: `${appName} | Create Company` })
</script>
