<template>
  <main
    ref="toolRoot"
    class="bg-transparent text-default"
  >
    <GoQrToolUrl
      class="mx-auto w-full max-w-xl"
      :title="config.title"
      :description="config.description"
      :url-label="config.urlLabel"
      :url-placeholder="config.urlPlaceholder"
      :cta-label="config.ctaLabel"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

const route = useRoute()
const toolRoot = ref<HTMLElement | null>(null)
let resizeObserver: ResizeObserver | null = null

definePageMeta({
  layout: false,
})

function queryString(key: string, fallback: string) {
  const value = route.query[key]
  return typeof value === 'string' && value.trim() ? value.trim() : fallback
}

const config = computed(() => ({
  title: queryString('title', ''),
  description: queryString('description', ''),
  urlLabel: queryString('urlLabel', 'URL'),
  urlPlaceholder: queryString('urlPlaceholder', 'https://example.com'),
  ctaLabel: queryString('ctaLabel', 'Create URL QR'),
}))

onMounted(async () => {
  await nextTick()
  postToolHeight()

  if (!toolRoot.value) return
  resizeObserver = new ResizeObserver(postToolHeight)
  resizeObserver.observe(toolRoot.value)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})

function postToolHeight() {
  const height = Math.ceil(toolRoot.value?.scrollHeight || document.documentElement.scrollHeight)
  window.parent?.postMessage({
    source: 'go-qr',
    tool: 'url',
    type: 'tool-height',
    height,
  }, '*')
}
</script>
