<template>
  <CoreDefault :routes="cleanboxRoutes" />
</template>

<script setup>
console.log('🧽 CleanboxDefault component is loading...')

// Get Cleanbox-specific routes when user is authenticated
const cleanboxRoutes = await getCleanboxRoutes() || []

// Log the cleanboxRoutes to debug their contents
console.log('🧽 Cleanbox Routes:', cleanboxRoutes)
console.log('🧽 Cleanbox Routes Type:', typeof cleanboxRoutes)
</script>
