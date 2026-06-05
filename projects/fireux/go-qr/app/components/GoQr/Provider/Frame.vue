<template>
  <ProviderToolFrame
    provider-name="Go QR"
    provider-url="https://go-qr.web.app"
    logo-alt="Go QR"
    :title="title"
    :description="description"
    :endpoint="endpoint"
  >
    <slot />
  </ProviderToolFrame>
</template>

<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
  endpoint?: string
}>()
</script>
