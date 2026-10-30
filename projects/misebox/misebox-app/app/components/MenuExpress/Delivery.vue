<template>
  <section class="fx-page-stack" aria-label="Menu delivery">
    <UAlert color="success" title="Your menu is delivered" />
    <UButton :to="delivery.menuPath" target="_blank">Open menu</UButton>
    <UButton :to="delivery.qrPath" target="_blank" variant="outline"
      >Open and download QR</UButton
    >
  </section>
</template>
<script setup lang="ts">
import type { MenuExpressRequest } from '../../../shared/types/menu-express'
defineProps<{ delivery: NonNullable<MenuExpressRequest['delivery']> }>()
</script>
