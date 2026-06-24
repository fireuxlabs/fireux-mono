<template>
  <section class="latap-page">
    <LaTapBerneBackdrop :variant="variant" />
    <slot />
  </section>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  variant?: 'content' | 'landing'
}>(), {
  variant: 'content',
})
</script>

<style scoped>
.latap-page {
  /* Tenant page spine: frame plus shared backdrop; hero/content stay page-explicit. */
  position: relative;
  isolation: isolate;
  min-height: 100svh;
  overflow: hidden;
  background: var(--latap-app-bg, var(--brand-ink, #171717));
  color: var(--latap-page-fg, var(--brand-canvas, #f2e8d8));
}
</style>
