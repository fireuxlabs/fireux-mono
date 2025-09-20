<template>
  <div class="page">
    <h1>Development Tools</h1>

    <div class="dev-links">
      <UButton to="/dev/app">App Config</UButton>
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

.dev-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
}
</style>
