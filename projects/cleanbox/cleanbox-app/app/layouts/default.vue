//cleanbox-app/layout/default
<template>
  <ClientOnly>
    <CoreDefault :routes="routes" />
  </ClientOnly>
</template>

<script setup>
const systemRoutes = useSystemRoutes()
const jobPublicRoutes = getPublicJobRoutes() || []
const { isAppUser, isAdmin } = useAppUser()
const jobPrivateRoutes = getPrivateJobRoutes() || []

const appUserGroup = useAppUserRoutes()
const adminGroup = useAdminRoutes()

const routes = {
  menuBarLinks: [...systemRoutes, ...jobPublicRoutes],
  mobileLinks: [
    ...systemRoutes,
    ...jobPublicRoutes,
    ...(isAppUser ? jobPrivateRoutes : []),
    ...(isAppUser ? appUserGroup : []),
    ...(isAdmin ? adminGroup : []),
  ],
}
</script>
