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

const routes = {
  menuBarLinks: [...systemRoutes],
  mobileLinks: [
    ...systemRoutes,
    ...(isAppUser ? appUserGroup : []),
    ...(isAdmin ? adminGroup : []),
  ],
  dashboardLinks: [
    ...(isAppUser ? appUserGroup : []),
    ...(isAdmin ? adminGroup : []),
  ],
}
</script>
