<!-- Concurrent edit — 2026-07-21 13:34 CEST — Project Operation roadmaps: use the shared checklist page shape. -->
<template>
  <OperationRoadmapPage
    title="Users"
    description="Monitor new App users."
    :items="roadmap"
    :action="action"
  />
</template>

<script setup lang="ts">
const roadmap = [
  { label: 'Shared FireUX user identity', done: true },
  { label: 'Review new App users across FireUX', done: true },
  { label: 'See the source App and Project for each new user', done: true },
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
  label: 'Open Project Users',
  to: '/console/project/users',
  icon: 'i-lucide-users',
} as const

useSeoMeta({
  title: 'Project users - FireUX',
  description:
    'Monitor new App users across FireUX and see their source App and Project.',
})
</script>
