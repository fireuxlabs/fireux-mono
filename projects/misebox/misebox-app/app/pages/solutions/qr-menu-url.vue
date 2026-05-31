<template>
  <ProviderGoQrUrlTool />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'landing',
})

const consumer = {
  description: 'Paste an existing menu URL and get a printable QR menu.',
}

useSeoMeta({
  title: 'Menu URL QR',
  ogTitle: 'Menu URL QR',
  twitterTitle: 'Menu URL QR',
  description: consumer.description,
  ogDescription: consumer.description,
  twitterDescription: consumer.description,
})
</script>
