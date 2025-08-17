<template>
  <CoreDefault :routes="cleanboxRoutes" />
</template>

<script setup>
import { getCleanboxRoutes } from '../composables/app/routes/useCleanboxRoutes'

const { hasProfile } = await useCoreUser()
const cleanboxRoutes = computed(() => getCleanboxRoutes(hasProfile))
</script>
