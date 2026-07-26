<!-- Concurrent edit — 2026-07-20 16:26 CEST — Extension Console Spine pass: require an active Kitchen for the Theme identity route. -->
<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="console-kitchen-identity-theme">
      <template #header>
        <LayoutsConsoleNavbar title="Themes">
          <template #right>
            <UButton
              size="sm"
              color="neutral"
              variant="ghost"
              icon="i-lucide-arrow-left"
              to="/console/kitchen/identity"
            >
              Identity
            </UButton>
          </template>
        </LayoutsConsoleNavbar>
      </template>

      <template #body>
        <div class="console-profile">
          <ConsoleKitchenIdentityTheme />
        </div>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  requiresAuth: true,
  requiresSelection: true,
})
</script>
