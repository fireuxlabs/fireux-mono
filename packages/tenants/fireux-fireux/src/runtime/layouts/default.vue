<template>
  <CoreDefault :routes="fireuxRoutes" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getFireuxDefaultRoutes } from '../composables/app/routes/useFireuxDefaultRoutes'

type LayoutRoutes = { menuBarLinks?: any[]; mobileLinks?: any[] }
const fireuxRoutes = computed<LayoutRoutes>(() => getFireuxDefaultRoutes())
</script>
