<template>
  <MenuDetailContent
    :view="interaction.detail.view"
    @update:selected-choice="interaction.detail.select"
    @select-item="interaction.detail.selectItem"
    @add="interaction.detail.add"
  />

  <MenuDetailFunnel
    v-if="interaction.funnel.show && interaction.funnel.order.panelOpen"
    :funnel="interaction.funnel"
  />

  <MenuDetailFunnelTrigger
    v-else-if="interaction.funnel.show"
    :funnel="interaction.funnel"
  />
</template>

<script setup lang="ts">
import { useFunnel } from '../../../composables/fireux/kitchen/order/funnel/shared/useFunnel'
import type { MenuManifest } from '../../../models/kitchen/menu/menu-detail.model'
import type { MenuRouteContext } from '../../../models/kitchen/menu/menu-context.model'

const props = defineProps<{
  menu: MenuManifest
  menuId: string
  menuContext?: MenuRouteContext
  kitchenSlug?: string
}>()

const interaction = useFunnel({
  menu: () => props.menu,
  menuId: () => props.menuId,
  menuContext: () => props.menuContext,
  kitchenSlug: () => props.kitchenSlug,
})
</script>
