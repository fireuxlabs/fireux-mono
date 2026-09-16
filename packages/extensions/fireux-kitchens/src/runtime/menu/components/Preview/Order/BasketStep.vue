<template>
  <div class="grid gap-5">
    <MenuPreviewOrderBasket :order="funnel.order" />
    <MenuPreviewOrderPaymentMethod :funnel="funnel" />
  </div>
</template>

<script setup lang="ts">
import type { MenuOrderPreviewController } from '../../../models/menu-order-preview.model.ts'

defineProps<{
  funnel: MenuOrderPreviewController
}>()
</script>
