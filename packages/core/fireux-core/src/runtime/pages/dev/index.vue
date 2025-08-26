<template>
  <div class="dev-page">
    <h1>Development Tools</h1>
    <p>Dev navigation coming soon...</p>

    <div class="dev-links">
      <UButton to="/dev/app">App Config</UButton>
      <UButton to="/dev/app-users">App Users</UButton>
      <UButton to="/dev/core-users">Core Users</UButton>
      <UButton to="/dev/fireux-core">FireUX Core</UButton>
      <UButton to="/dev/design">Design System</UButton>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  title: 'Development Tools',
  layout: 'dev',
})
</script>

<style scoped>
.dev-page {
  padding: 24px;
}

.dev-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
}
</style>
