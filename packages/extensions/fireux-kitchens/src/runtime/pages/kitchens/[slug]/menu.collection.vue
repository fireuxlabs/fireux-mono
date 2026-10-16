<template>
  <KitchenDetailServiceMenu :kitchen-slug="kitchenSlug" service="collection" />
</template>
<script setup lang="ts">
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
definePageMeta({ name: 'KitchenCollectionMenuPage', title: 'Collection' })
const kitchenSlug = useRouteParam('slug')
</script>
