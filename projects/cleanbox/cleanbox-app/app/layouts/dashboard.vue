<template>
  <CoreDashboard :appLinks="combinedRoutes" />
</template>

<script setup>
const { appUser } = await useAppUser()
console.log('DASHBOARD - 1. useAppUser result:', appUser.value)

const jobPublicRoutes = getPublicJobRoutes() || []
console.log('DASHBOARD - 2. getPublicJobRoutes result:', jobPublicRoutes)

const jobPrivateRoutes = appUser.value ? getPrivateJobRoutes() || [] : []
console.log('DASHBOARD - 3. getPrivateJobRoutes result:', jobPrivateRoutes)
console.log(
  'DASHBOARD - 4. appUser.value check:',
  appUser.value ? 'User authenticated' : 'No user'
)

// Future-proofed: Add more route sources here when needed
const combinedRoutes = [
  ...jobPublicRoutes,
  ...jobPrivateRoutes,
  // ...kitchenRoutes, // Add when kitchen module is ready
  // ...otherRoutes,   // Example for future
]

console.log('DASHBOARD - 5. Final combinedRoutes:', combinedRoutes)
console.log('DASHBOARD - 6. Combined routes count:', combinedRoutes.length)
</script>
