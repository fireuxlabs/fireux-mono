<template>
  <div>
    <UCard>
      <template #header>
        <h1>🔧 App Development Tools</h1>
      </template>
      <p>App: {{ app?.app_name || 'None' }}</p>
    </UCard>

    <UCard v-if="app">
      <h2>Components</h2>

      <h3>Pill</h3>
      <FireOrganismsAppCardsPill :app="app" />

      <USeparator />

      <h3>Cell</h3>
      <FireOrganismsAppCardsCell :app="app" />

      <USeparator />

      <h3>Profile</h3>
      <FireOrganismsAppCardsProfile :app="app" />
    </UCard>

    <UCard>
      <FireCopyJson :data="{ app }" title="App JSON" />
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

</script>
