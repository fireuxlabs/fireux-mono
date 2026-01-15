<template>
  <UPage>
    <UPageHeader
      title="Create Company"
      description="Search a place, confirm it, then create a Company overlay bound to that Place."
    />

    <UPageBody class="pagebody space-y-6">
      <OrganismsObjectsCompanyCreateSystem />

      <UAlert
        color="neutral"
        variant="soft"
        icon="i-lucide-info"
        title="Tip"
        description="After creation, open the company from the Companies list."
      />
    </UPageBody>
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
    order: 25,
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
