<template>
  <iframe
    ref="toolFrame"
    :src="src"
    :title="title"
    class="block w-full overflow-hidden rounded-[var(--radius-lg)]"
    :style="{ height: `${toolHeight}px` }"
    @load="onToolFrameLoad"
  />
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type {
  ToolProviderAuthMessage,
  ToolProviderHeightRequestMessage,
  ToolProviderResultMessage,
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
const emit = defineEmits<{
  'tool-result': [message: ToolProviderResultMessage]
}>()

const expectedOrigin = computed(() => new URL(props.providerOrigin).origin)
const toolFrame = ref<HTMLIFrameElement | null>(null)
const toolHeight = ref(props.initialHeight)
const toolLoaded = ref(false)

onMounted(() => {
  window.addEventListener('message', handleToolMessage)
})

onBeforeUnmount(() => {
  window.removeEventListener('message', handleToolMessage)
})

watch(
  () => props.src,
  () => {
    toolLoaded.value = false
  }
)

function onToolFrameLoad() {
  toolLoaded.value = true
  requestToolHeight()
}

function handleToolMessage(event: MessageEvent) {
  if (event.origin !== expectedOrigin.value) return
  if (event.source !== toolFrame.value?.contentWindow) return
  if (props.messageSource && event.data?.source !== props.messageSource) return
  if (event.data?.type === 'tool-auth-request') {
    sendToolAuth()
    return
  }

  if (event.data?.type === 'tool-result') {
    emit('tool-result', event.data as ToolProviderResultMessage)
    return
  }

  if (event.data?.type !== 'tool-height') return

  const height = Number(event.data.height)
  if (Number.isFinite(height) && height > 0) toolHeight.value = height
}

function sendToolAuth() {
  if (!toolLoaded.value) return

  const message = {
    source: 'fireux-tool-iframe',
    type: 'tool-auth',
    token: props.authToken || '',
  } satisfies ToolProviderAuthMessage

  postToTool(message)
}

function requestToolHeight() {
  if (!toolLoaded.value) return

  const message = {
    source: 'fireux-tool-iframe',
    type: 'tool-height-request',
  } satisfies ToolProviderHeightRequestMessage

  postToTool(message)
}

function postToTool(
  message: ToolProviderAuthMessage | ToolProviderHeightRequestMessage
) {
  try {
    toolFrame.value?.contentWindow?.postMessage(message, expectedOrigin.value)
  } catch {
    // The iframe can briefly be about:blank while the provider route loads.
  }
}
</script>
