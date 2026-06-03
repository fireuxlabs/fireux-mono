<template>
  <div class="contents">
    <UPageCard v-if="detailPending" class="mx-auto mt-8 max-w-3xl" variant="subtle">
      <p class="text-sm text-dimmed">Loading menu...</p>
    </UPageCard>

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
      :sections="sectionRows"
    />

    <DevJson
      v-if="isDev"
      class="mx-auto my-8 max-w-3xl"
      title="Kitchen public menu detail debug"
      context="Kitchen menu detail · /kitchens/[slug]/menus/[menuId]"
      :data="debug"
      :default-open="false"
    />
  </div>
</template>

<script setup lang="ts">
import { useKitchenPublicMenuDetail } from '../../../../composables/fireux/public/kitchen/menu/useKitchenPublicMenu'

definePageMeta({
  layout: 'public-menu',
  name: 'KitchenPublicMenusDetailPage',
})

const {
  detailPending,
  kitchen,
  menu,
  sectionRows,
  debug,
} = useKitchenPublicMenuDetail()
const isDev = import.meta.dev
</script>
