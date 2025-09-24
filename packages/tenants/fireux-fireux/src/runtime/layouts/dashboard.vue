<template>
  <CoreDashboard :routes="fireuxRoutes" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getFireuxDashboardRoutes } from '../composables/app/routes/useFireuxDashboardRoutes'

type LayoutRoutes = { menuBarLinks?: any[]; mobileLinks?: any[] }
const fireuxRoutes = computed<LayoutRoutes>(() => getFireuxDashboardRoutes())
</script>
