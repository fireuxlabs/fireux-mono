<!-- FILE: packages/ecosystem/fireux-misebox/src/runtime/pages/console/supplier/index.vue -->
<template>
  <UDashboardPanel id="console-supplier-home">
    <template #header>
      <LayoutsConsoleNavbar title="Supplier" />
    </template>

    <template #body>
      <div class="panels-stack">
        <div class="grid gap-4 lg:grid-cols-3">
          <UCard class="lg:col-span-2">
            <div class="space-y-2">
              <p class="text-sm font-medium">Welcome back</p>
              <p class="text-sm text-dimmed">
                Keep your supplier profile updated to drive new orders.
              </p>
            </div>

            <div class="mt-4 flex flex-wrap gap-2">
              <UButton
                to="/console/supplier/profile"
                label="Edit profile"
                color="neutral"
                size="sm"
              />
              <UButton
                to="/console/supplier/my-stock"
                label="Open my stock"
                variant="soft"
                color="neutral"
                size="sm"
              />
            </div>
          </UCard>

          <UCard>
            <template #header>
              <div class="flex items-center gap-2 text-sm font-semibold">
                <UIcon name="i-lucide-sparkles" />
                Quick actions
              </div>
            </template>
            <div class="space-y-2">
              <UButton
                to="/console/supplier/profile"
                label="Add product categories"
                color="neutral"
                block
              />
              <UButton
                to="/console/supplier/profile"
                label="Update delivery areas"
                variant="soft"
                color="neutral"
                block
              />
            </div>
          </UCard>
        </div>

        <UCard>
          <template #header>
            <div class="flex items-center gap-2 text-sm font-semibold">
              <UIcon name="i-lucide-flag" />
              Profile checklist
            </div>
          </template>
          <ul class="space-y-2 text-sm text-dimmed">
            <li class="flex items-center gap-2">
              <UIcon name="i-lucide-check-circle" class="text-primary" />
              Add categories and delivery areas for accurate matching.
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-lucide-check-circle" class="text-primary" />
              Update your summary and bio to reflect current offerings.
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-lucide-check-circle" class="text-primary" />
              Upload a profile image for credibility.
            </li>
          </ul>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'console',
  nav: {
    visibility: { modules: ['fireux-drop'] },
    key: 'console-supplier-home',
    label: 'Supplier',
    icon: 'i-lucide-package',
    desktop: false,
    mobile: false,
    group: 'profiles',
    profileId: 'supplier',
  },
  requiresAuth: true,
})
</script>
