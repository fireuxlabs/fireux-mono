<template>
  <FireProviderToolFrame
    provider-name="Sproochli"
    provider-url="https://sproochli.web.app"
    logo-alt="Sproochli"
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
