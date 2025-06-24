<template>
  <ClientOnly>
    <CoreDashboard :routes="routes" />
  </ClientOnly>
</template>

<script setup>
const routes = ref([])

onMounted(() => {
  routes.value = useSystemRoutes()
})
</script>
