<template>
  <main
    ref="toolRoot"
    class="inline-flex bg-transparent p-2 text-default"
  >
    <SproochliProviderToolsLanguageTrigger
      class="w-full"
      :selected-language="config.selectedLanguage"
      :default-language="config.defaultLanguage"
      :attached-languages="config.attachedLanguages"
      :cached-languages="config.cachedLanguages"
      :public-languages="config.publicLanguages"
      :on-demand-languages="config.onDemandLanguages"
      :show-group-labels="config.showGroupLabels"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from '#imports'
import { useToolProviderHeight } from 'fireux-core/runtime/composables/fireux/tool-provider/useToolProviderHeight'

const route = useRoute()
const toolRoot = ref<HTMLElement | null>(null)

definePageMeta({
  layout: false,
})

useToolProviderHeight({
  provider: 'sproochli',
  root: toolRoot,
  tool: 'language-trigger',
})

function queryString(key: string, defaultValue: string) {
  const value = route.query[key]
  return typeof value === 'string' && value.trim() ? value.trim() : defaultValue
}

function queryBoolean(key: string, defaultValue: boolean) {
  const value = route.query[key]
  if (value === 'true') return true
  if (value === 'false') return false
  return defaultValue
}

const config = computed(() => ({
  selectedLanguage: queryString(
    'selectedLanguage',
    queryString('sproochli', '')
  ),
  defaultLanguage: queryString('defaultLanguage', 'de'),
  attachedLanguages: queryString('attachedLanguages', 'de, en, fr, it'),
  cachedLanguages: queryString('cachedLanguages', 'bo, ar, he'),
  publicLanguages: queryString('publicLanguages', 'es, pt'),
  onDemandLanguages: queryString('onDemandLanguages', 'nl, pl, tr, zh, ja'),
  showGroupLabels: queryBoolean('showGroupLabels', false),
}))
</script>
