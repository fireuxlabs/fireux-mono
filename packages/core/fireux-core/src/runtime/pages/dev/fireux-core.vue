<template>
  <div>
    <UCard>
      <template #header>
        <h1>⚙️ FireUX Runtime</h1>
      </template>
      <ul class="list-disc pl-5 space-y-1">
        <li><strong>ecosystem:</strong> {{ config.ecosystem || 'n/a' }}</li>
        <li><strong>role:</strong> {{ config.role }}</li>
        <li><strong>appId:</strong> {{ config.appId }}</li>
        <li><strong>appName:</strong> {{ config.appName }}</li>
        <li><strong>modules:</strong> {{ (config.modules || []).join(', ') || 'none' }}</li>
        <li><strong>devMode:</strong> {{ String(config.devMode) }}</li>
      </ul>
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
      <DevJson :data="{ runtime: config }" title="Runtime Config" />
    </UCard>

    <UCard>
      <template #header>
        <h2>All Apps ({{ apps?.length || 0 }})</h2>
      </template>

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
definePageMeta({
  layout: 'dev',
  nav: {
    key: 'dev-fireux-core',
    label: 'FireUX Core',
    icon: 'i-lucide-cpu',
    desktop: true,
    group: 'core',
    layouts: ['dev'],
  },
})

// Runtime config
const config = useFireUXConfig()
// Apps collection (secondary)
const { apps } = useApp()
</script>
