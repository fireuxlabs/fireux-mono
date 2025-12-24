<template>
  <UDashboardPanel id="dashboard-favorites">
    <template #header>
      <UDashboardNavbar title="Favorites">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <client-only>
        <div class="dashboard-page-grid">
          <div class="dashboard-grid-section">
            <UCard>
              <template #default>
                <p>Placeholder for saved items or favorite products.</p>
              </template>
            </UCard>
          </div>
        </div>
      </client-only>
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
