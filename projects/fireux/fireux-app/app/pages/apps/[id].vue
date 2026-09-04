<template>
  <UPage>
    <UPageBody>
      <AppDetail v-if="app" :app="app" />
      <MoleculesStateCard
        v-else-if="outcome === 'pending'"
        entity="app"
        kind="document"
        loading
      />
      <MoleculesStateCard
        v-else-if="outcome === 'error'"
        entity="app"
        kind="document"
        state="error"
      />
      <MoleculesStateCard
        v-else-if="outcome === 'missing'"
        entity="app"
        kind="document"
        state="missing"
      />
      <DevDebugPanel
        title="App detail acquisition"
        context="Canonical platform App fetched by the detail route."
        object-origin="fetched"
        :objects="{ app }"
        :derived="{ routeId }"
        include-route
        launcher
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import { usePlatformAppDetail } from '../../composables/usePlatformAppDetail'

definePageMeta({
  layout: 'default',
  title: 'App',
  description: 'View App details.',
})

const routeId = useRouteParam('id')
const { app, outcome, ready } = usePlatformAppDetail(routeId)
await ready
</script>
