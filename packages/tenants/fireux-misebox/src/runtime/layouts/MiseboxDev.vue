<template>
  <CoreDev :devRoutes="miseboxDevRoutes" />
</template>

<script setup>
import { getMiseboxDevRoutes } from '../composables/app/routes/useMiseboxDevRoutes'
import { computed } from 'vue'

const miseboxDevRoutes = computed(() => getMiseboxDevRoutes())
</script>
