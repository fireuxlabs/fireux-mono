<template>
  <ProviderToolIframe
    v-if="toolUrl"
    :src="toolUrl"
    :title="toolTitle"
    :provider-origin="providerBaseUrl"
    :message-source="messageSource"
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
import { useRuntimeConfig } from '#imports'
import { computed } from 'vue'
import { useToolProviderTool } from 'fireux-core/runtime/composables/fireux/tool-provider/useToolProviderTool'

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

const runtimeConfig = useRuntimeConfig()
const text = (value: unknown) => String(value ?? '').trim()
const toolId = computed(() =>
  text(props.tool || 'doc').toLowerCase().replace(/[^a-z0-9-]+/g, '-')
)
const requestedProviderBaseUrl = computed(() => {
  const configured = text(props.providerBaseUrl).replace(/\/+$/, '')
  if (configured) return configured

  const devConfigured = import.meta.dev
    ? text((runtimeConfig.public as any)?.goQrProviderBaseUrl).replace(/\/+$/, '')
    : ''

  return devConfigured || 'https://go-qr.web.app'
})
const requestedToolTitle = computed(() =>
  text(props.title) || `Go QR ${toolId.value} tool`
)
const toolPayload = computed(() => props.payload ?? {})
const {
  providerBaseUrl,
  title: toolTitle,
  messageSource,
  toolUrl,
  toolError,
} = useToolProviderTool({
  providerBaseUrl: requestedProviderBaseUrl,
  tool: toolId,
  payload: toolPayload,
  title: requestedToolTitle,
  messageSource: 'go-qr',
})
</script>
