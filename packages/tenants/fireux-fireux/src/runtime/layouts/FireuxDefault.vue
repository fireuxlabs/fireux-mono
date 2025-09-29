<template>
  <CoreDefault :routes="fireuxRoutes" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RouteLink } from 'fireux-core/runtime/types/routeLink'
import { useFireuxRoutes } from '../composables/app/routes/useFireuxRoutes'

// Flat tenant-only links (currently none; ready for future)
const { links } = useFireuxRoutes()

// Desktop header: (none for now — CoreDefault already renders core system links)
const DESKTOP_KEEP = new Set<RouteLink['id']>([
  // e.g., 'docs', 'changelog' — add when FireUX tenant has public sections
])

// Mobile menu: (none for now — we’re not adding tenant-specific items yet)
const MOBILE_KEEP = new Set<RouteLink['id']>([
  ...DESKTOP_KEEP,
  // e.g., 'labs'
])

const fireuxRoutes = computed(() => ({
  menuBarLinks: links.value.filter((r) => DESKTOP_KEEP.has(r.id)),
  mobileLinks: links.value.filter((r) => MOBILE_KEEP.has(r.id)),
}))
</script>
