<template>
  <CoreDefault :routes="miseboxRoutes" />
</template>

<script setup lang="ts">
import { getMiseboxRoutes } from '../composables/app/routes/useMiseboxRoutes'

const { hasProfile } = await useAppUser()
type LayoutRoutes = { menuBarLinks?: any[]; mobileLinks?: any[] }
const miseboxRoutes = computed<LayoutRoutes>(() => getMiseboxRoutes(hasProfile))
</script>
