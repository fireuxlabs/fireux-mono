<template>
  <aside class="order-notice">
    {{ message }}
  </aside>
</template>

<script setup lang="ts">
defineProps<{
  message: string
}>()
</script>

<style scoped>
.order-notice {
  width: min(44rem, 100%);
  margin: 0 auto;
  padding: 0.85rem 1rem;
  border: 1px solid color-mix(in srgb, var(--menu-primary) 32%, transparent);
  border-radius: 1rem;
  background: color-mix(in srgb, var(--menu-primary) 10%, var(--menu-bg));
  color: var(--menu-title);
  font-size: 0.92rem;
  font-weight: 800;
  line-height: 1.45;
}
</style>
