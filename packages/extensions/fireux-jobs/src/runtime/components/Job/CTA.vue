<!-- Concurrent edit — 2026-07-22 12:39 CEST — Shared Job UI alignment: replace embedded onboarding with compact domain doorways. -->
<template>
  <EntityIndexCta
    title="Your next step"
    cta="Prepare your professional profile or publish an opportunity."
    family="domain-managed"
    :actions="actions"
  />
</template>

<script setup lang="ts">
const actions = [
  {
    label: 'Job seekers',
    cta: 'Create or update your profile',
    to: '/dashboard/professional/profile',
    icon: 'i-lucide-user-round-pen',
  },
  {
    label: 'Employers',
    cta: 'Post or manage jobs',
    to: '/jobs/manage',
    icon: 'i-lucide-briefcase-business',
  },
  {
    label: 'Guide',
    cta: 'Learn more',
    to: '/jobs/learn-more',
    icon: 'i-lucide-book-open',
  },
] as const
</script>
