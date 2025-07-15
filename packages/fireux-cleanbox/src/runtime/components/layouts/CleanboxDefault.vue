<template>
  <ClientOnly>
    <CoreDefault :routes="routes" />
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

// Cleanbox-specific routes for cleaning services
const cleanboxRoutes = [
  { label: 'Services', icon: 'i-heroicons-sparkles', to: '/services' },
  { label: 'Book Cleaning', icon: 'i-heroicons-calendar', to: '/book' },
  { label: 'About Us', icon: 'i-heroicons-information-circle', to: '/about' },
]

const routes = {
  menuBarLinks: [...systemRoutes, ...cleanboxRoutes],
  mobileLinks: [
    ...systemRoutes,
    ...cleanboxRoutes,
    ...(isAppUser ? appUserGroup : []),
    ...(isAdmin ? adminGroup : []),
  ],
}
</script>
