<template>
  <UPage>
    <UPageBody>
      <EcosystemDetail v-if="ecosystem" :ecosystem="ecosystem" />
      <FireStateCard
        v-else-if="outcome === 'pending'"
        entity="ecosystem"
        kind="document"
        loading
      />
      <FireStateCard
        v-else-if="outcome === 'error'"
        entity="ecosystem"
        kind="document"
        state="error"
      />
      <FireStateCard
        v-else-if="outcome === 'empty'"
        entity="ecosystem"
        kind="document"
        state="empty"
      />
      <FireDiagnosticsDebugPanel
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
import { useEcosystemDetail } from 'fireux-core/runtime/ecosystem/composables/useEcosystemDetail'

definePageMeta({
  layout: 'default',
  title: 'Ecosystem',
  description: 'View Ecosystem details.',
})

const routeId = useRouteParam('id')
const { ecosystem, outcome, ready } = useEcosystemDetail(routeId)
await ready
</script>
