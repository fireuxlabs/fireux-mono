<template>
  <MenuJson :endpoint="endpoint" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'

definePageMeta({
  index: false,
  sitemap: false,
  robots: 'noindex, nofollow',
})

const menuId = useRouteParam('menuId')
const endpoint = computed(() => `/api/menus/${encodeURIComponent(menuId.value)}`)
</script>
