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
      :qr-centre-label="config.qrCentreLabel"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import type { ToolProviderHeightMessage } from 'fireux-core/runtime/types/tool-provider.types'

const route = useRoute()
const toolRoot = ref<HTMLElement | null>(null)
let resizeObserver: ResizeObserver | null = null

definePageMeta({
  layout: false,
})

function queryString(key: string, defaultValue: string) {
  const value = route.query[key]
  return typeof value === 'string' && value.trim() ? value.trim() : defaultValue
}

const config = computed(() => ({
  title: queryString('title', ''),
  description: queryString('description', ''),
  urlLabel: queryString('urlLabel', 'URL'),
  urlPlaceholder: queryString('urlPlaceholder', 'https://example.com'),
  ctaLabel: queryString('ctaLabel', 'Create URL QR'),
  qrCentreLabel: queryString('qrCentreLabel', ''),
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
  const message = {
    source: 'go-qr',
    tool: 'url',
    type: 'tool-height',
    height,
  } satisfies ToolProviderHeightMessage<'go-qr', 'url'>

  window.parent?.postMessage(message, '*')
}
</script>
