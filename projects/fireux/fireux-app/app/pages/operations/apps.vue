<!-- Concurrent edit — 2026-07-21 13:34 CEST — Project Apps Operation: publish the practical build roadmap. -->
<template>
  <OperationRoadmapPage
    title="Apps"
    description="Manage your project's apps."
    :items="roadmap"
    :action="action"
  />
</template>

<script setup lang="ts">
const roadmap = [
  { label: 'View apps connected to your project', done: true },
  { label: 'Add a new app', done: false },
  { label: "Manage each app's identity and branding", done: false },
  { label: 'Connect domains', done: false },
  { label: 'See hosting and deployment status', done: false },
  { label: "Open each app's console", done: false },
] as const

const action = {
  label: 'Open Apps',
  to: '/console/project/apps',
  icon: 'i-lucide-app-window',
} as const

useSeoMeta({
  title: 'Manage your project apps - FireUX',
  description: "Manage the apps connected to your FireUX project.",
})
</script>
