<template>
  <UPage>
    <UPageHeader
      :title="pageTitle"
      description="Supplier identity, catalogue work, items, ingredients and team access in one Misebox Console."
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
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'

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
  description: 'Open a Supplier Console or browse public Supplier identities.',
})

const pageTitle = 'Suppliers'
const { appName } = useFireUXConfig()
useHead({ title: `${appName} | ${pageTitle}` })
</script>
