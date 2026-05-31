<template>
  <ProviderGoQrDocTool
    :preview-base-url="`${consumerBaseUrl}/menus`"
    preview-path-suffix="/qr"
    :create-endpoint="`${consumerBaseUrl}/api/menus/create`"
    :availability-endpoint="`${consumerBaseUrl}/api/menus/availability`"
  />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
})

const consumerBaseUrl = import.meta.dev
  ? 'http://localhost:3001'
  : 'https://misebox.app'

useSeoMeta({
  title: 'QR menu',
  ogTitle: 'QR menu',
  twitterTitle: 'QR menu',
  description: 'hello world',
  ogDescription: 'hello world',
  twitterDescription: 'hello world',
})
</script>
