<template>
  <UPage>
    <UPageHeader :title="pageTitle" :description="pageDescription" />

    <UPageBody>
      <!-- Profile CTA family: Customer is an ordering profile attached to a User. -->
      <CustomerCTA />
      <CustomerCollectionManager />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'

definePageMeta({
  tag: 'customers',
  nav: {
    visibility: { profiles: ['customer'] },
    key: 'customers',
    label: 'Customers',
    icon: 'i-lucide-user-round',
    order: 42,
    desktop: false,
    mobile: false,
    layouts: ['default'],
  },
  layout: 'default',
  name: 'CustomersIndexPage',
  title: 'Customers',
  description: 'Browse customer profiles.',
})

const pageTitle = 'Customers'
const pageDescription = 'Find customers, or create your ordering profile.'
const { appName } = useFireUXConfig()

useHead({ title: `${appName} | ${pageTitle}` })
</script>
