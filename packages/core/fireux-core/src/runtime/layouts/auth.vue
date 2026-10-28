<template>
  <ClientOnly>
    <slot />
  </ClientOnly>
</template>

<script setup lang="ts">
defineOptions({ name: 'auth' })
</script>
