<template>
  <UPopover
    v-if="visibleLanguageOptions.length > 1 || (props.showWhenSingleOption && onlyOriginalOption)"
    v-model:open="open"
    :content="popoverContent"
  >
    <UButton
      type="button"
      color="primary"
      variant="soft"
      size="lg"
      square
      class="h-11 w-11 rounded-full"
      :aria-label="triggerLabel"
      :title="triggerLabel"
    >
      <SproochliDefaultLanguageMark
        v-if="triggerUsesDefaultMark"
        class="size-6 shrink-0"
      />
      <span
        v-else
        class="text-xl leading-none"
        aria-hidden="true"
      >
        {{ triggerSymbol }}
      </span>
    </UButton>

    <template #content>
      <UCard class="sproochli-language-card">
        <template #header>
          <div class="space-y-1">
            <div class="text-sm font-semibold text-highlighted">
              {{ triggerCopy.heading }}
            </div>
            <p class="text-xs text-muted">
              {{ triggerCopy.description }}
            </p>
          </div>
        </template>

        <div class="max-h-[min(32rem,calc(100dvh-8rem))] space-y-2 overflow-y-auto pr-1">
          <template
            v-for="group in languageGroups"
            :key="group.key"
          >
            <div
              v-if="showAdminGroupLabels && group.key === 'cached'"
              class="px-3 text-xs font-semibold uppercase tracking-wide text-dimmed"
            >
              {{ triggerCopy.cached }}
            </div>

            <USeparator
              v-if="group.showSeparator"
            />

            <div class="space-y-1">
              <UButton
                v-for="option in group.options"
                :key="`${group.key}:${option.code || 'original'}`"
                type="button"
                :aria-current="languageOptionActive(option.code) ? 'page' : undefined"
                block
                :color="languageOptionActive(option.code) ? 'primary' : 'neutral'"
                :variant="languageOptionActive(option.code) ? 'soft' : 'ghost'"
                class="sproochli-language-option min-h-11 justify-start"
                @click="selectLanguage(option.code)"
              >
                <span class="flex min-w-0 flex-1 items-center gap-3 text-left">
                  <span
                    v-if="option.label"
                    class="inline-flex w-10 shrink-0 justify-center text-sm font-semibold text-highlighted"
                  >
                    {{ option.label }}
                  </span>
                  <span
                    class="min-w-0 whitespace-normal text-sm font-medium leading-snug"
                    :dir="languageDirection(option.code)"
                  >
                    {{ optionName(option) }}
                  </span>
                </span>

                <UIcon
                  v-if="languageOptionActive(option.code)"
                  name="i-lucide-check"
                  class="shrink-0 text-primary"
                />
              </UButton>
            </div>
          </template>
        </div>
      </UCard>
    </template>
  </UPopover>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { navigateTo, useRoute } from '#imports'
import SproochliDefaultLanguageMark from './DefaultLanguageMark.vue'
import {
  isSproochliRtlLanguage,
  normalizeSproochliLanguage,
  type SproochliLanguageCode,
  type SproochliLanguageOption,
} from '../../composables/fireux/sproochli/publicLanguage'

type LanguageGroupKey = 'cached' | 'languages'

type SproochliLanguageTriggerCopy = {
  heading: string
  description: string
  chooseLanguage: string
  currentSelection: string
  defaultSelection: string
  originalSelection: string
  cached: string
}

type LanguageGroup = {
  key: LanguageGroupKey
  showSeparator: boolean
  options: SproochliLanguageOption[]
}

const props = defineProps<{
  languageOptions: SproochliLanguageOption[]
  selectedLanguage?: SproochliLanguageCode
  defaultLanguage?: string
  showGroupLabels?: boolean
  showWhenSingleOption?: boolean
  copy?: Partial<SproochliLanguageTriggerCopy>
}>()

const route = useRoute()
const open = ref(false)
const triggerCopy = computed<SproochliLanguageTriggerCopy>(() => ({
  heading: 'Language',
  description: 'Choose how to read this content.',
  chooseLanguage: 'Choose language',
  currentSelection: 'Current selection',
  defaultSelection: 'Default',
  originalSelection: 'Original',
  cached: 'Cached',
  ...props.copy,
}))
const visibleLanguageOptions = computed(() => props.languageOptions ?? [])
const onlyOriginalOption = computed(() =>
  visibleLanguageOptions.value.length === 1 &&
  !visibleLanguageOptions.value[0]?.code
)
const showAdminGroupLabels = computed(() => props.showGroupLabels === true)
const popoverContent = {
  align: 'center' as const,
  side: 'bottom' as const,
  sideOffset: 8,
  collisionPadding: 8,
}

const languageGroups = computed<LanguageGroup[]>(() => {
  const cached = visibleLanguageOptions.value.filter(
    option => option.source !== 'on_demand'
  )
  const languages = visibleLanguageOptions.value.filter(
    option => option.source === 'on_demand'
  )

  return [
    cached.length
      ? {
          key: 'cached' as const,
          showSeparator: false,
          options: cached,
        }
      : null,
    languages.length
      ? {
          key: 'languages' as const,
          showSeparator: cached.length > 0,
          options: languages,
        }
      : null,
  ]
    .filter((group): group is LanguageGroup => Boolean(group))
})

const selectedOption = computed(
  () =>
    visibleLanguageOptions.value.find(
      (option) => option.code === (props.selectedLanguage || '')
    ) ??
    visibleLanguageOptions.value[0] ?? {
      code: '',
      label: '',
      name: 'Original',
    }
)
const normalizedDefaultLanguage = computed(() =>
  normalizeSproochliLanguage(props.defaultLanguage)
)
const pageHasMixedSource = computed(() =>
  String(props.defaultLanguage ?? '').trim().toLowerCase() === 'mixed'
)
const defaultOption = computed(() =>
  visibleLanguageOptions.value.find(
    (option) => option.code === normalizedDefaultLanguage.value
  )
)
const triggerUsesDefaultMark = computed(() =>
  !props.selectedLanguage &&
  (
    pageHasMixedSource.value ||
    !normalizedDefaultLanguage.value ||
    (props.showWhenSingleOption && onlyOriginalOption.value)
  )
)
const triggerSymbol = computed(() =>
  props.selectedLanguage
    ? selectedOption.value.label
    : defaultOption.value?.label || ''
)
const triggerCurrentSelection = computed(() => {
  if (props.selectedLanguage) return selectedOption.value.name
  if (triggerUsesDefaultMark.value) return triggerCopy.value.defaultSelection
  return defaultOption.value?.name || triggerCopy.value.originalSelection
})
const triggerLabel = computed(
  () =>
    `${triggerCopy.value.chooseLanguage}. ` +
    `${triggerCopy.value.currentSelection}: ${triggerCurrentSelection.value}.`
)
const passThroughQuery = computed(() =>
  Object.fromEntries(
    Object.entries(route.query).filter(
      ([key]) => !['sproochli', 'lang', 'language'].includes(key)
    )
  )
)

const appendQueryValue = (
  params: URLSearchParams,
  key: string,
  value: unknown
) => {
  if (Array.isArray(value)) {
    value.forEach((entry) => appendQueryValue(params, key, entry))
    return
  }
  const normalized = String(value ?? '').trim()
  if (normalized) params.append(key, normalized)
}

const languageHref = (language: SproochliLanguageCode) => {
  const params = new URLSearchParams()
  Object.entries(passThroughQuery.value).forEach(([key, value]) => {
    appendQueryValue(params, key, value)
  })
  if (language) params.set('sproochli', language)
  const query = params.toString()
  return query ? `${route.path}?${query}` : route.path
}
const languageOptionActive = (language: SproochliLanguageCode) =>
  language
    ? language === (props.selectedLanguage || '')
    : !props.selectedLanguage
const selectLanguage = async (language: SproochliLanguageCode) => {
  const href = languageHref(language)
  open.value = false
  await nextTick()
  await navigateTo(href)
}
const languageDirection = (language: SproochliLanguageCode) =>
  isSproochliRtlLanguage(language) ? 'rtl' : 'ltr'
const optionName = (option: SproochliLanguageOption) =>
  String(
    option.name ||
    option.code ||
    triggerCopy.value.originalSelection
  )
</script>

<style scoped>
.sproochli-language-card {
  width: min(20rem, calc(100vw - 1rem));
}
</style>
