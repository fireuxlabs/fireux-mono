<!-- Concurrent edit — 2026-07-21 12:36 CEST — Cleanbox-to-Werkbox migration: update the ecosystem curation example. -->
<template>
  <AdminDomainCurationPanel
    domain="ecosystem"
    title="Ecosystems"
    description="Add comma-separated ecosystem slugs to feature on public ecosystem surfaces."
    placeholder="fireux, misebox, werkbox"
  />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  adminSurface: {
    surface: true,
    key: 'ecosystems',
    label: 'Ecosystems',
    description: 'Feature ecosystem slugs on public ecosystem surfaces.',
    icon: 'i-lucide-orbit',
    order: 40,
  },
  requiresAuth: true,
  roles: ['admin'],
})
</script>
