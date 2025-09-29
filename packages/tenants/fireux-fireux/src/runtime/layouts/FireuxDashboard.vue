<template>
  <CoreDashboard :routes="fireuxRoutes" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCoreRoutes } from 'fireux-core/runtime/composables/app/routes/useCoreRoutes'
import type { RouteLink } from 'fireux-core/runtime/types/routeLink'

// Pull core-composed links (system + conditional user/admin groups)
const { links } = useCoreRoutes()

// For FireUX (global), show only grouped user/admin sections in the dashboard chrome
const KEEP_MENU = new Set<RouteLink['id']>(['user', 'admin'])

const KEEP_MOBILE = new Set<RouteLink['id']>([...KEEP_MENU])

const fireuxRoutes = computed(() => ({
  menuBarLinks: links.value.filter((r: RouteLink) => KEEP_MENU.has(r.id)),
  mobileLinks: links.value.filter((r: RouteLink) => KEEP_MOBILE.has(r.id)),
}))
</script>
