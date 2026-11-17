<template>
  <UMain>
    <MenuKiosk :kitchen-slug="kitchenSlug" />
  </UMain>
</template>

<script setup lang="ts">
import { useRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'

definePageMeta({ name: 'KitchenKioskMenuPage', title: 'Kiosk', layout: false })
const kitchenSlug = useRouteParam('slug')
useSeoMeta({ title: 'Order here', robots: 'noindex, nofollow' })
</script>
