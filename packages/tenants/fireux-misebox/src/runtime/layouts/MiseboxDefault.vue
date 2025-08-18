<template>
  <CoreDefault :routes="miseboxRoutes" />
</template>

<script setup>
import { getMiseboxRoutes } from '../composables/app/routes/useMiseboxRoutes'

const { hasProfile } = await useAppUser()
const miseboxRoutes = computed(() => getMiseboxRoutes(hasProfile))
</script>
