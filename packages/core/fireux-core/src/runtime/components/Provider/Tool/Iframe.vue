<template>
  <iframe
    ref="toolFrame"
    :src="src"
    :title="title"
    class="block w-full overflow-hidden rounded-[var(--radius-lg)]"
    :style="{ height: `${toolHeight}px` }"
    @load="requestToolHeight"
  />
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import type {
  ToolProviderAuthMessage,
  ToolProviderHeightRequestMessage,
} from '../../../types/tool-provider.types'

const props = withDefaults(defineProps<{
  src: string
  title: string
  providerOrigin: string
  messageSource?: string
  authToken?: string
  initialHeight?: number
}>(), {
  messageSource: '',
  authToken: '',
  initialHeight: 280,
})

const expectedOrigin = computed(() => new URL(props.providerOrigin).origin)
const toolFrame = ref<HTMLIFrameElement | null>(null)
const toolHeight = ref(props.initialHeight)

onMounted(async () => {
  window.addEventListener('message', handleToolMessage)
  await nextTick()
  requestToolHeight()
})

onBeforeUnmount(() => {
  window.removeEventListener('message', handleToolMessage)
})

function handleToolMessage(event: MessageEvent) {
  if (event.origin !== expectedOrigin.value) return
  if (event.source !== toolFrame.value?.contentWindow) return
  if (props.messageSource && event.data?.source !== props.messageSource) return
  if (event.data?.type === 'tool-auth-request') {
    sendToolAuth()
    return
  }

  if (event.data?.type !== 'tool-height') return

  const height = Number(event.data.height)
  if (Number.isFinite(height) && height > 0) toolHeight.value = height
}

function sendToolAuth() {
  const message = {
    source: 'fireux-tool-iframe',
    type: 'tool-auth',
    token: props.authToken || '',
  } satisfies ToolProviderAuthMessage

  toolFrame.value?.contentWindow?.postMessage(message, expectedOrigin.value)
}

function requestToolHeight() {
  const message = {
    source: 'fireux-tool-iframe',
    type: 'tool-height-request',
  } satisfies ToolProviderHeightRequestMessage

  toolFrame.value?.contentWindow?.postMessage(message, expectedOrigin.value)
}
</script>
