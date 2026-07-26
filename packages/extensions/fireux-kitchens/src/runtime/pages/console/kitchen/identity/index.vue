<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Console Spine pass: move console access metadata to the route and classify its surface. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
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
  </div>
</template>

<script setup lang="ts">
const navTitle = 'Identity'

definePageMeta({
  layout: 'console',
  consoleSurface: 'browse',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'console-kitchen-identity',
    label: 'Identity',
    icon: 'i-lucide-info',
    position: 'top',
    order: 3,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
