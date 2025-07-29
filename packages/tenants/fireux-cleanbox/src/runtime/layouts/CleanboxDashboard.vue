<template>
  <CoreDashboard :routes="cleanboxRoutes" />
</template>

<script setup>

const cleanboxRoutes = ref({ menuBarLinks: [], mobileLinks: [] })

onMounted(async () => {
  cleanboxRoutes.value = (await getCleanboxRoutes()) || {
    menuBarLinks: [],
    mobileLinks: [],
  }
})
</script>
