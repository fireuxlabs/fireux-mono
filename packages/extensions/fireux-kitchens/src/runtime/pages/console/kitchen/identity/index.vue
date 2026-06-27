<template>
  <UDashboardPanel id="console-kitchen-identity">
    <template #header>
      <LayoutsConsoleNavbar :title="navTitle" />
    </template>

    <template #body>
      <div class="console-profile">
        <ClientOnly>
          <div class="console-profile__section">
            <ConsoleKitchenIdentitySections />
          </div>
        </ClientOnly>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
const navTitle = 'Identity'

definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-kitchens'] },
    key: 'console-kitchen-identity',
    label: 'Identity',
    icon: 'i-lucide-info',
    position: 'top',
    requiresSelection: true,
    order: 3,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})
</script>
