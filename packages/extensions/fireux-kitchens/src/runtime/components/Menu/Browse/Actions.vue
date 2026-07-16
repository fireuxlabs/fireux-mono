<template>
  <nav
    v-if="qrPath || (showIndexLink && indexPath)"
    class="menu-browse-actions"
    aria-label="Menu actions"
  >
    <NuxtLink
      v-if="showIndexLink && indexPath"
      :to="indexPath"
      class="menu-browse-actions__link"
      data-menu-action="index"
    >
      Back to menus
    </NuxtLink>

    <NuxtLink
      v-if="qrPath"
      :to="qrPath"
      class="menu-browse-actions__link menu-browse-actions__link--primary"
      data-menu-action="qr"
    >
      View QR code
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  indexPath: string
  qrPath: string
  showIndexLink?: boolean
}>(), {
  showIndexLink: true,
})
</script>

<style scoped>
.menu-browse-actions {
  display: flex;
  width: min(100%, 48rem);
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.625rem;
  margin: 0 auto;
}

.menu-browse-actions__link {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  justify-content: center;
  padding: 0.625rem 0.9rem;
  border: 1px solid color-mix(in srgb, var(--menu-text) 18%, transparent);
  border-radius: var(--menu-radius-control);
  color: var(--menu-text);
  background: color-mix(in srgb, var(--menu-bg) 88%, transparent);
  font-weight: 800;
  line-height: 1.25;
  text-decoration: none;
}

.menu-browse-actions__link--primary {
  border-color: var(--menu-primary);
  color: var(--menu-bg);
  background: var(--menu-primary);
}

.menu-browse-actions__link:hover {
  filter: brightness(1.08);
}

.menu-browse-actions__link:focus-visible {
  outline: 2px solid var(--menu-secondary);
  outline-offset: 3px;
}
</style>
