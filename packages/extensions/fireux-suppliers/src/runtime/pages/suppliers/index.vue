<template>
  <UPage><UPageBody>
    <SupplierHero />
    <SupplierCreate />
    <SupplierCollection :suppliers="suppliers" />
  </UPageBody></UPage>
</template>

<script setup lang="ts">
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { useSeo } from 'fireux-core/runtime/composables/fireux/seo/useSeo'
import { useSupplierCollection } from '../../supplier/composables/firestore/fetch/useSupplierCollection'

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
const { suppliers } = useSupplierCollection()
useSeo({ title: `${appName} | ${pageTitle}`, description: pageDescription, path: '/suppliers' })
</script>
