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

const appUserGroup = useAppUserRoutes() || []
const adminGroup = useAdminRoutes() || []

const miseboxRoutes = [
  { label: 'Chefs', icon: 'i-lucide-cooking-pot', to: '/chefs' },
  { label: 'Suppliers', icon: 'i-lucide-truck', to: '/suppliers' },
]

const routes = {
  menuBarLinks: [...systemRoutes, ...jobPublicRoutes, ...miseboxRoutes],
  mobileLinks: [
    ...systemRoutes,
    ...jobPublicRoutes,
    ...miseboxRoutes,
    ...(isAppUser ? jobPrivateRoutes : []),
    ...(isAppUser ? appUserGroup : []),
    ...(isAdmin ? adminGroup : []),
  ],
}
</script>
