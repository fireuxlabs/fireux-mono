<!-- FILE: packages/extensions/fireux-jobs/src/runtime/pages/dashboard/agent/index.vue -->
<template>
  <UDashboardPanel id="dashboard-agent-home">
    <template #header>
      <UDashboardNavbar title="Agent">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="px-0 py-0 sm:px-4 sm:py-4 lg:px-6 space-y-6">
        <UCard>
          <div class="space-y-4">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-sm font-medium">Hi Daniel</p>
                <p class="text-sm text-dimmed">
                  Agent overview — this is the identity that posts jobs.
                </p>
              </div>

              <UButton
                to="/dashboard/agent/profile"
                label="Build agent profile"
                color="neutral"
                size="sm"
              />
            </div>

            <div class="text-sm whitespace-pre-wrap">
Thank you so much for your message. It's lovely that you're thinking of us 😊

You are welcome to advertise our "unsolicited applications" as job openings:

Cook/Chef https://jobs.huettenzauber.ch/publication/koch-huettenzauber/fk5batbzlnlfcengdagdj5vlk5tiyhbzp17sck3ghwl43i67mm0phm53e27kentq
Service staff https://jobs.huettenzauber.ch/publication/servicemitarbeitende-huettenzauber/ixodqfuayt8hyz10ummbub6k2ichvbjoczqodleob0tqv1yjkxt8hxzwjzaqorye

Do you need any further information from us?

Good evening and happy holidays

Miriam
            </div>
          </div>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-agent-home',
    label: 'Agent',
    icon: 'i-lucide-shield-user',
    desktop: false,
    mobile: false,
    group: 'profiles',
    profileId: 'agent',
  },
  requiresAuth: true,
})
</script>
