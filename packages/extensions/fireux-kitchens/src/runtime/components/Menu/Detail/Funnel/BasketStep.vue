<template>
  <div class="grid gap-5">
    <MenuDetailFunnelBasket :order="funnel.order" />
    <MenuDetailFunnelPaymentMethod :funnel="funnel" />
  </div>
</template>

<script setup lang="ts">
import type { MenuOrderingFunnelController } from '../../../../models/kitchen/menu/menu-ordering.model'

defineProps<{
  funnel: MenuOrderingFunnelController
}>()
</script>
