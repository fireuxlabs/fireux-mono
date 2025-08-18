<template>
  <div>
    <UCard>
      <h1>FireUX Core - Apps</h1>
      <p>App: {{ app?.name || app?.id || 'None' }}</p>
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
      <h2>JSON Snapshot</h2>
      <pre>{{
        JSON.stringify(
          {
            currentApp: app,
            computedProps: {
              isInitialized,
            },
            collection: {
              total: apps?.length || 0,
              apps: apps,
            },
          },
          null,
          2
        )
      }}</pre>
    </UCard>

    <UCard>
      <h2>All Apps ({{ apps?.length || 0 }})</h2>

      <div v-if="apps?.length">
        <FireOrganismsAppCardsCell
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
