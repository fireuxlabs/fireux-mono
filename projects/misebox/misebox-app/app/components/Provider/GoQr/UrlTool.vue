<template>
  <ProviderToolIframe
    :src="toolUrl"
    :title="title"
    :provider-origin="providerBaseUrl"
    message-source="go-qr"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  title?: string
  description?: string
  urlLabel?: string
  urlPlaceholder?: string
  ctaLabel?: string
  qrCentreLabel?: string
}>(), {
  title: 'Menu URL',
  description: 'Paste an existing menu URL and get a printable QR menu.',
  urlLabel: 'Menu URL',
  urlPlaceholder: 'https://my-url.com/menu',
  ctaLabel: 'Create menu URL QR',
  qrCentreLabel: 'Food Menu',
})

const providerBaseUrl = import.meta.dev
  ? 'http://localhost:3013'
  : 'https://go-qr.web.app'

const toolUrl = computed(() => {
  const query = new URLSearchParams({
    title: props.title,
    description: props.description,
    urlLabel: props.urlLabel,
    urlPlaceholder: props.urlPlaceholder,
    ctaLabel: props.ctaLabel,
    qrCentreLabel: props.qrCentreLabel,
  })

  return `${providerBaseUrl}/tools/url?${query}`
})
</script>
