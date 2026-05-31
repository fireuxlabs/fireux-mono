<template>
  <iframe
    ref="toolFrame"
    :src="toolUrl"
    title="Go QR menu URL tool"
    class="mx-auto w-full max-w-xl border-0"
    :style="{ height: `${toolHeight}px` }"
  />
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

definePageMeta({
  layout: 'landing',
})

const providerBaseUrl = import.meta.dev
  ? 'http://localhost:3013'
  : 'https://go-qr.web.app'
const providerOrigin = computed(() => new URL(providerBaseUrl).origin)
const toolFrame = ref<HTMLIFrameElement | null>(null)
const toolHeight = ref(280)

const consumer = {
  title: 'Menu URL',
  description: 'Paste an existing menu URL and get a printable QR menu.',
  urlLabel: 'Menu URL',
  urlPlaceholder: 'https://www.baeren-ringgenberg.ch/index.php/de/hotel/restaurant-de',
  ctaLabel: 'Create menu URL QR',
}

const toolUrl = computed(() => {
  const query = new URLSearchParams({
    title: consumer.title,
    description: consumer.description,
    urlLabel: consumer.urlLabel,
    urlPlaceholder: consumer.urlPlaceholder,
    ctaLabel: consumer.ctaLabel,
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
  if (Number.isFinite(height) && height > 0) {
    toolHeight.value = height
  }
}

useSeoMeta({
  title: 'Menu URL QR',
  ogTitle: 'Menu URL QR',
  twitterTitle: 'Menu URL QR',
  description: consumer.description,
  ogDescription: consumer.description,
  twitterDescription: consumer.description,
})
</script>
