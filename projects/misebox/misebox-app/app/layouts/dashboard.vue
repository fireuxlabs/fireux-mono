<template>
  <CoreDefault :appLinks="combinedRoutes" />
</template>

<script setup>
const { appUser } = await useAppUser()
const jobPublicRoutes = getPublicJobRoutes() || []
const jobPrivateRoutes = appUser ? getPrivateJobRoutes() || [] : []

// Future-proofed: Add more route sources here when needed
const combinedRoutes = [
  ...jobPublicRoutes,
  ...jobPrivateRoutes,
  // ...kitchenRoutes, // Add when kitchen module is ready
  // ...otherRoutes,   // Example for future
]
</script>
