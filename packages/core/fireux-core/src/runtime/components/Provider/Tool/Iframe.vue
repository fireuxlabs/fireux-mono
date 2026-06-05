<template>
  <iframe
    ref="toolFrame"
    :src="src"
    :title="title"
    class="mx-auto w-full max-w-xl border-0"
    :style="{ height: `${toolHeight}px` }"
  />
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = withDefaults(defineProps<{
  src: string
  title: string
  providerOrigin: string
  messageSource?: string
  initialHeight?: number
}>(), {
  messageSource: '',
  initialHeight: 280,
})

const expectedOrigin = computed(() => new URL(props.providerOrigin).origin)
const toolFrame = ref<HTMLIFrameElement | null>(null)
const toolHeight = ref(props.initialHeight)

onMounted(() => {
  window.addEventListener('message', handleToolMessage)
})

onBeforeUnmount(() => {
  window.removeEventListener('message', handleToolMessage)
})

function handleToolMessage(event: MessageEvent) {
  if (event.origin !== expectedOrigin.value) return
  if (event.source !== toolFrame.value?.contentWindow) return
  if (props.messageSource && event.data?.source !== props.messageSource) return
  if (event.data?.type !== 'tool-height') return

  const height = Number(event.data.height)
  if (Number.isFinite(height) && height > 0) toolHeight.value = height
}
</script>
