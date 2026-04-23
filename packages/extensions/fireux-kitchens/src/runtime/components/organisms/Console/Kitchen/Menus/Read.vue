<template>
  <ConsoleKitchenChildLayout
    description="Selected kitchen and menu collection in scope."
    item-label="Menus"
    :item-count="countLabel"
    :pending="pending"
    pending-title="Loading menus"
    pending-description="Fetching menus for the selected kitchen."
  >
    <OrganismsMenuCollectionManager
      :collection="menus"
      title="Menus"
      description="Browse menus for the selected kitchen."
      :link="false"
    />
  </ConsoleKitchenChildLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Menu } from '../../../../../models/menu.model'

const props = defineProps<{
  menus: Menu[]
  pending: boolean
}>()

const countLabel = computed(() => String(props.menus.length))
</script>
