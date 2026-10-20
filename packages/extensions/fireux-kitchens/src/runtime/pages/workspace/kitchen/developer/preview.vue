<template>
  <div class="flex min-h-full min-w-0 flex-1">
    <UDashboardPanel id="workspace-kitchen-preview">
      <template #header>
        <LayoutsWorkspaceNavbar title="Kitchen Preview" />
      </template>

      <template #body>
        <section class="space-y-4">
          <UCard>
            <template #header>
              <h1 class="text-base font-semibold text-highlighted">
                Preview moved
              </h1>
            </template>

            <p class="text-sm text-dimmed">
              Menus now preview through exact published menu URLs. Create and
              publish a menu, then open it from the menu QR page.
            </p>

            <template #footer>
              <div class="flex flex-wrap gap-2">
                <UButton
                  to="/workspace/kitchen/food-and-drink/menus"
                  icon="i-lucide-book-open"
                >
                  Manage menus
                </UButton>
                <UButton
                  to="/workspace/kitchen/qr"
                  variant="soft"
                  icon="i-lucide-qr-code"
                >
                  QR
                </UButton>
              </div>
            </template>
          </UCard>
        </section>
      </template>
    </UDashboardPanel>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'workspace',
  workspaceSurface: 'browse',
  visibility: { modules: ['fireux-kitchens'] },
  nav: {
    key: 'workspace-kitchen-preview',
    label: 'Preview',
    icon: 'i-lucide-eye',
    position: 'top',
    hidden: true,
    desktop: false,
    mobile: false,
    layouts: ['workspace'],
  },
  requiresAuth: true,
  requiresSelection: true,
})
</script>
