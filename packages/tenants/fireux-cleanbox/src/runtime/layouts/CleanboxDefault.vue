<template>
  <CoreDefault :routes="cleanboxRoutes" />
</template>

<script setup>
console.log('🧽 CleanboxDefault component is loading...')

// Get Cleanbox-specific routes when user is authenticated
const cleanboxRoutes = (await getCleanboxRoutes()) || []


</script>
