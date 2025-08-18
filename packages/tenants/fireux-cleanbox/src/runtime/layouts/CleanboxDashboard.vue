<template>
  <CoreDashboard :routes="cleanboxRoutes" />
</template>

<script setup>
import { getCleanboxRoutes } from '../composables/app/routes/useCleanboxRoutes'

const { hasProfile } = await useAppUser()
const cleanboxRoutes = computed(() => getCleanboxRoutes(hasProfile))
</script>
