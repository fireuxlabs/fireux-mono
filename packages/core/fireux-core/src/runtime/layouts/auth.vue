<template>
  <ClientOnly>
    <UMain><slot /></UMain>
  </ClientOnly>
</template>

<script setup lang="ts">
defineOptions({ name: 'auth' })
</script>
