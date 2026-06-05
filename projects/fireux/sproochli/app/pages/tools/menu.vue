<template>
  <main
    ref="toolRoot"
    class="bg-transparent text-default"
  >
    <SproochliToolMenu
      class="mx-auto w-full max-w-xl"
      :title="config.title"
      :description="config.description"
      :public-menu-url="config.publicMenuUrl"
      :public-menu-url-label="config.publicMenuUrlLabel"
      :public-menu-url-placeholder="config.publicMenuUrlPlaceholder"
      :kitchen-slug="config.kitchenSlug"
      :kitchen-slug-label="config.kitchenSlugLabel"
      :menu-id="config.menuId"
      :menu-id-label="config.menuIdLabel"
      :source-language="config.sourceLanguage"
      :source-language-label="config.sourceLanguageLabel"
      :target-languages="config.targetLanguages"
      :target-languages-label="config.targetLanguagesLabel"
      :read-endpoint="config.readEndpoint"
      :save-endpoint="config.saveEndpoint"
      :cta-label="config.ctaLabel"
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
  publicMenuUrl: queryString('publicMenuUrl', ''),
  publicMenuUrlLabel: queryString('publicMenuUrlLabel', 'Public menu URL'),
  publicMenuUrlPlaceholder: queryString(
    'publicMenuUrlPlaceholder',
    'https://misebox.app/kitchens/la-tapberne/menus/main'
  ),
  kitchenSlug: queryString('kitchenSlug', ''),
  kitchenSlugLabel: queryString('kitchenSlugLabel', 'Kitchen'),
  menuId: queryString('menuId', ''),
  menuIdLabel: queryString('menuIdLabel', 'Menu'),
  sourceLanguage: queryString('sourceLanguage', 'de'),
  sourceLanguageLabel: queryString('sourceLanguageLabel', 'Source language'),
  targetLanguages: queryString('targetLanguages', 'en, fr, it'),
  targetLanguagesLabel: queryString('targetLanguagesLabel', 'Target languages'),
  readEndpoint: queryString('readEndpoint', ''),
  saveEndpoint: queryString('saveEndpoint', ''),
  ctaLabel: queryString('ctaLabel', 'Prepare translation handoff'),
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
    source: 'sproochli',
    tool: 'menu',
    type: 'tool-height',
    height,
  } satisfies ToolProviderHeightMessage<'sproochli', 'menu'>

  window.parent?.postMessage(message, '*')
}
</script>
