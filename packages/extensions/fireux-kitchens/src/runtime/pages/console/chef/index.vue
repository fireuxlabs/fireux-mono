<!-- FILE: packages/ecosystem/fireux-misebox/src/runtime/pages/console/chef/index.vue -->
<template>
  <UDashboardPanel id="console-chef-home">
    <template #header>
      <LayoutsConsoleNavbar title="Chef" />
    </template>

    <template #body>
      <div class="panels-stack">
        <div class="grid gap-4 lg:grid-cols-3">
          <UCard class="lg:col-span-2">
            <div class="space-y-2">
              <p class="text-sm font-medium">Welcome back</p>
              <p class="text-sm text-dimmed">
                Keep your chef profile updated for faster discovery.
              </p>
            </div>

            <div class="mt-4 flex flex-wrap gap-2">
              <UButton
                to="/console/chef/profile"
                label="Edit profile"
                color="neutral"
                size="sm"
              />
              <UButton
                to="/console/chef/my-recipes"
                label="Open my recipes"
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
                to="/console/chef/profile"
                label="Add signature dishes"
                color="neutral"
                block
              />
              <UButton
                to="/console/chef/profile"
                label="Update chef bio"
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
              Add signature dishes to showcase your style.
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-lucide-check-circle" class="text-primary" />
              Keep your headline and summary fresh.
            </li>
            <li class="flex items-center gap-2">
              <UIcon name="i-lucide-check-circle" class="text-primary" />
              Upload a profile image to build trust.
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
    key: 'console-chef-home',
    label: 'Chef',
    icon: 'i-lucide-chef-hat',
    desktop: false,
    mobile: false,
    group: 'profiles',
    profileId: 'chef',
  },
  requiresAuth: true,
})
</script>
