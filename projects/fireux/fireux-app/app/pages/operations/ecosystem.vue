<!-- Concurrent edit — 2026-07-21 13:34 CEST — Project Ecosystem Operation: publish the practical build roadmap. -->
<template>
  <OperationRoadmapPage
    title="Ecosystem"
    description="Manage your project's ecosystem."
    :items="roadmap"
    :action="action"
  />
</template>

<script setup lang="ts">
const roadmap = [
  { label: 'View the ecosystem connected to your project', done: true },
  { label: 'Create or connect an ecosystem', done: false },
  { label: 'Manage ecosystem identity and branding', done: false },
  { label: 'Manage which apps belong to the ecosystem', done: false },
  { label: 'Manage shared capabilities', done: false },
  { label: 'Review ecosystem activity', done: false },
] as const

const action = {
  label: 'Open Ecosystem',
  to: '/console/project/ecosystem',
  icon: 'i-lucide-orbit',
} as const

useSeoMeta({
  title: 'Manage your project ecosystem - FireUX',
  description: 'Manage the ecosystem connected to your FireUX project.',
})
</script>
