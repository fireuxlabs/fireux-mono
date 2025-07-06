// cleanbox-app/layouts/dashboard
<template>
  <ClientOnly>
    <CoreDashboard :routes="routes" />
  </ClientOnly>
</template>

<script setup>
const systemRoutes = useSystemRoutes()
const { isAppUser, isAdmin } = useAppUser()
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
