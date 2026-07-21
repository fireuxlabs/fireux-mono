<!-- Concurrent edit — 2026-07-21 13:34 CEST — Project Operation roadmaps: use the shared checklist page shape. -->
<template>
  <OperationRoadmapPage
    title="Users"
    description="Manage your users."
    :items="roadmap"
    :action="action"
  />
</template>

<script setup lang="ts">
const roadmap = [
  { label: 'Shared FireUX user identity', done: true },
  { label: "See users across all of your project's apps", done: false },
  { label: 'See which app each user joined through', done: false },
  {
    label: 'Receive a notification when a new user signs up to one of your apps',
    done: false,
  },
  { label: 'Invite users to your project', done: false },
  { label: 'Control which apps each user can access', done: false },
  { label: 'Assign roles and permissions', done: false },
  { label: 'Suspend or remove access', done: false },
  { label: 'Review membership and access history', done: false },
] as const

const action = {
  label: 'View users',
  to: '/users',
  icon: 'i-lucide-users',
} as const

useSeoMeta({
  title: 'Manage your users - FireUX',
  description: 'Manage users across a FireUX project and its connected apps.',
})
</script>
