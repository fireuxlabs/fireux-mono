<template>
  <div class="page">
    <h1>Development Tools</h1>

    <div class="dev-links">
      <!-- Core dev links -->
      <UButton to="/dev/app">App Config</UButton>
      <UButton to="/dev/fireux-core">FireUX Core</UButton>
      <UButton to="/dev/design">Design System</UButton>
      <UButton to="/dev/users">Users</UButton>

      <!-- Tenant/Extension dev links -->
      <UButton to="/dev/fireux-misebox" color="primary">Misebox Global</UButton>
      <UButton to="/dev/fireux-jobs" color="primary">Jobs Global</UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Development Tools',
  layout: 'dev',
})
</script>

<style scoped>
.dev-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
}
</style>
