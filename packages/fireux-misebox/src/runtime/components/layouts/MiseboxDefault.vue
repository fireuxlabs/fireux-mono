<template>
  <ClientOnly>
    <CoreDefault :routes="routes" />
  </ClientOnly>
</template>

<script setup>
// Collect all misebox package routes
const jobRoutes = getJobRoutes() || []
const miseboxRoutes = getMiseboxRoutes() || []

// Get domain-specific profile routes
let jobProfileRoutes = []
let miseboxProfileRoutes = []

if (import.meta.client) {
  jobProfileRoutes = (await getJobProfileRoutes()) || []
  miseboxProfileRoutes = (await getMiseboxProfileRoutes()) || []
}

// Just jam everything misebox needs into routes - core handles the rest
const routes = [
  ...jobRoutes,
  ...miseboxRoutes,
  ...jobProfileRoutes,
  ...miseboxProfileRoutes,
]
</script>
