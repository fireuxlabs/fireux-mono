<template>
  <SproochliProviderFrame
    :title="toolTitle"
    :description="toolDescription"
    endpoint="/api/tools/language-trigger"
  >
    <div class="space-y-4">
      <div class="rounded-[var(--radius-lg)] bg-elevated p-4">
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div class="min-w-0 space-y-1">
            <p class="text-xs font-medium uppercase tracking-wide text-muted">
              Public content
            </p>
            <h3 class="truncate text-lg font-semibold text-highlighted">
              {{ contentTitle }}
            </h3>
            <p class="text-sm leading-6 text-muted">
              {{ contentDescription }}
            </p>
          </div>

          <SproochliLanguageTrigger
            :language-options="languageOptions"
            :selected-language="selectedLanguage"
            :show-group-labels="showGroupLabels"
          />
        </div>
      </div>

      <UAlert
        color="neutral"
        variant="soft"
        title="Trigger preview"
        description="This preview changes only the URL language query. The consuming app still owns content and translation reads."
      />
    </div>
  </SproochliProviderFrame>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import SproochliLanguageTrigger from 'fireux-sproochli/runtime/components/Sproochli/LanguageTrigger.vue'
import {
  normalizeSproochliLanguage,
  resolveSproochliLanguageOptions,
  type SproochliLanguageCode,
} from 'fireux-sproochli/runtime/composables/fireux/sproochli/publicLanguage'

type ToolResponse = {
  tool: {
    title: string
    description: string
  }
}

const { data } = await useFetch<ToolResponse>('/api/tools/language-trigger')

const props = withDefaults(defineProps<{
  title?: string
  description?: string
  selectedLanguage?: string
  defaultLanguage?: string
  attachedLanguages?: string
  cachedLanguages?: string
  publicLanguages?: string
  onDemandLanguages?: string
  showGroupLabels?: boolean
  contentTitle?: string
  contentDescription?: string
}>(), {
  title: '',
  description: '',
  selectedLanguage: '',
  defaultLanguage: 'de',
  attachedLanguages: 'de, en, fr, it',
  cachedLanguages: 'bo, ar, he',
  publicLanguages: 'es, pt',
  onDemandLanguages: 'nl, pl, tr, zh, ja',
  showGroupLabels: false,
  contentTitle: 'Source document',
  contentDescription: 'A compact preview of the language trigger.',
})

const toolTitle = computed(
  () => props.title || data.value?.tool.title || 'Language trigger'
)
const toolDescription = computed(
  () => props.description || data.value?.tool.description || ''
)
const selectedLanguage = computed<SproochliLanguageCode>(() =>
  normalizeSproochliLanguage(props.selectedLanguage)
)

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
