<template>
  <UPage>
    <UPageBody>
      <KitchenDetail v-if="kitchen" :kitchen="kitchen" />
      <DevDebugPanel
        title="Kitchen detail acquisition"
        context="Canonical Kitchen fetched by the detail route."
        object-origin="fetched"
        :objects="{ kitchen }"
        :derived="{ routeLocator }"
        include-route
        launcher
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useKitchenDetail } from '../../../kitchen/composables/useKitchenDetail'

definePageMeta({
  layout: 'default',
  title: 'Kitchen',
  description: 'View Kitchen details.',
})

const routeLocator = useRouteParam('slug')
const { kitchen, ready } = useKitchenDetail(routeLocator)
await ready
</script>
