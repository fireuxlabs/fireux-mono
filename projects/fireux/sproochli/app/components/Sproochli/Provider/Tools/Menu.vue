<template>
  <SproochliProviderFrame
    :title="toolTitle"
    :description="toolDescription"
    endpoint="/api/tools/menu"
  >
    <form
      class="space-y-4"
      @submit.prevent="prepareHandoff"
    >
      <UFormField :label="sourceUrlLabel">
        <UInput
          v-model="sourceUrlInput"
          :placeholder="sourceUrlPlaceholder"
          class="w-full"
        />
      </UFormField>

      <div class="grid gap-3 sm:grid-cols-2">
        <UFormField :label="sourceSlugLabel">
          <UInput
            v-model="sourceSlugInput"
            placeholder="source-slug"
            class="w-full"
          />
        </UFormField>

        <UFormField :label="documentIdLabel">
          <UInput
            v-model="documentIdInput"
            placeholder="document-id"
            class="w-full"
          />
        </UFormField>
      </div>

      <div class="grid gap-3 sm:grid-cols-2">
        <UFormField :label="sourceLanguageLabel">
          <UInput
            v-model="sourceLanguageInput"
            placeholder="de"
            class="w-full"
          />
        </UFormField>

        <UFormField :label="targetLanguagesLabel">
          <UInput
            v-model="targetLanguagesInput"
            placeholder="en, fr, it"
            class="w-full"
          />
        </UFormField>
      </div>

      <UButton
        type="submit"
        icon="i-lucide-languages"
        block
        :disabled="!canPrepare"
      >
        {{ ctaLabel }}
      </UButton>
    </form>

    <UAlert
      color="primary"
      variant="soft"
      title="Provider API ready"
      description="Sproochli generates translations. The consuming app still owns reading and saving its menu records."
    />

    <UCard
      v-if="handoff"
      variant="soft"
    >
      <template #header>
        <div class="text-sm font-semibold text-highlighted">
          Translation request
        </div>
      </template>
      <pre class="overflow-auto rounded-md bg-muted p-3 text-xs leading-5">{{ handoff }}</pre>
    </UCard>
  </SproochliProviderFrame>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type ToolResponse = {
  tool: {
    title: string
    description: string
  }
}

const { data } = await useFetch<ToolResponse>('/api/tools/menu')

const props = withDefaults(defineProps<{
  title?: string
  description?: string
  sourceUrl?: string
  sourceUrlLabel?: string
  sourceUrlPlaceholder?: string
  sourceSlug?: string
  sourceSlugLabel?: string
  documentId?: string
  documentIdLabel?: string
  sourceLanguage?: string
  sourceLanguageLabel?: string
  targetLanguages?: string
  targetLanguagesLabel?: string
  ctaLabel?: string
}>(), {
  title: '',
  description: '',
  sourceUrl: '',
  sourceUrlLabel: 'Source URL',
  sourceUrlPlaceholder: 'https://example.com/page',
  sourceSlug: '',
  sourceSlugLabel: 'Source slug',
  documentId: '',
  documentIdLabel: 'Document',
  sourceLanguage: 'de',
  sourceLanguageLabel: 'Source language',
  targetLanguages: 'en, fr, it',
  targetLanguagesLabel: 'Target languages',
  ctaLabel: 'Prepare menu translation',
})

const sourceUrlInput = ref(props.sourceUrl)
const sourceSlugInput = ref(props.sourceSlug)
const documentIdInput = ref(props.documentId)
const sourceLanguageInput = ref(props.sourceLanguage)
const targetLanguagesInput = ref(props.targetLanguages)
const handoff = ref('')

const text = (value: unknown) => String(value ?? '').trim()
const toolTitle = computed(() => props.title || data.value?.tool.title || 'Menu translation')
const toolDescription = computed(() =>
  props.description || data.value?.tool.description || ''
)
const targetLanguages = computed(() =>
  targetLanguagesInput.value
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
)
const canPrepare = computed(() =>
  Boolean(text(sourceUrlInput.value) && targetLanguages.value.length)
)

function prepareHandoff() {
  if (!canPrepare.value) return

  handoff.value = JSON.stringify(
    {
      kind: 'sproochli-menu-translation-request',
      sourceUrl: text(sourceUrlInput.value),
      sourceSlug: text(sourceSlugInput.value),
      documentId: text(documentIdInput.value),
      sourceLanguage: text(sourceLanguageInput.value).toLowerCase() || 'de',
      targetLanguages: targetLanguages.value,
      status: 'ready-for-provider-translation',
    },
    null,
    2
  )
}
</script>
