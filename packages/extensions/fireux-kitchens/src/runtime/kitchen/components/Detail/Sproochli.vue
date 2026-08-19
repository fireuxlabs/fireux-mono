<template>
  <ClientOnly>
    <SproochliLanguageTrigger
      :language-options="languageOptions"
      :selected-language="selectedLanguage"
      :default-language="sproochli.default_language"
      show-when-single-option
      :copy="{
        chooseLanguage: 'Choose a language for this Kitchen and its menus',
      }"
    />
  </ClientOnly>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from '#imports'
import SproochliLanguageTrigger from 'fireux-sproochli/runtime/components/Sproochli/LanguageTrigger.vue'
import {
  normalizeSproochliLanguage,
  resolveSproochliLanguageOptions,
} from 'fireux-sproochli/runtime/sproochli'
import type { KitchenDetailPresentation } from '../../models/kitchen-detail.model.ts'

const props = defineProps<{
  sproochli: NonNullable<KitchenDetailPresentation['sproochli']>
}>()

const route = useRoute()
const languageOptions = computed(() =>
  resolveSproochliLanguageOptions({
    enabled: props.sproochli.enabled,
    defaultLanguage: props.sproochli.default_language,
    onDemandLanguages: props.sproochli.requested_languages.length
      ? props.sproochli.requested_languages
      : undefined,
  })
)
const selectedLanguage = computed(() => {
  const requested = normalizeSproochliLanguage(route.query.sproochli)
  return languageOptions.value.some((option) => option.code === requested)
    ? requested
    : ''
})
</script>
