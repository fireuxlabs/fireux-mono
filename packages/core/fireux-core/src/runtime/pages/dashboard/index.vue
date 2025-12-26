<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="Overview" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UTooltip text="Notifications" :shortcuts="['N']">
            <UButton
              color="neutral"
              variant="ghost"
              square
              @click="isNotificationsSlideoverOpen = true"
            >
              <UChip color="error" inset>
                <UIcon name="i-lucide-bell" class="size-5 shrink-0" />
              </UChip>
            </UButton>
          </UTooltip>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <!-- 1) Core (FireUX-wide) -->
      <DashboardCore />

      <!-- 2) Ecosystem (e.g. fireux-fireux) -->
      <DashboardEcosystem />

      <!-- 3) App (e.g. fireux-app) -->
      <DashboardApp />
    </template>
  </UDashboardPanel>

  <!-- Notifications slideover controlled by local ref -->
  <LayoutsDashboardNotificationsSlideover
    v-model:open="isNotificationsSlideoverOpen"
  />
</template>

<script setup lang="ts">
import { definePageMeta, useState } from '#imports'

definePageMeta({
  nav: {
    key: 'dashboard-home',
    label: 'Overview',
    icon: 'i-lucide-layout-dashboard',
    order: 20,
    desktop: true,
    mobile: true,
    layouts: ['dashboard'],
  },
  requiresAuth: true,
  layout: 'dashboard',
})

// Local notifications slideover state (was useDashboard)
const isNotificationsSlideoverOpen = useState<boolean>(
  'fireux-core:dashboard:notifs-open',
  () => false
)
</script>
