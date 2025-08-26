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
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        "
      >
        <h2 style="margin: 0">JSON</h2>
        <UButton
          icon="i-heroicons-clipboard-document"
          size="sm"
          variant="outline"
          @click="copyToClipboard(jsonSnapshot)"
        >
          Copy
        </UButton>
      </div>
      <pre>{{ jsonSnapshot }}</pre>
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

// JSON snapshot for copy functionality
const jsonSnapshot = computed(() => {
  return JSON.stringify(
    {
      app: app.value,
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
