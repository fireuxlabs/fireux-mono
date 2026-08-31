<template>
  <UPage>
    <UPageBody>
      <AppDetail v-if="app" :app="app" />
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
import { useAppDetail } from '../../app/composables/useAppDetail'
import { useRouteParam } from '../../composables/shared/useRouteParam'

definePageMeta({
  layout: 'default',
  title: 'App',
  description: 'View App details.',
  tenant: 'global',
})

const appId = useRouteParam('id')
const { app, ready } = useAppDetail(appId)

await ready
</script>
