<template>
  <CoreDefault :routes="cleanboxDevRoutes" />
</template>

<script setup>
import { getCleanboxDevRoutes } from '../composables/app/routes/useCleanboxDevRoutes'

const cleanboxDevRoutes = computed(() => ({
  menuBarLinks: getCleanboxDevRoutes(),
  mobileLinks: getCleanboxDevRoutes(),
}))
</script>
