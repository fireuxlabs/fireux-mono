<template>
  <AppDetailPage
    :endpoint="appId ? `/api/apps/${encodeURIComponent(appId)}` : ''"
  />
</template>

<script setup lang="ts">
import AppDetailPage from 'fireux-core/runtime/app/components/Detail/Page.vue'

import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'

definePageMeta({
  layout: 'default',
  title: 'App',
  description: 'View App details.',
  appRole: 'global',
})

const appId = useRouteParam('id')
</script>
