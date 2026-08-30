<template>
  <UPage>
    <UPageBody>
      <DirectoryAppDetail v-if="app" :app="app" />
    </UPageBody>
  </UPage>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncData } from '#imports'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
import type { App } from 'fireux-core/runtime/app/models/app.model'
import type { DetailResponse } from 'fireux-core/runtime/models/utils/directory'

definePageMeta({
  layout: 'default',
  title: 'App',
  description: 'View a FireUX App and its relationships.',
  name: 'FireuxAppDetailPage',
})

const routeId = useRouteParam('id')
const { data } = await useAsyncData<DetailResponse<App>>(
  () => `fireux-app-detail-${routeId.value}`,
  () => $fetch(`/api/platform/apps/${encodeURIComponent(routeId.value)}`),
  { server: true, lazy: false, watch: [routeId] }
)
const app = computed<App | null>(() => data.value?.item ?? null)
</script>
