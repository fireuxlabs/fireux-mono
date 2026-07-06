<template>
  <UDashboardPanel id="console-kitchen-preview">
    <template #header>
      <LayoutsConsoleNavbar title="Kitchen Preview" />
    </template>

    <template #body>
      <UCard>
        <template #header>
          <h1 class="text-base font-semibold text-highlighted">
            Preview moved
          </h1>
        </template>

        <p class="text-sm text-dimmed">
          Menus now preview through exact published menu URLs. Create and publish a menu,
          then open it from the menu QR page.
        </p>

        <template #footer>
          <div class="flex flex-wrap gap-2">
            <UButton to="/console/kitchen/menus" icon="i-lucide-book-open">
              Manage menus
            </UButton>
            <UButton
              to="/console/kitchen/qr"
              variant="soft"
              icon="i-lucide-qr-code"
            >
              QR
            </UButton>
          </div>
        </template>
      </UCard>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
// Console sundries quarantine: docs/concepts/console.md
</script>
