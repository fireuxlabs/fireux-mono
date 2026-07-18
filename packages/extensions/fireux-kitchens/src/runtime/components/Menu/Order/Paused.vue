<template>
  <section class="menu-order-paused" role="status">
    <span class="menu-order-paused__icon" aria-hidden="true">
      <UIcon name="i-lucide-pause" />
    </span>
    <div>
      <p>Temporarily unavailable</p>
      <h2>Collection is paused</h2>
      <p>{{ message }}</p>
    </div>
    <NuxtLink v-if="browsePath" :to="browsePath">
      Browse the Menu
    </NuxtLink>
  </section>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  browsePath?: string
  message?: string
}>(), {
  browsePath: '',
  message: 'Collection is temporarily paused. Please try again later.',
})
</script>

<style scoped>
.menu-order-paused { display: grid; width: min(100%, 42rem); justify-items: center; gap: calc(var(--spacing) * 4); margin: 0 auto; padding: clamp(calc(var(--spacing) * 6), 5vw, calc(var(--spacing) * 12)); border: 1px solid color-mix(in srgb, var(--menu-primary) 25%, transparent); border-radius: var(--menu-radius); background: color-mix(in srgb, var(--menu-bg) 94%, var(--menu-primary)); color: var(--menu-text); text-align: center; }
.menu-order-paused__icon { display: grid; width: 3.5rem; height: 3.5rem; place-items: center; border-radius: 9999px; background: color-mix(in srgb, var(--menu-primary) 14%, var(--menu-bg)); color: var(--menu-primary); font-size: var(--text-2xl); }
.menu-order-paused div { display: grid; gap: 0.45rem; }
.menu-order-paused p, .menu-order-paused h2 { margin: 0; }
.menu-order-paused div > p:first-child { color: var(--menu-primary); font-size: var(--text-xs); font-weight: var(--font-weight-black); letter-spacing: 0.08em; text-transform: uppercase; }
.menu-order-paused h2 { color: var(--menu-title); font-family: var(--menu-title-font); font-size: clamp(var(--text-2xl), 5vw, var(--text-4xl)); }
.menu-order-paused div > p:last-child { color: var(--menu-muted); line-height: 1.6; }
.menu-order-paused a { display: inline-flex; min-height: 2.75rem; align-items: center; padding: 0.65rem calc(var(--spacing) * 4); border-radius: var(--menu-radius-control); background: var(--menu-primary); color: var(--menu-primary-contrast); font-weight: var(--font-weight-extrabold); text-decoration: none; }
</style>
