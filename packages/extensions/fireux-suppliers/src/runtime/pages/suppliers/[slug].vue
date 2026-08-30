<template>
  <UPage>
    <UPageBody>
      <SupplierDetail v-if="supplier" :supplier="supplier" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useSupplierDetail } from '../../supplier/composables/useSupplierDetail'

definePageMeta({
  layout: false,
  title: 'Supplier',
  description: 'View a supplier.',
  name: 'SupplierDetailPage',
})

const routeKey = useRouteParam('slug')

const { supplier, ready } = useSupplierDetail(routeKey)

await ready
</script>
