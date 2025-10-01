<template>
  <client-only>
    <div class="dashboard-page-grid">
      <div class="dashboard-grid-section">
        <UCard>
          <template #default>
            <h2>Favorites</h2>
            <p>Placeholder for saved items or favorite products.</p>
          </template>
        </UCard>
      </div>
    </div>
  </client-only>
</template>

<script setup>
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
