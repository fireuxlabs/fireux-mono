<template>
  <ProviderToolIframe
    :src="toolUrl"
    :title="toolTitle"
    :provider-origin="providerBaseUrl"
    message-source="go-qr"
    class="w-full"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  tool?: string
  providerBaseUrl?: string
  title?: string
}>(), {
  tool: 'doc',
  providerBaseUrl: '',
  title: '',
})

const toolId = computed(() =>
  String(props.tool || 'doc').trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-')
)
const providerBaseUrl = computed(() => {
  const configured = String(props.providerBaseUrl || '').trim().replace(/\/+$/, '')
  if (configured) return configured

  return import.meta.client
    ? window.location.origin
    : 'https://go-qr.web.app'
})
const toolTitle = computed(() =>
  props.title || `Go QR ${toolId.value} tool`
)

const toolUrl = computed(() =>
  `${providerBaseUrl.value}/tools/${encodeURIComponent(toolId.value)}`
)
</script>
