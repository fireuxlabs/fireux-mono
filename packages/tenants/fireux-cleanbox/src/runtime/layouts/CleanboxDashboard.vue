<template>
  <CoreDashboard :routes="cleanboxRoutes" />
</template>

<script setup lang="ts">
import { getCleanboxRoutes } from '../composables/app/routes/useCleanboxRoutes'
import { computed } from 'vue'
import { useUser } from 'fireux-core/runtime/composables/firestore/users/useUser'

const { user } = useUser()
// Adapter: expected signature (profileType: string) => boolean
const hasProfile = (profileType: string) => {
  const app = user.value?.app
  if (!app) return false
  const list = Array.isArray(app.app_profiles) ? app.app_profiles : []
  return profileType ? list.includes(profileType) : !!app
}
type LayoutRoutes = { menuBarLinks?: any[]; mobileLinks?: any[] }
const cleanboxRoutes = computed<LayoutRoutes>(() =>
  getCleanboxRoutes(hasProfile)
)
</script>
