<!-- Concurrent edit — 2026-07-20 16:19 CEST — Extension Console Spine pass: move console access metadata to the route and classify its surface. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="console-kitchen-home">
      <template #header>
        <LayoutsConsoleNavbar title="Kitchen AI">
          <template #right>
            <UButton
              v-if="!isAuthenticated"
              to="/auth?mode=sign-up&redirect=%2Fconsole%2Fkitchen"
              label="Save my Kitchen"
              color="neutral"
              variant="soft"
            />
          </template>
        </LayoutsConsoleNavbar>
      </template>

      <template #body>
        <section class="console-surface">
          <ConsoleKitchenTools />
          <ConsoleKitchenAI />
          <ConsoleKitchen v-if="isAuthenticated" />
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'

const { isAuthenticated } = useAuth()

definePageMeta({
  layout: 'console',
  consoleSurface: 'browse',
  consoleAccess: 'public-entry',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'console-kitchen',
    label: 'Kitchens',
    icon: 'i-lucide-chef-hat',
    position: 'bottom',
    order: 900,
    desktop: true,
    mobile: true,
    layouts: ['console'],
  },
  requiresAuth: false,
  requiresSelection: false,
})
</script>
