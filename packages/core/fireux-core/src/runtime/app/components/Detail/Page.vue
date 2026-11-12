<template>
  <UPage>
    <UPageBody>
      <AppDetail v-if="app" :app="app" />
      <FireState
        v-else-if="outcome === 'pending'"
        entity="app"
        outcome="pending"
      />
      <FireState v-else-if="outcome === 'error'" entity="app" outcome="error" />
      <UAlert
        v-else-if="outcome === 'empty'"
        title="App not found"
        color="neutral"
        variant="soft"
        role="status"
        aria-live="polite"
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
