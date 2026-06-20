<template>
  <main
    ref="toolRoot"
    class="bg-transparent text-default"
  >
    <GoQrProviderToolsDoc
      v-if="toolConfig"
      class="w-full"
      :tool="toolConfig"
    />
    <GoQrProviderToolsComingSoon
      v-else
      name="Doc"
    />
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToolProviderHeight } from 'fireux-core/runtime/composables/fireux/tool-provider/useToolProviderHeight'

type DocToolConfig = {
  copy: {
    title: string
    description: string
    ctaLabel: string
    loadingLabel: string
    openTargetLabel: string
  }
  upload: {
    fileLabel: string
    accept: string
    hint: string
    multiple: boolean
  }
  slug: {
    label: string
    placeholder: string
    initialValue: string
    takenMessage: string
    locked: boolean
  }
  preview: {
    baseUrl: string
    pathSuffix: string
    message: string
  }
  endpoints: {
    create: string
    availability: string
  }
}

const route = useRoute()
const toolRoot = ref<HTMLElement | null>(null)
const id = String(route.params.id ?? '').trim()
const toolConfig = id
  ? await $fetch<{ config: DocToolConfig }>(
    `/api/tools/doc/${encodeURIComponent(id)}`
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
  tool: 'doc',
})
</script>
