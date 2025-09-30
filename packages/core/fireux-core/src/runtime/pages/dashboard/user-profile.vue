<template>
  <UDashboardPanel id="profile">
    <template #header>
      <UDashboardNavbar title="Your Profile" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <client-only>
        <div v-if="user">
          <div class="grid gap-4 md:grid-cols-2">
            <OrganismsUserCardsProfile :user="user" />
            <OrganismsUserEdit :user="user" />
          </div>
        </div>
        <div v-else>
          <UCard>
            <div class="text-center py-8">
              <UIcon
                name="i-heroicons-user-circle"
                class="w-12 h-12 mx-auto mb-4 text-gray-400"
              />
              <p>Loading profile...</p>
            </div>
          </UCard>
        </div>
      </client-only>
    </template>
  </UDashboardPanel>
</template>

<script setup>
definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'user-profile',
    label: 'Profile',
    icon: 'i-lucide-user',
    group: 'User',
    order: 2,
    desktop: false,
    mobile: true,
  },
  requiresAuth: true,
})

useHead({ title: 'Your Profile' })

const { user } = useUser()
</script>
