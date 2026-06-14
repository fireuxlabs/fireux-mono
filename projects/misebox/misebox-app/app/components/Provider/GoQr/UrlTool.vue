<template>
  <section class="space-y-2">
    <div v-if="isDev" class="flex justify-end">
      <UBadge color="neutral" variant="soft" size="sm">
        Go QR: {{ providerModeLabel }}
      </UBadge>
    </div>

    <ProviderToolIframe
      :src="toolUrl"
      :title="title"
      :provider-origin="providerBaseUrl"
      message-source="go-qr"
    />
  </section>
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
  providerBaseUrl?: string
}>(), {
  title: 'Menu URL',
  description: 'Paste an existing menu URL and get a printable QR menu.',
  urlLabel: 'Menu URL',
  urlPlaceholder: 'https://my-url.com/menu',
  ctaLabel: 'Create menu URL QR',
  qrCentreLabel: 'Food Menu',
  providerBaseUrl: 'https://go-qr.web.app',
})

const providerBaseUrl = computed(() =>
  props.providerBaseUrl.replace(/\/+$/, '')
)
const isDev = import.meta.dev
const providerModeLabel = computed(() =>
  providerBaseUrl.value.includes('localhost') ||
  providerBaseUrl.value.includes('127.0.0.1')
    ? 'local dev'
    : 'deployed'
)

const toolUrl = computed(() => {
  const query = new URLSearchParams({
    title: props.title,
    description: props.description,
    urlLabel: props.urlLabel,
    urlPlaceholder: props.urlPlaceholder,
    ctaLabel: props.ctaLabel,
    qrCentreLabel: props.qrCentreLabel,
  })

  return `${providerBaseUrl.value}/tools/url?${query}`
})
</script>
