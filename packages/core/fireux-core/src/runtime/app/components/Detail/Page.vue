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
