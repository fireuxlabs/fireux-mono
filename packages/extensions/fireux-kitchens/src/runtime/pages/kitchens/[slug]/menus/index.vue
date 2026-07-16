<template>
  <MenuJson endpoint="/api/menus" :query="query" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'

const kitchenSlug = useRouteParam('slug')
const query = computed(() => ({ kitchenSlug: kitchenSlug.value }))
</script>
