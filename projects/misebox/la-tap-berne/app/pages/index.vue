<template>
  <main>
    <h1>La Tap Berne data proof</h1>
    <p>
      Plain read-only view of the existing Kitchen/Menu data before migration,
      styling, ordering, or custom venue copy.
    </p>
    <p>
      <NuxtLink to="/kitchens/la-tapberne/menus/main">
        Open the La Tap menu proof
      </NuxtLink>
    </p>
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

useHead({
  title: 'La Tap Berne data proof',
})
</script>
