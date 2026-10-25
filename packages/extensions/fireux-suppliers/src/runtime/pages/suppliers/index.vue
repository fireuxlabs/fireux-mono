<template>
  <UPage>
    <SupplierHero />
    <UPageBody>
      <SupplierCreate />
      <FireState v-bind="page.state" />
      <SupplierCollection
        v-if="page.state.outcome === 'ready'"
        :suppliers="page.suppliers"
      />
      <FireDiagnosticsDebugPanel v-bind="page.diagnostics" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useSupplierCollectionPage } from '../../supplier/composables/useSupplierCollectionPage'

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

const page = useSupplierCollectionPage()
</script>
