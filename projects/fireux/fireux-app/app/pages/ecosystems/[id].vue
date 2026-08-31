<template>
  <UPage>
    <UPageBody>
      <EcosystemDetail v-if="ecosystem" :ecosystem="ecosystem" />
      <DevDebugPanel
        title="Ecosystem detail acquisition"
        context="Canonical Ecosystem fetched by the detail route."
        object-origin="fetched"
        :objects="{ ecosystem }"
        :derived="{ routeId }"
        include-route
        launcher
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { usePlatformEcosystemDetail } from '../../composables/usePlatformEcosystemDetail'

definePageMeta({
  layout: 'default',
  title: 'Ecosystem',
  description: 'View Ecosystem details.',
})

const routeId = useRouteParam('id')
const { ecosystem, ready } = usePlatformEcosystemDetail(routeId)
await ready
</script>
