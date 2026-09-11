<template>
  <AppDetailPage
    :endpoint="
      routeId ? `/api/platform/apps/${encodeURIComponent(routeId)}` : ''
    "
  />
</template>

<script setup lang="ts">
import AppDetailPage from 'fireux-core/runtime/app/components/Detail/Page.vue'

import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'

definePageMeta({
  layout: 'default',
  title: 'App',
  description: 'View App details.',
})

const routeId = useRouteParam('id')
</script>
