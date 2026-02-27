<script setup lang="ts">
import { definePageMeta } from '#imports'

// Note: This page can expand with invite/manage actions; see archived members mechanics for list + search patterns.
definePageMeta({
  layout: 'console',
  nav: {
    key: 'console-followers',
    label: 'Followers',
    icon: 'i-lucide-users',
    desktop: true,
    layouts: ['console'],
  },
  requiresAuth: true,
})

</script>

<template>
  <UDashboardPanel id="console-followers">
    <template #header>
      <LayoutsConsoleNavbar title="Followers" />
    </template>

    <template #body>
      <UPage>
        <UPageBody class="pagebody">
          <UPageHeader
            description="People who follow your updates."
          />

          <UPageCard
            title="No followers yet"
            description="Follower lists appear when modules enable social features."
            variant="subtle"
          >
            <div class="flex flex-wrap gap-2">
              <UButton
                to="/console/user-profile"
                label="Update your profile"
                color="neutral"
                class="w-fit"
              />
            </div>
          </UPageCard>
        </UPageBody>
      </UPage>
    </template>
  </UDashboardPanel>
</template>
