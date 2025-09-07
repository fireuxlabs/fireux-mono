<template>
  <ClientOnly>
    <CoreDashboard :routes="cleanboxRoutes" />
  </ClientOnly>
</template>

<script setup lang="ts">
import { getCleanboxRoutes } from '../composables/app/routes/useCleanboxRoutes'
// Nuxt auto-imports; declare types for TS in package context
declare function useAppUser(): Promise<{ hasProfile: any }>
declare const computed: <T>(getter: () => T) => import('vue').ComputedRef<T>

const { hasProfile } = await useAppUser()
type LayoutRoutes = { menuBarLinks?: any[]; mobileLinks?: any[] }
const cleanboxRoutes = computed<LayoutRoutes>(() =>
  getCleanboxRoutes(hasProfile)
)
</script>
