<template>
  <MenuDetailContent
    :view="interaction.detail.view"
    @update:selected-choice="interaction.detail.select"
    @add="interaction.detail.add"
    @remove="interaction.detail.remove"
  />

  <MenuDetailFunnel
    v-if="interaction.funnel.show && interaction.funnel.order.panelOpen"
    :order="interaction.funnel.order"
    @close="interaction.funnel.close"
  />

  <MenuDetailFunnelTrigger
    v-else-if="interaction.funnel.show"
    :order="interaction.funnel.order"
    @open="interaction.funnel.open"
  />
</template>

<script setup lang="ts">
import { useFunnel } from '../../../composables/fireux/kitchen/order/funnel/shared/useFunnel'
import type { MenuManifest } from '../../../composables/fireux/menu/useMenuManifest'

const props = defineProps<{
  menu: MenuManifest
  menuId: string
  kitchenSlug?: string
}>()

const interaction = useFunnel({
  menu: () => props.menu,
  menuId: () => props.menuId,
  kitchenSlug: () => props.kitchenSlug,
})
</script>
