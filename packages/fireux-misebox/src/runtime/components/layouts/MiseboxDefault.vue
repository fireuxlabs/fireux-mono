<template>
  <ClientOnly>
    <CoreDefault :routes="routes" />
  </ClientOnly>
</template>

<script setup>
const systemRoutes = useSystemRoutes()
const jobPublicRoutes = getPublicJobRoutes() || []

// Only call useAppUser on client side to avoid SSR errors
let isAppUser = false
let isAdmin = false

if (process.client) {
  const { isAppUser: clientIsAppUser, isAdmin: clientIsAdmin } =
    await useAppUser()
  isAppUser = clientIsAppUser
  isAdmin = clientIsAdmin
}

const jobPrivateRoutes = getPrivateJobRoutes() || []
const appUserGroup = useAppUserRoutes() || []
const adminGroup = useAdminRoutes() || []

// Misebox-specific routes
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
