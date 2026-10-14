<template>
  <UPage>
    <UPageBody>
      <KitchenDetail
        v-if="presentation && place"
        :presentation="presentation"
        :place="place"
      />
      <KitchenDetailState
        v-else
        :outcome="outcome"
        :has-kitchen="Boolean(kitchen)"
        @refresh="refresh()"
      />
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
import { setResponseStatus } from '#imports'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useKitchenSeo } from '../../../kitchen/composables/useKitchenSeo'
import { useKitchenDetail } from '../../../kitchen/composables/useKitchenDetail'

definePageMeta({
  layout: 'default',
  title: 'Kitchen',
  description: 'View Kitchen details.',
})

const routeLocator = useRouteParam('slug')
const { kitchen, place, presentation, outcome, refresh, ready, statusCode } =
  useKitchenDetail(routeLocator)
useKitchenSeo(presentation)
await ready
if (import.meta.server && statusCode.value) setResponseStatus(statusCode.value)
</script>
