<template>
  <SupplierDetail :supplier="supplierRecord" :pending="pending" />
</template>

<script setup lang="ts">
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useSupplierDetail } from '../../supplier/composables/useSupplierDetail'
import { useSupplierSeo } from '../../supplier/composables/firestore/utils/useSupplierSeo'

definePageMeta({
  layout: false,
  title: 'Supplier',
  description: 'View a supplier.',
  name: 'SupplierDetailPage',
})

const routeKey = useRouteParam('slug')

const { supplier: supplierRecord, pending } = useSupplierDetail(routeKey, {
  key: 'slug',
})
useSupplierSeo(supplierRecord)
</script>
