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

// Cleanbox-specific dashboard routes
const cleanboxDashboardRoutes = [
  {
    label: 'My Bookings',
    icon: 'i-heroicons-calendar-days',
    to: '/dashboard/bookings',
  },
  {
    label: 'Service History',
    icon: 'i-heroicons-clock',
    to: '/dashboard/history',
  },
  {
    label: 'Payment Methods',
    icon: 'i-heroicons-credit-card',
    to: '/dashboard/payments',
  },
]

const routes = {
  menuBarLinks: [...systemRoutes],
  mobileLinks: [
    ...systemRoutes,
    ...(isAppUser ? appUserGroup : []),
    ...(isAdmin ? adminGroup : []),
  ],
  dashboardLinks: [
    ...cleanboxDashboardRoutes,
    ...(isAppUser ? appUserGroup : []),
    ...(isAdmin ? adminGroup : []),
  ],
}
</script>
