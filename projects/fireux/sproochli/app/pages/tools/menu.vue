<template>
  <main
    ref="toolRoot"
    class="bg-transparent text-default"
  >
    <SproochliProviderToolsMenu
      class="w-full"
      :title="config.title"
      :description="config.description"
      :source-url="config.sourceUrl"
      :source-url-label="config.sourceUrlLabel"
      :source-url-placeholder="config.sourceUrlPlaceholder"
      :source-slug="config.sourceSlug"
      :source-slug-label="config.sourceSlugLabel"
      :document-id="config.documentId"
      :document-id-label="config.documentIdLabel"
      :source-language="config.sourceLanguage"
      :source-language-label="config.sourceLanguageLabel"
      :target-languages="config.targetLanguages"
      :target-languages-label="config.targetLanguagesLabel"
      :cta-label="config.ctaLabel"
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
  provider: 'sproochli',
  root: toolRoot,
  tool: 'menu',
})

function queryString(key: string, defaultValue: string) {
  const value = route.query[key]
  return typeof value === 'string' && value.trim() ? value.trim() : defaultValue
}

const config = computed(() => ({
  title: queryString('title', ''),
  description: queryString('description', ''),
  sourceUrl: queryString('sourceUrl', ''),
  sourceUrlLabel: queryString('sourceUrlLabel', 'Source URL'),
  sourceUrlPlaceholder: queryString(
    'sourceUrlPlaceholder',
    'https://example.com/page'
  ),
  sourceSlug: queryString('sourceSlug', ''),
  sourceSlugLabel: queryString('sourceSlugLabel', 'Source slug'),
  documentId: queryString('documentId', ''),
  documentIdLabel: queryString('documentIdLabel', 'Document'),
  sourceLanguage: queryString('sourceLanguage', 'de'),
  sourceLanguageLabel: queryString('sourceLanguageLabel', 'Source language'),
  targetLanguages: queryString('targetLanguages', 'en, fr, it'),
  targetLanguagesLabel: queryString('targetLanguagesLabel', 'Target languages'),
  ctaLabel: queryString('ctaLabel', 'Prepare menu translation'),
}))
</script>
