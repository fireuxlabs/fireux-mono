<template>
  <main
    ref="toolRoot"
    class="bg-transparent text-default"
  >
    <GoQrProviderToolsUrl
      class="w-full"
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
import { computed, ref } from 'vue'
import { useToolProviderHeight } from 'fireux-core/runtime/composables/fireux/tool-provider/useToolProviderHeight'

const route = useRoute()
const toolRoot = ref<HTMLElement | null>(null)

definePageMeta({
  layout: false,
})

useToolProviderHeight({
  provider: 'go-qr',
  root: toolRoot,
  tool: 'url',
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
</script>
