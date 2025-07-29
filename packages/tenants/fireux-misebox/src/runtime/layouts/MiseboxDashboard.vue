<template>
  <CoreDashboard :routes="miseboxRoutes" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getMiseboxRoutes } from '../composables/app/routes/useMiseboxRoutes'

const miseboxRoutes = ref({ menuBarLinks: [], mobileLinks: [] })

onMounted(async () => {
  miseboxRoutes.value = (await getMiseboxRoutes()()) || {
    menuBarLinks: [],
    mobileLinks: [],
  }
})
</script>
