<template>
  <UPage>
    <UPageBody>
      <SupplierDetail v-if="supplier" :supplier="supplier" />
      <SupplierDetailState
        v-else
        :outcome="outcome"
        :has-supplier="false"
        @refresh="refresh()"
      />
      <DevDebugPanel
        title="Supplier detail acquisition"
        context="Canonical Supplier fetched by the detail route."
        object-origin="fetched"
        :objects="{ supplier }"
        :derived="{ routeKey }"
        include-route
        launcher
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useSupplierDetail } from '../../supplier/composables/useSupplierDetail'

definePageMeta({
  layout: 'default',
  title: 'Supplier',
  description: 'View Supplier details.',
})

const routeKey = useRouteParam('slug')

const { supplier, ready, outcome, refresh } = useSupplierDetail(routeKey)

await ready
</script>
