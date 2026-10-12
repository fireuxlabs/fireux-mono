<template>
  <UPage>
    <UPageBody>
      <SupplierHero />
      <SupplierCreate />
      <SupplierCollection v-if="outcome === 'ready'" :suppliers="suppliers" />
      <MoleculesStateCard
        v-else
        entity="suppliers"
        kind="collection"
        :loading="outcome === 'pending' || outcome === 'idle'"
        :state="outcome === 'error' ? 'error' : 'empty'"
      />
      <DevDebugPanel
        title="Suppliers index acquisition"
        context="Canonical Suppliers passed into the FL index surface."
        object-origin="fetched"
        :objects="{ suppliers }"
        :derived="{ count: suppliers.length }"
        include-route
        launcher
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { useSupplierCollection } from '../../supplier/composables/useSupplierCollection'

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
const { suppliers, outcome } = useSupplierCollection()
useSeo({
  title: `${appName} | ${pageTitle}`,
  description: pageDescription,
  path: '/suppliers',
})
</script>
