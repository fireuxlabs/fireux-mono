<template>
  <UPopover
    v-if="visibleLanguageOptions.length > 1 || (props.showWhenSingleOption && onlyOriginalOption)"
    v-model:open="open"
    :content="popoverContent"
  >
    <UButton
      type="button"
      :color="triggerUsesDefaultMark ? 'primary' : 'neutral'"
      :variant="triggerUsesDefaultMark ? 'soft' : 'ghost'"
      size="lg"
      square
      :class="[
        'sproochli-language-trigger h-11 w-11 rounded-full',
        triggerUsesDefaultMark
          ? 'sproochli-language-trigger--default'
          : 'sproochli-language-trigger--emoji',
      ]"
      :aria-label="triggerLabel"
      :title="triggerLabel"
    >
      <SproochliDefaultLanguageMark
        v-if="triggerUsesDefaultMark"
        class="size-6 shrink-0"
      />
      <span
        v-else
        class="sproochli-language-trigger__emoji text-2xl leading-none"
        aria-hidden="true"
      >
        {{ triggerSymbol }}
      </span>
    </UButton>

    <template #content>
      <UCard class="sproochli-language-card">
        <template #header>
          <a
            :href="sproochliSiteHref"
            target="_blank"
            rel="noopener noreferrer"
            class="sproochli-language-brand"
            :aria-label="triggerCopy.visitSproochli"
            :title="triggerCopy.visitSproochli"
            @click="open = false"
          >
            <SproochliWordmark class="sproochli-language-brand__wordmark" />
            <span
              class="sproochli-language-brand__segue"
              aria-hidden="true"
            >
              <UIcon name="i-lucide-arrow-up-right" />
            </span>
          </a>
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
import SproochliWordmark from './Wordmark.vue'
import {
  isSproochliRtlLanguage,
  normalizeSproochliLanguage,
  type SproochliLanguageCode,
  type SproochliLanguageOption,
} from '../../composables/fireux/sproochli/publicLanguage'
import {
  sproochliProviderBaseUrl,
} from '../../composables/fireux/sproochli/provider'

type LanguageGroupKey = 'cached' | 'languages'

type SproochliLanguageTriggerCopy = {
  chooseLanguage: string
  currentSelection: string
  defaultSelection: string
  originalSelection: string
  cached: string
  visitSproochli: string
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
  brandHref?: string
  copy?: Partial<SproochliLanguageTriggerCopy>
}>()

const route = useRoute()
const open = ref(false)
const triggerCopy = computed<SproochliLanguageTriggerCopy>(() => ({
  chooseLanguage: 'Choose language',
  currentSelection: 'Current selection',
  defaultSelection: 'Default',
  originalSelection: 'Original',
  cached: 'Cached',
  visitSproochli: 'Visit Sproochli',
  ...props.copy,
}))
const sproochliSiteHref = computed(
  () => String(props.brandHref || sproochliProviderBaseUrl()).trim()
)
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
.sproochli-language-trigger--emoji {
  border-color: transparent !important;
  background: transparent !important;
  box-shadow: none !important;
  padding: 0 !important;
}

.sproochli-language-card {
  width: min(20rem, calc(100vw - 1rem));
}

.sproochli-language-brand {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: calc(var(--spacing) * 4);
  margin: calc(var(--spacing) * -1);
  padding: var(--spacing);
  border-radius: calc(var(--ui-radius) * 3);
  color: var(--ui-text-highlighted);
  text-decoration: none;
  transition:
    color 160ms ease,
    transform 160ms ease;
}

.sproochli-language-brand:hover {
  color: var(--ui-primary);
}

.sproochli-language-brand:focus-visible {
  outline: 2px solid var(--ui-primary);
  outline-offset: 3px;
}

.sproochli-language-brand__wordmark {
  width: 9rem;
  height: auto;
}

.sproochli-language-brand__segue {
  display: inline-flex;
  width: 2rem;
  height: 2rem;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border: 1px solid color-mix(in srgb, currentColor 16%, transparent);
  border-radius: 9999px;
  background: color-mix(in srgb, currentColor 6%, transparent);
  transition:
    background 160ms ease,
    transform 160ms ease;
}

.sproochli-language-brand:hover .sproochli-language-brand__segue {
  background: color-mix(in srgb, currentColor 12%, transparent);
  transform: translate(0.1rem, -0.1rem);
}

@media (prefers-reduced-motion: reduce) {
  .sproochli-language-brand,
  .sproochli-language-brand__segue {
    transition: none;
  }
}
</style>
