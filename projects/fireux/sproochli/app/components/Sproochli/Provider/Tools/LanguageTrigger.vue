<template>
  <SproochliLanguageTrigger
    :language-options="languageOptions"
    :selected-language="selectedLanguage"
    :default-language="defaultLanguage"
    :show-group-labels="showGroupLabels"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SproochliLanguageTrigger from 'fireux-sproochli/runtime/components/Sproochli/LanguageTrigger.vue'
import {
  normalizeSproochliLanguage,
  resolveSproochliLanguageOptions,
  type SproochliLanguageCode,
} from 'fireux-sproochli/runtime/sproochli'

const props = withDefaults(defineProps<{
  selectedLanguage?: string
  defaultLanguage?: string
  attachedLanguages?: string
  cachedLanguages?: string
  publicLanguages?: string
  onDemandLanguages?: string
  showGroupLabels?: boolean
}>(), {
  selectedLanguage: '',
  defaultLanguage: 'de',
  attachedLanguages: 'de, en, fr, it',
  cachedLanguages: 'bo, ar, he',
  publicLanguages: 'es, pt',
  onDemandLanguages: 'nl, pl, tr, zh, ja',
  showGroupLabels: false,
})

const selectedLanguage = computed<SproochliLanguageCode>(() =>
  normalizeSproochliLanguage(props.selectedLanguage)
)
const defaultLanguage = computed(() => props.defaultLanguage)

const splitLanguages = (value: string) =>
  value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)

const languageOptions = computed(() =>
  resolveSproochliLanguageOptions({
    enabled: true,
    defaultLanguage: props.defaultLanguage,
    attachedLanguages: splitLanguages(props.attachedLanguages),
    cachedLanguages: splitLanguages(props.cachedLanguages),
    publicLanguages: splitLanguages(props.publicLanguages),
    onDemandLanguages: splitLanguages(props.onDemandLanguages),
  })
)
</script>
