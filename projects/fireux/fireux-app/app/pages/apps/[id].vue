<template>
  <UPage>
    <UPageBody>
      <AppDetail v-if="app" :app="app" />
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
const { app, ready } = usePlatformAppDetail(routeId)
await ready
</script>
