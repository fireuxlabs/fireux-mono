<template>
  <div>
    <UCard>
      <template #header>
        <h1>🏠 Misebox Tennant View</h1>
      </template>
      <p>This page shows tenant-scoped (app) data if applicable.</p>
      <p v-if="!app">No app document loaded.</p>
      <template v-else>
        <p><strong>App Name:</strong> {{ app.app_name || app.id }}</p>
        <p><strong>Admins:</strong> {{ app.admin_ids?.length || 0 }}</p>
        <FireDevJson :data="{ app }" title="App JSON" />
      </template>
    </UCard>
  </div>
</template>

<script setup>
definePageMeta({ layout: 'dev' })
const { app } = await useApp()
</script>
