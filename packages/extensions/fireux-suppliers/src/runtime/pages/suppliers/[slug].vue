<template>
  <SupplierDetail
    :supplier="supplier"
    :company="company"
    :place="place"
    :outcome="outcome"
    @refresh="refresh"
  />
</template>

<script setup lang="ts">
import { setResponseStatus } from '#imports'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useSupplierDetail } from '../../supplier/composables/useSupplierDetail'
import { useSupplierSeo } from '../../supplier/composables/useSupplierSeo'

definePageMeta({
  layout: false,
  title: 'Supplier',
  description: 'View a supplier.',
  name: 'SupplierDetailPage',
})

const routeKey = useRouteParam('slug')

const {
  supplier,
  company,
  place,
  ready,
  refresh,
  outcome,
  missing,
  failed,
  statusCode,
} = useSupplierDetail(routeKey)

await ready
if (import.meta.server && missing.value) {
  setResponseStatus(404)
} else if (import.meta.server && failed.value) {
  setResponseStatus(statusCode.value || 503)
}

useSupplierSeo(supplier, place)
</script>
