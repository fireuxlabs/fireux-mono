<template>
  <UPage>
    <UPageBody>
      <AppDetail v-if="app" :app="app" />
      <FireStateCard
        v-else-if="outcome === 'pending'"
        entity="app"
        kind="document"
        loading
      />
      <FireStateCard
        v-else-if="outcome === 'error'"
        entity="app"
        kind="document"
        state="error"
      />
      <FireStateCard
        v-else-if="outcome === 'missing'"
        entity="app"
        kind="document"
        state="missing"
      />
      <FireDiagnosticsDebugPanel
        title="App detail acquisition"
        context="Canonical App fetched by the detail route."
        object-origin="fetched"
        :objects="{ app }"
        :derived="{ endpoint }"
        include-route
        launcher
      />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { useAppDetail } from '../../composables/useAppDetail'

const props = defineProps<{ endpoint: string }>()
const { app, outcome, ready } = useAppDetail(() => props.endpoint)
await ready
</script>
