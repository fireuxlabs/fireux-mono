//cleanbox-app/layout/default
<template>
  <ClientOnly>
    <CoreDefault :routes="routes" />
  </ClientOnly>
</template>

<script setup>
const systemRoutes = useSystemRoutes()
const jobPublicRoutes = getJobRoutes() || []
const { isAppUser, isAdmin } = useAppUser()
let jobPrivateRoutes = []

if (import.meta.client) {
  jobPrivateRoutes = (await getJobProfileRoutes()) || []
}

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
