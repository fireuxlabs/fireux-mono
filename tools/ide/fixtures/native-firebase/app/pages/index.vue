<template>
  <main>
    <h1>{{ publicKitchen?.name }}</h1>
    <p>SSR database: {{ publicKitchen?.database }}</p>
    <ClientOnly><NativeProbe /></ClientOnly>
  </main>
</template>
<script setup lang="ts">
const { data: publicKitchen } = await useFetch('/api/public')
</script>
