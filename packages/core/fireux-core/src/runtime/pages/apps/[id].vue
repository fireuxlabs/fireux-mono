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
        context="Canonical App fetched by the detail route."
        object-origin="fetched"
        :objects="{ app }"
        :derived="{ appId }"
        include-route
        launcher
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useAppRead } from '../../app/composables/useAppRead'
import { useRouteParam } from '../../composables/shared/useRouteParam'

definePageMeta({
  layout: 'default',
  title: 'App',
  description: 'View App details.',
  appRole: 'global',
})

const appId = useRouteParam('id')
const { app, outcome } = useAppRead(appId)
</script>
