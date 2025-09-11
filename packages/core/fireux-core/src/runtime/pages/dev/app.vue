<template>
  <div>
    <UCard>
      <template #header>
        <h1>🔧 App Development Tools</h1>
      </template>
      <p>App: {{ app?.app_name || 'None' }}</p>
      <p>Tenancy: {{ appTenancy }}</p>
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

// Tenancy readout: "is tenant" | "is not tenant"
const { appTenancy } = useAppComputed(app)
</script>