<template>
  <UPopover
    v-if="visibleLanguageOptions.length > 1"
    v-model:open="open"
    :content="popoverContent"
  >
    <UButton
      type="button"
      color="primary"
      variant="soft"
      size="sm"
      trailing-icon="i-lucide-chevron-down"
      class="max-w-[calc(100vw-2rem)] rounded-full pl-1.5"
      :aria-label="triggerLabel"
    >
      <img
        :src="triggerBrandSrc"
        alt=""
        aria-hidden="true"
        class="h-5 w-auto shrink-0"
      >
      <span class="hidden sm:inline">Translate</span>
      <span class="truncate text-muted">{{ selectedOption.name }}</span>
    </UButton>

    <template #content>
      <UCard class="w-[calc(100vw-1rem)] sm:w-80">
        <template #header>
          <div class="space-y-1">
            <div class="text-sm font-semibold text-highlighted">
              Language
            </div>
            <p class="text-xs text-muted">
              Choose how to read this content.
            </p>
          </div>
        </template>

        <div class="max-h-[min(32rem,calc(100dvh-8rem))] space-y-2 overflow-y-auto pr-1">
          <template
            v-for="group in languageGroups"
            :key="group.key"
          >
            <USeparator
              v-if="group.showSeparator"
              :label="showAdminGroupLabels ? group.label : undefined"
            />

            <div class="space-y-1">
              <UButton
                v-for="option in group.options"
                :key="`${group.key}:${option.code || 'original'}`"
                :to="languageHref(option.code)"
                :aria-current="languageOptionActive(option.code) ? 'page' : undefined"
                block
                :color="languageOptionActive(option.code) ? 'primary' : 'neutral'"
                :variant="languageOptionActive(option.code) ? 'soft' : 'ghost'"
                class="min-h-11 justify-start"
                @click="open = false"
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
import { computed, ref } from 'vue'
import { useRoute } from '#imports'
import triggerBrandSrc from '../../assets/sproochli/translate-trigger-compact.png'
import {
  isSproochliRtlLanguage,
  type SproochliLanguageCode,
  type SproochliLanguageOption,
} from '../../composables/fireux/sproochli/publicLanguage'

type LanguageGroupKey = NonNullable<SproochliLanguageOption['source']>

type LanguageGroup = {
  key: LanguageGroupKey
  label: string
  showSeparator: boolean
  options: SproochliLanguageOption[]
}

const props = defineProps<{
  languageOptions: SproochliLanguageOption[]
  selectedLanguage?: SproochliLanguageCode
  showGroupLabels?: boolean
}>()

const route = useRoute()
const open = ref(false)
const visibleLanguageOptions = computed(() => props.languageOptions ?? [])
const showAdminGroupLabels = computed(() => props.showGroupLabels === true)
const popoverContent = {
  align: 'center' as const,
  side: 'bottom' as const,
  sideOffset: 8,
  collisionPadding: 8,
}

const groupLabel: Record<LanguageGroupKey, string> = {
  original: 'Original',
  attached: 'Attached',
  cache: 'Cached',
  public: 'Public',
  on_demand: 'On demand',
}
const groupOrder: LanguageGroupKey[] = [
  'original',
  'attached',
  'cache',
  'public',
  'on_demand',
]

const optionGroup = (option: SproochliLanguageOption): LanguageGroupKey =>
  option.source || (option.code ? 'public' : 'original')

const languageGroups = computed<LanguageGroup[]>(() => {
  const groups = new Map<LanguageGroupKey, SproochliLanguageOption[]>()

  for (const option of visibleLanguageOptions.value) {
    const key = optionGroup(option)
    groups.set(key, [...(groups.get(key) ?? []), option])
  }

  let hasRenderedGroup = false
  return groupOrder
    .map((key) => {
      const options = groups.get(key) ?? []
      if (!options.length) return null

      const group: LanguageGroup = {
        key,
        label: groupLabel[key],
        showSeparator: hasRenderedGroup,
        options,
      }
      hasRenderedGroup = true
      return group
    })
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
const triggerLabel = computed(
  () => `Translate content. Current language: ${selectedOption.value.name}.`
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
const languageDirection = (language: SproochliLanguageCode) =>
  isSproochliRtlLanguage(language) ? 'rtl' : 'ltr'
const optionName = (option: SproochliLanguageOption) =>
  String(option.name || option.code || 'Original')
</script>
