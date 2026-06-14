<template>
  <ProviderToolIframe
    v-if="toolUrl"
    :src="toolUrl"
    :title="toolTitle"
    :provider-origin="providerBaseUrl"
    message-source="go-qr"
    class="w-full"
  />
  <UAlert
    v-else-if="toolError"
    color="error"
    variant="soft"
    :title="toolTitle"
    :description="toolError"
  />
  <UPageCard
    v-else
    variant="subtle"
    class="w-full"
  >
    <p class="text-sm text-dimmed">Loading {{ toolTitle }}...</p>
  </UPageCard>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  tool?: string
  payload?: Record<string, unknown> | null
  providerBaseUrl?: string
  title?: string
}>(), {
  tool: 'doc',
  payload: null,
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
const toolPayload = computed(() => props.payload ?? {})
const toolUrl = ref('')
const toolError = ref('')
let requestId = 0

watch(
  () => ({
    providerBaseUrl: providerBaseUrl.value,
    toolId: toolId.value,
    payload: JSON.stringify(toolPayload.value),
  }),
  async ({ providerBaseUrl, toolId }) => {
    const currentRequestId = ++requestId
    toolUrl.value = ''
    toolError.value = ''

    if (!import.meta.client || !providerBaseUrl || !toolId) return

    try {
      const response = await $fetch<{
        path?: string
        toolUrl?: string
      }>(`${providerBaseUrl}/api/tools/${encodeURIComponent(toolId)}`, {
        method: 'POST',
        body: toolPayload.value,
      })

      if (currentRequestId !== requestId) return

      toolUrl.value = response.toolUrl ||
        new URL(response.path || `/tools/${toolId}`, providerBaseUrl).toString()
    } catch (error) {
      if (currentRequestId !== requestId) return

      toolError.value = error instanceof Error
        ? error.message
        : 'The Go QR tool could not be loaded.'
    }
  },
  { immediate: true }
)
</script>
