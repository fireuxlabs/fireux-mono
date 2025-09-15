<template>
  <CoreDashboard :routes="cleanboxRoutes" />
</template>

<script setup lang="ts">
import { getCleanboxRoutes } from '../composables/app/routes/useCleanboxRoutes'

const { hasProfile } = useAppUser()
type LayoutRoutes = { menuBarLinks?: any[]; mobileLinks?: any[] }
const cleanboxRoutes = computed<LayoutRoutes>(() =>
  getCleanboxRoutes(hasProfile)
)
</script>
