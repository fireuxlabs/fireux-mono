<template>
  <DashboardAdminDomainCurationPanel
    domain="agent"
    title="Agents"
    description="Add comma-separated agent slugs to feature on public agent surfaces."
    placeholder="agent-one, agent-two"
  />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  adminSurface: {
    surface: true,
    key: 'agents',
    domain: 'agents',
    label: 'Agents',
    description: 'Feature agent slugs on public agent surfaces.',
    icon: 'i-lucide-user-search',
    order: 160,
  },
  requiresAuth: true,
  roles: ['admin'],
})
</script>
