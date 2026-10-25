<template>
  <FireProviderToolIframe
    :src="toolUrl"
    :title="title"
    :provider-origin="providerBaseUrl"
    message-source="sproochli"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { sproochliProviderBaseUrl } from 'fireux-sproochli/runtime/sproochli'

const props = withDefaults(defineProps<{
  title?: string
  description?: string
  publicMenuUrl?: string
  publicMenuUrlLabel?: string
  publicMenuUrlPlaceholder?: string
  kitchenSlug?: string
  kitchenSlugLabel?: string
  menuId?: string
  menuIdLabel?: string
  sourceLanguage?: string
  sourceLanguageLabel?: string
  targetLanguages?: string
  targetLanguagesLabel?: string
  ctaLabel?: string
}>(), {
  title: 'Menu translation',
  description: 'Translate menu copy with the Sproochli provider.',
  publicMenuUrl: '',
  publicMenuUrlLabel: 'Public menu URL',
  publicMenuUrlPlaceholder: 'https://misebox.app/kitchens/la-tapberne/menus/main',
  kitchenSlug: '',
  kitchenSlugLabel: 'Kitchen',
  menuId: '',
  menuIdLabel: 'Menu',
  sourceLanguage: 'de',
  sourceLanguageLabel: 'Source language',
  targetLanguages: 'en, fr, it',
  targetLanguagesLabel: 'Target languages',
  ctaLabel: 'Prepare menu translation',
})

const providerBaseUrl = sproochliProviderBaseUrl()

const toolUrl = computed(() => {
  const query = new URLSearchParams({
    title: props.title,
    description: props.description,
    publicMenuUrl: props.publicMenuUrl,
    publicMenuUrlLabel: props.publicMenuUrlLabel,
    publicMenuUrlPlaceholder: props.publicMenuUrlPlaceholder,
    kitchenSlug: props.kitchenSlug,
    kitchenSlugLabel: props.kitchenSlugLabel,
    menuId: props.menuId,
    menuIdLabel: props.menuIdLabel,
    sourceLanguage: props.sourceLanguage,
    sourceLanguageLabel: props.sourceLanguageLabel,
    targetLanguages: props.targetLanguages,
    targetLanguagesLabel: props.targetLanguagesLabel,
    ctaLabel: props.ctaLabel,
  })

  return `${providerBaseUrl}/tools/menu?${query}`
})
</script>
