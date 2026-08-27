<template>
  <CollectionPage
    eyebrow="Discover"
    :title="pageTitle"
    :description="pageDescription"
    icon="i-lucide-truck"
    secondary-label="Supplier tools"
  >
    <SupplierCollectionManager />

    <template #secondary>
      <SupplierCTA />
    </template>
  </CollectionPage>
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
  description: 'Browse supplier identities, catalogues and delivery areas.',
})

const pageTitle = 'Suppliers'
const pageDescription =
  'Browse supplier identities, catalogues and delivery areas.'
const { appName } = useFireUXConfig()
useHead({ title: `${appName} | ${pageTitle}` })
</script>
