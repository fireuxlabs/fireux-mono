<template>
  <div>
    <UCard>
      <template #header>
        <h1>🔧 App Development Tools</h1>
      </template>
      <p>App: {{ app?.app_name || 'None' }}</p>
  <p>Tenancy: {{ tenancyDisplay }}</p>
    </UCard>

    <UCard v-if="app">
      <h2>Components</h2>

      <h3>Pill</h3>
      <OrganismsAppCardsPill :app="app" />

      <USeparator />

      <h3>Cell</h3>
      <OrganismsAppCardsCell :app="app" />

      <USeparator />

      <h3>Profile</h3>
      <OrganismsAppCardsProfile :app="app" />
    </UCard>

    <UCard>
      <DevJson :data="{ app }" title="App JSON" />
    </UCard>
  </div>
</template>

<script setup>
// Use dev layout
definePageMeta({
  layout: 'dev',
})

// Get app information
const { app } = await useApp()

import { computed } from 'vue'
// Tenancy role string (e.g. 'King' | 'tennant' | fallback)
const { appTenancy } = useAppComputed(app)
const rc = useRuntimeConfig()
const tenancyDisplay = computed(() => {
  const eco = rc.public?.ecosystem || 'ecosystem'
  const role = (appTenancy.value || '').toString()
  if (!role) return `Unknown of ${eco}`
  if (role.toLowerCase() === 'king') return `King of ${eco}`
  if (role === 'tennant') return `Tennant of ${eco}`
  return `${role} of ${eco}`
})
</script>