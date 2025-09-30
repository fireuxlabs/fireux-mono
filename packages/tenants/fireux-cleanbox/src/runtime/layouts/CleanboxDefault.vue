<template>
  <CoreDefault :routes="cleanboxRoutes" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCleanboxRoutes } from '../composables/app/routes/useCleanboxRoutes'

// Tenant-only flat links (Cleanbox doesn’t expose public links yet)
const { links } = useCleanboxRoutes()

// Desktop header: allow-list tenant items here when you add them
const CLEANBOX_DESKTOP = new Set<string>([
  // e.g., 'services', 'pricing'
])

// Mobile menu: can include more than desktop if desired
const CLEANBOX_MOBILE = new Set<string>([
  ...CLEANBOX_DESKTOP,
  // e.g., 'my-cleanings'
])

const cleanboxRoutes = computed(() => ({
  menuBarLinks: links.value.filter((r) => CLEANBOX_DESKTOP.has(r.id)),
  mobileLinks: links.value.filter((r) => CLEANBOX_MOBILE.has(r.id)),
}))
</script>
