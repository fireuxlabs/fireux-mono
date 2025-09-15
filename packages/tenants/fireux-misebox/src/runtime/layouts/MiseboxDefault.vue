<template>
  <CoreDefault :routes="miseboxRoutes" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getMiseboxRoutes } from '../composables/app/routes/useMiseboxRoutes'

const { hasProfile } = useAppUser()
type LayoutRoutes = { menuBarLinks?: any[]; mobileLinks?: any[] }
const miseboxRoutes = computed<LayoutRoutes>(() => getMiseboxRoutes(hasProfile))
</script>
