<template>
  <main
    ref="toolRoot"
    class="bg-transparent text-default"
  >
    <SproochliProviderToolsMenu
      class="w-full"
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
  ctaLabel: queryString('ctaLabel', 'Prepare menu translation'),
}))
</script>
