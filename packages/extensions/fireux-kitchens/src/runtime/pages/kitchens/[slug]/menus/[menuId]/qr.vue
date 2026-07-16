<template>
  <MenuJson :endpoint="endpoint" :query="query" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'

definePageMeta({
  index: false,
  sitemap: false,
  robots: 'noindex, nofollow',
})

const kitchenSlug = useRouteParam('slug')
const menuId = useRouteParam('menuId')
const endpoint = computed(() => `/api/menus/${encodeURIComponent(menuId.value)}`)
const query = computed(() => ({ kitchenSlug: kitchenSlug.value }))
</script>
