<template>
  <ClientOnly>
    <CoreDev :devRoutes="miseboxDevRoutes" />
  </ClientOnly>
</template>

<script setup>
import { getMiseboxDevRoutes } from '../composables/app/routes/useMiseboxDevRoutes'

const miseboxDevRoutes = computed(() => getMiseboxDevRoutes())
</script>
