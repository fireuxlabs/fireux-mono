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
import { computed, ref } from 'vue'
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
  }
  slug: {
    label: string
    placeholder: string
    takenMessage: string
  }
  preview: {
    baseUrl: string
    pathSuffix: string
  }
  endpoints: {
    create: string
    availability: string
  }
}

const route = useRoute()
const toolRoot = ref<HTMLElement | null>(null)
const id = computed(() => String(route.params.id ?? '').trim())
const { data } = await useFetch<{ config: DocToolConfig }>(() =>
  `/api/tools/doc/${encodeURIComponent(id.value)}`
)
const toolConfig = computed(() => data.value?.config ?? null)

definePageMeta({
  layout: false,
})

useToolProviderHeight({
  provider: 'go-qr',
  root: toolRoot,
  tool: 'doc',
})
</script>
