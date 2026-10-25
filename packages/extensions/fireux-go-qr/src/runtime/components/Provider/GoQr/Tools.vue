<template>
  <section class="space-y-2">
    <div
      v-if="isDev && !bare"
      class="flex justify-end"
    >
      <UBadge
        color="neutral"
        variant="soft"
        size="sm"
      >
        Go QR: {{ providerModeLabel }}
      </UBadge>
    </div>

    <FireProviderToolIframe
      v-if="toolUrl"
      :src="toolUrl"
      :title="toolTitle"
      :provider-origin="providerBaseUrl"
      :auth-token="resolvedAuthToken"
      :message-source="messageSource"
      @tool-result="emit('tool-result', $event)"
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
    >
      <p class="text-sm text-dimmed">Loading {{ toolTitle }}...</p>
    </UPageCard>
  </section>
</template>

<script setup lang="ts">
import { useRuntimeConfig } from '#imports'
import { computed } from 'vue'
import { useToolProviderTool } from 'fireux-core/runtime/composables/fireux/tool-provider/useToolProviderTool'

const props = withDefaults(defineProps<{
  tool?: string
  payload?: Record<string, unknown> | null
  title?: string
  authToken?: string
  providerBaseUrl?: string
  bare?: boolean
}>(), {
  tool: 'doc',
  payload: null,
  title: '',
  authToken: '',
  providerBaseUrl: '',
  bare: false,
})
const emit = defineEmits<{
  'tool-result': [message: Record<string, unknown>]
}>()

const runtimeConfig = useRuntimeConfig()
const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}

const requestedProviderBaseUrl = computed(() =>
  (
    text(props.providerBaseUrl) ||
    text((runtimeConfig.public as any)?.fireux?.goQr?.providerBaseUrl) ||
    'https://go-qr.web.app'
  ).replace(/\/+$/, '')
)
const toolId = computed(() =>
  text(props.tool || 'doc').toLowerCase().replace(/[^a-z0-9-]+/g, '-')
)
const payload = computed(() => props.payload ?? {})
const payloadTitle = computed(() => text(record(payload.value.copy).title))
const requestedTitle = computed(() =>
  text(props.title) || payloadTitle.value || `Go QR ${toolId.value} tool`
)
const requestedAuthToken = computed(() => text(props.authToken))
const isDev = import.meta.dev

const {
  providerBaseUrl,
  title: toolTitle,
  authToken: resolvedAuthToken,
  messageSource,
  providerModeLabel,
  toolUrl,
  toolError,
} = useToolProviderTool({
  providerBaseUrl: requestedProviderBaseUrl,
  tool: toolId,
  payload,
  title: requestedTitle,
  authToken: requestedAuthToken,
  messageSource: 'go-qr',
})
</script>
