<template>
  <main>
    <h1>La Tap Berne</h1>
    <p>
      Plain read-only view of the existing Kitchen/Menu data before migration,
      styling, ordering, or custom venue copy.
    </p>
    <p>
      <NuxtLink to="/menu">
        Open the menu
      </NuxtLink>
    </p>
  </main>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

useHead({
  title: 'La Tap Berne',
})
</script>
