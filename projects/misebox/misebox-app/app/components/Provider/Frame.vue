<template>
  <FireProviderToolFrame
    provider-name="Misebox"
    provider-url="https://misebox.app"
    logo-alt="Misebox"
    :title="title"
    :description="description"
    :endpoint="endpoint"
  >
    <slot />
  </FireProviderToolFrame>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
  endpoint?: string
}>()
</script>
