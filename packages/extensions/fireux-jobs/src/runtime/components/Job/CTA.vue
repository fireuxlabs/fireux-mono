<!-- Concurrent edit — 2026-07-22 12:39 CEST — Shared Job UI alignment: replace embedded onboarding with compact domain doorways. -->
<template>
  <EntityIndexCta
    title="Jobs"
    cta="Post an opportunity or prepare your professional profile."
    family="domain-managed"
    :actions="actions"
  />
</template>

<script setup lang="ts">
const actions = [
  {
    label: 'Employers',
    cta: 'Post a job',
    to: '/jobs/create',
    icon: 'i-lucide-briefcase-business',
  },
  {
    label: 'Professionals',
    cta: 'Update your profile',
    to: '/dashboard/professional/profile',
    icon: 'i-lucide-user-round-pen',
  },
  {
    label: 'Guide',
    cta: 'Learn more',
    to: '/jobs/learn-more',
    icon: 'i-lucide-book-open',
  },
] as const
</script>
