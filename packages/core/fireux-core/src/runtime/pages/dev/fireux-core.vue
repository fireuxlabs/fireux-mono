<template>
  <div>
    <UCard>
      <h1>FireUX Core - Apps</h1>
      <p>App: {{ app?.name || app?.id || 'None' }}</p>
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
      <DevJson
        :data="{
          currentApp: app,
          computedProps: { isInitialized },
          collection: { total: apps?.length || 0, apps },
        }"
        title="Apps JSON"
      />
    </UCard>

    <UCard>
      <h2>All Apps ({{ apps?.length || 0 }})</h2>

      <div v-if="apps?.length">
        <OrganismsAppCardsCell
          v-for="appItem in apps"
          :key="appItem.id"
          :app="appItem"
        />
      </div>

      <p v-else>No apps found</p>
    </UCard>
  </div>
</template>

<script setup>
const { app, apps, isInitialized } = await useApp()
</script>
