<template>
  <ClientOnly>
    <CoreDashboard :routes="routes" />
  </ClientOnly>
</template>

<script setup>
const systemRoutes = useSystemRoutes()

// Only call useAppUser on client side to avoid SSR errors
let isAppUser = false
let isAdmin = false

if (process.client) {
  const { isAppUser: clientIsAppUser, isAdmin: clientIsAdmin } =
    await useAppUser()
  isAppUser = clientIsAppUser
  isAdmin = clientIsAdmin
}

const appUserGroup = useAppUserRoutes() || []
const adminGroup = useAdminRoutes() || []

const jobPublicRoutes = getPublicJobRoutes() || []
const jobPrivateRoutes = getPrivateJobRoutes() || []

const routes = {
  menuBarLinks: [...systemRoutes, ...jobPublicRoutes],
  mobileLinks: [
    ...systemRoutes,
    ...jobPublicRoutes,
    ...(isAppUser ? jobPrivateRoutes : []),
    ...(isAppUser ? appUserGroup : []),
    ...(isAdmin ? adminGroup : []),
  ],
  dashboardLinks: [
    ...(isAppUser ? jobPrivateRoutes : []),
    ...(isAppUser ? appUserGroup : []),
    ...(isAdmin ? adminGroup : []),
  ],
}
</script>
