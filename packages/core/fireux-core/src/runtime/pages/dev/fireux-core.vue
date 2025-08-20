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
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        "
      >
        <h2 style="margin: 0">JSON Snapshot</h2>
        <UButton
          icon="i-heroicons-clipboard-document"
          size="sm"
          variant="outline"
          @click="copyToClipboard(jsonSnapshot)"
        >
          Copy JSON
        </UButton>
      </div>
      <pre>{{ jsonSnapshot }}</pre>
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

// JSON snapshot for copy functionality
const jsonSnapshot = computed(() => {
  return JSON.stringify(
    {
      currentApp: app.value,
      computedProps: {
        isInitialized: isInitialized.value,
      },
      collection: {
        total: apps.value?.length || 0,
        apps: apps.value,
      },
    },
    null,
    2
  )
})

// Copy to clipboard function
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text)
    console.log('JSON copied to clipboard!')
  } catch (err) {
    console.error('Failed to copy JSON:', err)
  }
}
</script>
