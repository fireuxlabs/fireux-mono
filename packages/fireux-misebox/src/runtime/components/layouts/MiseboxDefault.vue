<template>
  <ClientOnly>
    <CoreDefault :routes="routes" />
  </ClientOnly>
</template>

<script setup>
const jobRoutes = getJobRoutes() || []
const miseboxRoutes = getMiseboxRoutes() || []

// Get all core routes with user state handling
const coreRoutes = await getCoreRoutes()

// Get domain-specific profile routes
let jobProfileRoutes = []
let miseboxProfileRoutes = []

if (import.meta.client) {
  jobProfileRoutes = (await getJobProfileRoutes()) || []
  miseboxProfileRoutes = (await getMiseboxProfileRoutes()) || []
}

const routes = {
  menuBarLinks: [...coreRoutes.coreRoutes, ...jobRoutes, ...miseboxRoutes],
  mobileLinks: [
    ...coreRoutes.coreRoutes,
    ...jobRoutes,
    ...miseboxRoutes,
    ...jobProfileRoutes, // Job profile routes (Employer/Professional)
    ...miseboxProfileRoutes, // Misebox profile routes (Chef/Supplier)
    ...coreRoutes.appUserRoutes, // App user routes (conditionally loaded)
    ...coreRoutes.adminRoutes, // Admin routes (conditionally loaded)
  ],
}
</script>
