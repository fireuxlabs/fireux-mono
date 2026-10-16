<template>
  <KitchenDetailServiceMenu :kitchen-slug="kitchenSlug" service="delivery" />
</template>
<script setup lang="ts">
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'
definePageMeta({ name: 'KitchenDeliveryMenuPage', title: 'Delivery' })
const kitchenSlug = useRouteParam('slug')
</script>
