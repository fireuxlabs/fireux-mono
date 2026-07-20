<!-- Concurrent edit — 2026-07-20 17:22 CEST — Demo Data Spine pass: remove the retired personal property slug from admin guidance. -->
<template>
  <AdminDomainCurationPanel
    domain="property"
    title="Properties"
    description="Add comma-separated property slugs to feature on public property surfaces."
    placeholder="preview-stay, alpine-studio"
  />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  adminSurface: {
    surface: true,
    key: 'properties',
    domain: 'properties',
    label: 'Properties',
    description: 'Feature property slugs on public property surfaces.',
    icon: 'i-lucide-house',
    order: 170,
  },
  requiresAuth: true,
  roles: ['admin'],
})
</script>
