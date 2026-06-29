<template>
  <UDashboardPanel id="dashboard-customer-profile">
    <template #header>
      <LayoutsDashboardNavbar :title="navTitle">
        <template #right>
          <div class="inline-flex items-center gap-1">
            <UButton
              icon="i-lucide-eye"
              size="sm"
              :variant="view === 'profile' ? 'solid' : 'ghost'"
              color="neutral"
              aria-label="View customer profile"
              @click="view = 'profile'"
            />

            <UButton
              icon="i-lucide-notebook-pen"
              size="sm"
              :variant="view === 'edit' ? 'solid' : 'ghost'"
              color="neutral"
              aria-label="Edit customer profile"
              @click="view = 'edit'"
            />
          </div>
        </template>
      </LayoutsDashboardNavbar>
    </template>

    <template #body>
      <div class="console-profile">
        <CustomerIdentity v-if="view === 'profile'" />

        <ClientOnly v-else>
          <div class="console-profile__section">
            <CustomerEditCore />
          </div>
        </ClientOnly>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { customerConfig } from 'fireux-kitchens/runtime/composables/fireux/firestore/profiles/Customer/config/customerConfig'
import { ref } from 'vue'

const profileKey = customerConfig.id ?? 'customer'
const navLabel = customerConfig.navLabel ?? `${customerConfig.profileType} Profile`
const navIcon = customerConfig.navIcon ?? 'i-lucide-user-round'
const navTitle = navLabel

const view = ref<'profile' | 'edit'>('profile')

definePageMeta({
  layout: 'dashboard',
  nav: {
    visibility: { modules: ['fireux-kitchens'], profiles: ['customer'] },
    key: 'dashboard-customer-profile',
    label: navLabel,
    icon: navIcon,
    position: 'middle',
    desktop: true,
    layouts: ['dashboard'],
    group: 'profiles',
    profileId: profileKey,
  },
  requiresAuth: true,
})
</script>
