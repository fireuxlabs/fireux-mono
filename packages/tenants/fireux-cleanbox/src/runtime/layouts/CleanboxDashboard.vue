<template>
  <CoreDashboard :routes="cleanboxRoutes" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUser } from 'fireux-core/runtime/composables/firestore/user/useUser'
import type { RouteLink } from 'fireux-core/runtime/types/routeLink'

const { user } = useUser()
// Adapter: expected signature (profileType: string) => boolean
const hasProfile = (profileType: string) => {
  const app = user.value?.app
  if (!app) return false
  const list = Array.isArray(app.app_profiles) ? app.app_profiles : []
  return profileType ? list.includes(profileType) : !!app
}
// For now, Cleanbox shows only core-provided user/admin groups in dashboard
const KEEP_MENU = new Set<RouteLink['id']>(['user', 'admin'])
const KEEP_MOBILE = new Set<RouteLink['id']>([...KEEP_MENU])

// Use core compositor and filter by sets
import { useCoreRoutes } from 'fireux-core/runtime/composables/app/routes/useCoreRoutes'
const { links } = useCoreRoutes()

const cleanboxRoutes = computed(() => ({
  menuBarLinks: links.value.filter((r: RouteLink) => KEEP_MENU.has(r.id)),
  mobileLinks: links.value.filter((r: RouteLink) => KEEP_MOBILE.has(r.id)),
}))
</script>
