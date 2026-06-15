<template>
  <main
    ref="toolRoot"
    class="bg-transparent text-default"
  >
    <GoQrProviderToolsText
      v-if="toolConfig"
      class="w-full"
      :tool="toolConfig"
    />
    <GoQrProviderToolsComingSoon
      v-else
      name="Text"
    />
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToolProviderHeight } from 'fireux-core/runtime/composables/fireux/tool-provider/useToolProviderHeight'

type TextToolConfig = {
  copy: {
    title: string
    description: string
  }
  content: {
    message: string
  }
}

const route = useRoute()
const toolRoot = ref<HTMLElement | null>(null)
const id = String(route.params.id ?? '').trim()
const toolConfig = id
  ? await $fetch<{ config: TextToolConfig }>(
    `/api/tools/text/${encodeURIComponent(id)}`
  )
    .then((response) => response.config)
    .catch(() => null)
  : null

definePageMeta({
  layout: false,
})

useToolProviderHeight({
  provider: 'go-qr',
  root: toolRoot,
  tool: 'text',
})
</script>
