<template>
  <UDashboardPanel id="dashboard-favorites">
    <template #header>
      <LayoutsDashboardNavbar title="Favorites" />
    </template>

    <template #body>
      <UPage>
        <UPageBody class="pagebody">
          <UPageHeader description="Saved items appear as you use the app." />
          <UPageCard variant="subtle" title="No favorites yet">
            <p class="text-sm text-dimmed">You haven’t saved anything yet.</p>
          </UPageCard>
        </UPageBody>
      </UPage>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { definePageMeta } from '#imports'

definePageMeta({
  layout: 'dashboard',
  nav: {
    key: 'dashboard-favorites',
    label: 'Favorites',
    icon: 'i-lucide-heart',
    desktop: true,
    layouts: ['dashboard'],
  },
  requiresAuth: true,
})
</script>
