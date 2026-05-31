<template>
  <iframe
    ref="toolFrame"
    :src="toolUrl"
    :title="title"
    class="mx-auto w-full max-w-xl border-0"
    :style="{ height: `${toolHeight}px` }"
  />
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = withDefaults(defineProps<{
  title?: string
  description?: string
  urlLabel?: string
  urlPlaceholder?: string
  ctaLabel?: string
}>(), {
  title: 'Menu URL',
  description: 'Paste an existing menu URL and get a printable QR menu.',
  urlLabel: 'Menu URL',
  urlPlaceholder: 'https://my-url.com/menu',
  ctaLabel: 'Create menu URL QR',
})

const providerBaseUrl = import.meta.dev
  ? 'http://localhost:3013'
  : 'https://go-qr.web.app'
const providerOrigin = computed(() => new URL(providerBaseUrl).origin)
const toolFrame = ref<HTMLIFrameElement | null>(null)
const toolHeight = ref(280)

const toolUrl = computed(() => {
  const query = new URLSearchParams({
    title: props.title,
    description: props.description,
    urlLabel: props.urlLabel,
    urlPlaceholder: props.urlPlaceholder,
    ctaLabel: props.ctaLabel,
  })

  return `${providerBaseUrl}/tools/url?${query}`
})

onMounted(() => {
  window.addEventListener('message', handleToolMessage)
})

onBeforeUnmount(() => {
  window.removeEventListener('message', handleToolMessage)
})

function handleToolMessage(event: MessageEvent) {
  if (event.origin !== providerOrigin.value) return
  if (event.source !== toolFrame.value?.contentWindow) return
  if (event.data?.source !== 'go-qr' || event.data?.type !== 'tool-height') return

  const height = Number(event.data.height)
  if (Number.isFinite(height) && height > 0) toolHeight.value = height
}
</script>
