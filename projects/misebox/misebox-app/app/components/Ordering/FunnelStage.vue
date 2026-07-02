<template>
  <section class="menu-order-card">
    <header v-if="number && total" class="menu-order-header">
      <p class="menu-order-step-label">
        {{ number }} of {{ total }}
      </p>
    </header>

    <slot />
  </section>
</template>

<script setup lang="ts">
defineProps<{
  number?: number | string
  total?: number | string
}>()
</script>
