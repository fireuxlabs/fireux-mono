<template>
  <MenuDetailContent
    :view="interaction.detail.view"
    @update:selected-choice="interaction.detail.select"
    @add="interaction.detail.add"
    @remove="interaction.detail.remove"
  />

  <MenuDetailFunnel
    v-if="interaction.funnel.show"
    :order="interaction.funnel.order"
    :submit="interaction.funnel.submit"
    @close-panel="interaction.funnel.close"
    @open-panel="interaction.funnel.open"
  />
</template>

<script setup lang="ts">
import { useKitchenOrderFunnel } from '../../../composables/fireux/kitchen/order/funnel/useKitchenOrderFunnel'
import type { MenuManifest } from '../../../composables/fireux/menu/useMenuManifest'

const props = defineProps<{
  menu: MenuManifest
  menuId: string
  kitchenSlug?: string
}>()

const interaction = useKitchenOrderFunnel({
  menu: () => props.menu,
  menuId: () => props.menuId,
  kitchenSlug: () => props.kitchenSlug,
})
</script>
