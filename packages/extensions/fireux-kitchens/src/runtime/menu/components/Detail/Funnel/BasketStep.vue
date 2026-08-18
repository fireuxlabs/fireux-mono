<template>
  <div class="grid gap-5">
    <MenuDetailFunnelBasket :order="funnel.order" />
    <MenuDetailFunnelPaymentMethod :funnel="funnel" />
  </div>
</template>

<script setup lang="ts">
import type { MenuOrderingFunnelController } from '../../../models/menu-ordering.model.ts'

defineProps<{
  funnel: MenuOrderingFunnelController
}>()
</script>
