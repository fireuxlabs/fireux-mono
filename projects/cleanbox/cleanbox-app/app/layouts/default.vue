<template>
  <CoreDefault :appLinks="combinedRoutes" />
</template>

<script setup>
const { appUser } = await useAppUser()
console.log('1. useAppUser result:', appUser.value)

const jobPublicRoutes = getPublicJobRoutes() || []
console.log('2. getPublicJobRoutes result:', jobPublicRoutes)

const jobPrivateRoutes = appUser.value ? getPrivateJobRoutes() || [] : []
console.log('3. getPrivateJobRoutes result:', jobPrivateRoutes)
console.log(
  '4. appUser.value check:',
  appUser.value ? 'User authenticated' : 'No user'
)

// Future-proofed: Add more route sources here when needed
const combinedRoutes = [
  ...jobPublicRoutes,
  ...jobPrivateRoutes,
  // ...kitchenRoutes, // Add when kitchen module is ready
  // ...otherRoutes,   // Example for future
]

console.log('5. Final combinedRoutes:', combinedRoutes)
console.log('6. Combined routes count:', combinedRoutes.length)
</script>
