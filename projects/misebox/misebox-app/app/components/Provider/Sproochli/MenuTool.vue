<template>
  <ProviderToolIframe
    :src="toolUrl"
    :title="title"
    :provider-origin="providerBaseUrl"
    message-source="sproochli"
    :initial-height="560"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

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
  readEndpoint?: string
  saveEndpoint?: string
  ctaLabel?: string
}>(), {
  title: 'Menu translation',
  description: 'Prepare a Sproochli translation handoff for a Misebox public menu.',
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
  readEndpoint: '',
  saveEndpoint: '',
  ctaLabel: 'Prepare translation handoff',
})

const providerBaseUrl = import.meta.dev
  ? 'http://localhost:3011'
  : 'https://sproochli.web.app'

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
    readEndpoint: props.readEndpoint,
    saveEndpoint: props.saveEndpoint,
    ctaLabel: props.ctaLabel,
  })

  return `${providerBaseUrl}/tools/menu?${query}`
})
</script>
