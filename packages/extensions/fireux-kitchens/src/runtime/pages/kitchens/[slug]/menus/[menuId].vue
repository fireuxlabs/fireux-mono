<template>
  <div class="contents">
    <div v-if="pending" class="mx-auto max-w-3xl px-4 py-8 text-sm text-dimmed">
      Loading menu...
    </div>

    <UAlert
      v-else-if="!kitchen || !menu"
      class="mx-auto mt-8 max-w-3xl"
      color="neutral"
      variant="soft"
      title="Menu unavailable"
      description="This menu is missing, unpublished, or no longer available."
    />

    <MenuPublic
      v-else
      :kitchen-name="kitchen.name"
      :menu="menu"
    />
  </div>
</template>

<script setup lang="ts">
import { useKitchenPublicMenu } from '../../../../composables/fireux/public/kitchen/menu/useKitchenPublicMenu'

definePageMeta({
  layout: 'public-menu',
  name: 'KitchenPublicMenusDetailPage',
})

const {
  pending,
  kitchen,
  menu,
} = useKitchenPublicMenu()
</script>
