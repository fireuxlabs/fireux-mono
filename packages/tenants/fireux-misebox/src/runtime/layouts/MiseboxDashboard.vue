<template>
  <CoreDashboard :routes="miseboxRoutes" />
</template>

<script setup lang="ts">
import { getMiseboxDashboardRoutes } from '../composables/app/routes/useMiseboxDashboardRoutes'
import { computed } from 'vue'
import { useUser } from 'fireux-core/runtime/composables/firestore/user/useUser'

const { user } = useUser()
const hasProfile = (profileType: string) => {
  const app = user.value?.app
  if (!app) return false
  const list = Array.isArray(app.app_profiles) ? app.app_profiles : []
  return profileType ? list.includes(profileType) : !!app
}
type LayoutRoutes = { menuBarLinks?: any[]; mobileLinks?: any[] }
const miseboxRoutes = computed<LayoutRoutes>(() =>
  getMiseboxDashboardRoutes(hasProfile)
)
</script>
