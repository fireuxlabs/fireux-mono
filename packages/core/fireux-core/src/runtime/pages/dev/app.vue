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
      <template #header>
        <h2>Computed</h2>
      </template>
      <ul class="list-disc pl-5 space-y-1">
        <li><strong>tenancyDisplay:</strong> {{ tenancyDisplay }}</li>
        <li><strong>appTenancy:</strong> {{ appTenancy || 'n/a' }}</li>
      </ul>
      <USeparator class="my-3" />
      <DevJson :data="{ app, appTenancy, tenancyDisplay }" title="App JSON" />
    </UCard>
  </div>
</template>

<script setup>
// Use dev layout + nav meta
definePageMeta({
  layout: 'dev',
  nav: {
    key: 'dev-app',
    label: 'App Config',
    icon: 'i-lucide-settings',
    desktop: true,
    group: 'core',
    layouts: ['dev'],
  },
})

// Get app information
const { app, appTenancy, tenancyDisplay } = useApp()
</script>
