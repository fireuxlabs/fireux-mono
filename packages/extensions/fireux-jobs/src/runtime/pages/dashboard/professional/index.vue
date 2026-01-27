<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/dashboard/professional/index.vue -->
<template>
  <UDashboardPanel id="dashboard-professional-home">
    <template #header>
      <LayoutsDashboardNavbar title="Professional" />
    </template>

    <template #body>
      <div class="panels-stack">
        <div class="grid gap-4 lg:grid-cols-3">
          <UCard class="lg:col-span-2">
            <div class="space-y-2">
              <p class="text-sm font-medium">Welcome back</p>
              <p class="text-sm text-dimmed">
                Keep your professional profile fresh to boost discovery.
              </p>
            </div>

            <div class="mt-4 flex flex-wrap gap-2">
              <UButton
                to="/dashboard/professional/profile"
                label="Edit profile"
                color="neutral"
                size="sm"
              />
              <UButton
                to="/dashboard/professional/my-jobs"
                label="View my jobs"
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
                to="/dashboard/professional/profile"
                label="Update headline"
                color="neutral"
                block
              />
              <UButton
                to="/dashboard/professional/profile"
                label="Add service types"
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
              Add a summary that explains your specialties.
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-lucide-check-circle" class="text-primary" />
              List service types and work areas.
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
  layout: 'dashboard',
  nav: {
    key: 'dashboard-professional-home',
    label: 'Professional',
    icon: 'i-lucide-user-star',
    desktop: false,
    mobile: false,
    group: 'profiles',
    profileId: 'professional',
  },
  requiresAuth: true,
})
</script>
