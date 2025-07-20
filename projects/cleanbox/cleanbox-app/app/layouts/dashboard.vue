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

const jobPublicRoutes = getJobRoutes() || []
let jobPrivateRoutes = []

if (import.meta.client) {
  jobPrivateRoutes = (await getJobProfileRoutes()) || []
}

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
