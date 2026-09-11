<template>
  <main ref="toolRoot" class="bg-transparent text-default">
    <GoQrProviderToolsDoc v-if="toolConfig" class="w-full" :tool="toolConfig" />
    <GoQrProviderToolsComingSoon v-else name="Doc" />
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useLiveAsyncData } from 'fireux-core/runtime/composables/fireux/firestore/useLiveAsyncData'
import { useToolProviderHeight } from 'fireux-core/runtime/composables/fireux/tool-provider/useToolProviderHeight'
import { readRouteParam } from 'fireux-core/runtime/composables/shared/useRouteParam'

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
const id = readRouteParam(route.params.id)
const toolRead = useLiveAsyncData<{ config: DocToolConfig } | null>(
  `go-qr-doc:${id}`,
  (liveFetch) =>
    id
      ? liveFetch(`/api/tools/doc/${encodeURIComponent(id)}`)
      : Promise.resolve(null)
)
const toolConfig = computed(() => toolRead.data.value?.config || null)

definePageMeta({
  layout: false,
})

useToolProviderHeight({
  provider: 'go-qr',
  root: toolRoot,
  tool: 'doc',
})
</script>
