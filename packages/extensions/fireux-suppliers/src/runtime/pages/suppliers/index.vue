<template>
  <UPage>
    <UPageHeader
      :title="pageTitle"
      description="Find and join suppliers, or create your own Supplier Console."
    />

    <UPageBody>
      <!-- Console CTA family: actions live in SupplierCTA; browse lives in SupplierCollectionManager. -->
      <SupplierCTA />

      <SupplierCollectionManager />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'

definePageMeta({
  tag: 'suppliers',
  nav: {
    key: 'suppliers',
    label: 'Suppliers',
    icon: 'i-lucide-truck',
    order: 50,
    desktop: false,
    mobile: false,
    layouts: ['default'],
  },
  layout: 'default',
  name: 'SuppliersIndexPage',
  title: 'Suppliers',
  description: 'Find and join suppliers, or create your own Supplier Console.',
})

const pageTitle = 'Suppliers'
const { appName } = useFireUXConfig()
useHead({ title: `${appName} | ${pageTitle}` })
</script>
