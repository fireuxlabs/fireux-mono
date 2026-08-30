<template>
  <UPage>
    <UPageBody>
      <KitchenDetail v-if="kitchen" :kitchen="kitchen" />
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
