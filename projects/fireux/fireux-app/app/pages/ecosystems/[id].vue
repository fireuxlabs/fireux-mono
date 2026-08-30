<template>
  <UPage>
    <UPageBody>
      <EcosystemDetail v-if="ecosystem" :ecosystem="ecosystem" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { useEcosystemDetail } from 'fireux-core/runtime/ecosystem/composables/useEcosystemDetail'

definePageMeta({
  layout: 'default',
  title: 'Ecosystem',
  description: 'View Ecosystem details.',
})

const routeId = useRouteParam('id')
const { ecosystem, ready } = useEcosystemDetail(routeId)
await ready
</script>
