<template>
  <ClientOnly>
    <div
      v-if="selectedKitchen"
      class="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]"
    >
      <div class="space-y-4">
        <UCard>
          <template #header>
            <div class="console-card-header">
              <div class="console-card-header__title">Kitchen Identity</div>
              <p class="console-card-header__description">
                Public profile image and core restaurant settings.
              </p>
            </div>
          </template>

          <div class="flex flex-col items-center gap-3 text-center">
            <MoleculesFormsFirestoreImagePicker
              :src="imageUrl"
              :alt="name || 'Kitchen'"
              :initials="imageInitials"
              :update-function="handleImageUpload"
            />

            <div class="min-w-0">
              <div class="truncate text-base font-semibold text-highlighted">
                {{ name || 'Untitled kitchen' }}
              </div>
              <p v-if="shortAddress" class="text-sm text-dimmed">
                {{ shortAddress }}
              </p>
            </div>

            <div class="flex flex-wrap justify-center gap-2">
              <UBadge color="neutral" variant="soft">
                {{ currencySummary }}
              </UBadge>
              <UBadge v-if="slug" color="neutral" variant="subtle">
                {{ slug }}
              </UBadge>
            </div>

            <p v-if="imageUploading" class="text-xs text-gray-500">
              Uploading image…
            </p>
          </div>
        </UCard>
      </div>

      <div class="space-y-4">
        <UCard>
          <template #header>
            <button
              type="button"
              class="flex w-full items-center justify-between gap-4 text-left"
              :aria-expanded="editSections.core"
              @click="toggleEditSection('core')"
            >
              <span>
                <span class="block text-base font-semibold text-highlighted">
                  Core
                </span>
                <span class="block text-sm text-dimmed">
                  Name, slug, tagline, and currency display.
                </span>
              </span>

              <UIcon
                :name="editSections.core ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                class="size-4 shrink-0 text-muted"
              />
            </button>
          </template>

          <div v-show="editSections.core" class="grid gap-4 md:grid-cols-2">
            <div class="md:col-span-2">
              <MoleculesFormsFirestoreSimpleField
                label="Name"
                :firebase-value="name"
                placeholder="Kitchen name"
                :maxlength="120"
                :update-function="handleName"
              />
            </div>

            <div>
              <MoleculesFormsFirestoreSimpleField
                label="Short name"
                :firebase-value="shortName"
                placeholder="Short display name"
                :maxlength="80"
                :update-function="handleShortName"
              />
            </div>

            <div>
              <MoleculesFormsFirestoreSimpleField
                label="Slug"
                :firebase-value="slug"
                placeholder="luna-piccante"
                :maxlength="80"
                :validation-function="validateSlugField"
                :formatting-function="formatSlugField"
                :update-function="handleSlug"
              />
            </div>

            <div class="md:col-span-2">
              <MoleculesFormsFirestoreSimpleField
                label="Tagline"
                :firebase-value="tagline"
                placeholder="Short service tagline"
                :maxlength="120"
                :update-function="handleTagline"
              />
            </div>

            <div>
              <MoleculesFormsFirestoreSimpleField
                label="Currency"
                :firebase-value="currencyCode"
                placeholder="CHF"
                :maxlength="3"
                :formatting-function="formatCurrencyField"
                :validation-function="validateCurrencyField"
                :update-function="handleCurrencyCode"
              />
            </div>

            <UFormField
              label="Currency display"
              :description="currencyFormatHelp"
            >
              <UButtonGroup size="sm">
                <UButton
                  v-for="option in currencyFormatChoices"
                  :key="option.value"
                  color="neutral"
                  :variant="currencyFormat === option.value ? 'solid' : 'ghost'"
                  @click="handleCurrencyFormatOption(option.value)"
                >
                  {{ option.label }}
                </UButton>
              </UButtonGroup>
            </UFormField>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <button
              type="button"
              class="flex w-full items-center justify-between gap-4 text-left"
              :aria-expanded="editSections.address"
              @click="toggleEditSection('address')"
            >
              <span>
                <span class="block text-base font-semibold text-highlighted">
                  Address
                </span>
                <span class="block text-sm text-dimmed">
                  Public location display fields.
                </span>
              </span>

              <UIcon
                :name="editSections.address ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                class="size-4 shrink-0 text-muted"
              />
            </button>
          </template>

          <div v-show="editSections.address" class="grid gap-4 md:grid-cols-2">
            <div>
              <MoleculesFormsFirestoreSimpleField
                label="Short address"
                :firebase-value="shortAddress"
                placeholder="Short address"
                :maxlength="160"
                :update-function="handleShortAddress"
              />
            </div>

            <div>
              <MoleculesFormsFirestoreSimpleField
                label="Formatted address"
                :firebase-value="formattedAddress"
                placeholder="Full formatted address"
                :maxlength="240"
                :update-function="handleFormattedAddress"
              />
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <button
              type="button"
              class="flex w-full items-center justify-between gap-4 text-left"
              :aria-expanded="editSections.languages"
              @click="toggleEditSection('languages')"
            >
              <span>
                <span class="block text-base font-semibold text-highlighted">
                  Languages
                </span>
                <span class="block text-sm text-dimmed">
                  Public and kitchen-owned content languages.
                </span>
              </span>

              <UIcon
                :name="editSections.languages ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                class="size-4 shrink-0 text-muted"
              />
            </button>
          </template>

          <div v-show="editSections.languages" class="space-y-4">
            <div class="max-w-md">
              <UFormField label="Default language">
                <UInputMenu
                  v-model="languageDefaultLanguage"
                  :items="languagePickerItems"
                  value-key="value"
                  label-key="label"
                  open-on-click
                  placeholder="Pick a default language"
                  :disabled="languageSettingsSaving"
                />
              </UFormField>
            </div>

            <div class="grid gap-4 sm:grid-cols-2">
              <div
                v-for="group in languageGroups"
                :key="group.key"
                class="rounded-lg border border-default p-3"
              >
                <p class="mb-2 text-xs font-semibold text-muted">
                  {{ group.label }}
                </p>

                <div class="grid gap-2">
                  <UCheckbox
                    v-for="language in group.options"
                    :key="language.code"
                    :model-value="languageSelection[language.code] || false"
                    :label="`${language.label} (${language.code})`"
                    :disabled="languageSettingsSaving"
                    @update:model-value="setLanguageSelected(language.code, $event)"
                  />
                </div>
              </div>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <UButton
                icon="i-lucide-save"
                :loading="languageSettingsSaving"
                :disabled="!canSaveLanguageSettings"
                @click="handleLanguageSettings"
              >
                Save languages
              </UButton>

              <p
                v-if="languageSettingsStatus"
                class="text-xs"
                :class="languageSettingsError ? 'text-error' : 'text-dimmed'"
              >
                {{ languageSettingsStatus }}
              </p>
            </div>
          </div>
        </UCard>

        <UCard>
          <template #header>
            <button
              type="button"
              class="flex w-full items-center justify-between gap-4 text-left"
              :aria-expanded="editSections.openingHours"
              @click="toggleEditSection('openingHours')"
            >
              <span>
                <span class="block text-base font-semibold text-highlighted">
                  Opening Hours
                </span>
                <span class="block text-sm text-dimmed">
                  Manual kitchen opening facts and service notes.
                </span>
              </span>

              <UIcon
                :name="editSections.openingHours ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
                class="size-4 shrink-0 text-muted"
              />
            </button>
          </template>

          <div v-show="editSections.openingHours" class="space-y-4">
            <div class="max-w-md">
              <UFormField label="Timezone">
                <UInput
                  v-model="openingTimezone"
                  placeholder="Europe/Zurich"
                  :disabled="openingHoursSaving"
                />
              </UFormField>
            </div>

            <div class="space-y-2">
              <div
                v-for="weekday in weekdays"
                :key="weekday.key"
                class="grid gap-3 rounded-lg border border-default p-3 sm:grid-cols-[96px_1fr_1fr_auto]"
              >
                <div class="flex items-center text-sm font-medium text-highlighted">
                  {{ weekday.label }}
                </div>

                <UFormField label="Start">
                  <UInput
                    v-model="openingRows[weekday.key].start"
                    type="time"
                    :disabled="openingHoursSaving || openingRows[weekday.key].closed"
                  />
                </UFormField>

                <UFormField label="End">
                  <UInput
                    v-model="openingRows[weekday.key].end"
                    type="time"
                    :disabled="openingHoursSaving || openingRows[weekday.key].closed"
                  />
                </UFormField>

                <div class="flex items-end">
                  <USwitch
                    v-model="openingRows[weekday.key].closed"
                    label="Closed"
                    :disabled="openingHoursSaving"
                  />
                </div>
              </div>
            </div>

            <UFormField label="Notes">
              <UTextarea
                v-model="openingNotes"
                :rows="3"
                placeholder="Food service times to be confirmed."
                :disabled="openingHoursSaving"
              />
            </UFormField>

            <div class="flex flex-wrap items-center gap-2">
              <UButton
                icon="i-lucide-save"
                :loading="openingHoursSaving"
                :disabled="!canSaveOpeningHours"
                @click="handleOpeningHours"
              >
                Save opening hours
              </UButton>

              <p
                v-if="openingHoursStatus"
                class="text-xs"
                :class="invalidOpeningRows.length ? 'text-error' : 'text-dimmed'"
              >
                {{ openingHoursStatus }}
              </p>
            </div>
          </div>
        </UCard>
      </div>
    </div>

    <MoleculesStateCard v-else entity="kitchen identity" kind="document" loading />
  </ClientOnly>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import { useImageStorage } from 'fireux-core/runtime/composables/fireux/firebase/useImageStorage'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { validatePublicSlug as validateSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug'
import {
  FIREUX_LANGUAGE_OPTIONS,
  type FireuxLanguageOption,
} from 'fireux-translation/runtime/languages'
import { computed, reactive, ref, watch } from 'vue'
import { useKitchenConsoleIdentity } from '../../../../composables/fireux/console/kitchen/operations/useKitchenConsoleIdentity'
import { useKitchenUpdate } from '../../../../composables/fireux/firestore/kitchen/mutations/useKitchenUpdate'
import type {
  KitchenCurrencyFormat,
  KitchenLanguageSettings,
  KitchenOpeningHours,
  KitchenUpdateInput,
  Weekday,
} from '../../../../models/kitchen.model'
import {
  KITCHEN_STARTER_LANGUAGE_SETTINGS,
} from '../../../../models/kitchen.model'

const { selectedKitchen, kitchenId, rootCollection, canWrite } =
  useKitchenConsoleIdentity()
const { updateKitchen } = useKitchenUpdate()
const { uploadImage } = useImageStorage()
const toast = useToastify()

const kitchen = computed(() => selectedKitchen.value as Record<string, unknown> | null)

const name = computed(() => String(kitchen.value?.name ?? ''))
const tagline = computed(() => String(kitchen.value?.tagline ?? ''))
const currencyCode = computed(() => String(kitchen.value?.currency_code ?? 'CHF'))
const currencyFormat = computed(() => String(kitchen.value?.currency_format ?? 'dash'))
const currencyFormatLabel = computed(() => {
  if (currencyFormat.value === 'symbol') return 'Symbol'
  if (currencyFormat.value === 'code') return 'Code'
  return 'Dash'
})
const currencySummary = computed(
  () => `${currencyCode.value || 'CHF'} · ${currencyFormatLabel.value}`
)
const currencyFormatHelp = computed(() => {
  if (currencyFormat.value === 'symbol') return 'Show symbols such as $27 or £27.'
  if (currencyFormat.value === 'code') return 'Show the currency code beside the price.'
  return 'Show Luna-style prices such as 27.-.'
})
const slug = computed(() => String(kitchen.value?.slug ?? ''))
const shortName = computed(() => String(kitchen.value?.short_name ?? ''))
const shortAddress = computed(() => String(kitchen.value?.short_address ?? ''))
const formattedAddress = computed(() => String(kitchen.value?.formatted_address ?? ''))
const imageUrl = computed(() => String(kitchen.value?.image_url ?? ''))
const imageInitials = computed(() => {
  const text = String(name.value || shortName.value || '').trim()
  if (!text) return 'K'
  const parts = text.split(/\s+/).filter(Boolean)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase()
})
const imageUploading = ref(false)
const openingHoursSaving = ref(false)
const openingHoursMessage = ref('')
const languageSettingsSaving = ref(false)
const languageSettingsMessage = ref('')
const languageSettingsError = ref(false)

type OpeningHoursDayDraft = {
  closed: boolean
  start: string
  end: string
}

type EditSectionKey = 'core' | 'address' | 'languages' | 'openingHours'

const editSections = reactive<Record<EditSectionKey, boolean>>({
  core: true,
  address: false,
  languages: false,
  openingHours: false,
})

const toggleEditSection = (section: EditSectionKey) => {
  editSections[section] = !editSections[section]
}

const weekdays: Array<{ key: Weekday; label: string }> = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
]

const createClosedOpeningRows = (): Record<Weekday, OpeningHoursDayDraft> => ({
  mon: { closed: true, start: '', end: '' },
  tue: { closed: true, start: '', end: '' },
  wed: { closed: true, start: '', end: '' },
  thu: { closed: true, start: '', end: '' },
  fri: { closed: true, start: '', end: '' },
  sat: { closed: true, start: '', end: '' },
  sun: { closed: true, start: '', end: '' },
})

const openingTimezone = ref('Europe/Zurich')
const openingNotes = ref('')
const openingRows = reactive(createClosedOpeningRows())
const languageDefaultLanguage = ref(KITCHEN_STARTER_LANGUAGE_SETTINGS.default_language)
const languageSelection = reactive<Record<string, boolean>>({})
const openingHours = computed(
  () => kitchen.value?.opening_hours as KitchenOpeningHours | undefined
)
const languageSettings = computed(
  () => kitchen.value?.language_settings as KitchenLanguageSettings | undefined
)

const normalizeString = (value: unknown) => String(value ?? '').trim()
const languageOptions: FireuxLanguageOption[] = FIREUX_LANGUAGE_OPTIONS
const languageGroups = [
  {
    key: 'core',
    label: 'Misebox Core Languages',
    options: languageOptions.filter((language) => language.tier === 'core'),
  },
  {
    key: 'optional',
    label: 'Misebox Optional Languages',
    options: languageOptions.filter((language) => language.tier === 'optional'),
  },
]
const languagePickerItems = languageOptions.map((language) => ({
  label: `${language.label} (${language.code})`,
  value: language.code,
}))
const currencyFormatChoices: Array<{
  label: string
  value: KitchenCurrencyFormat
}> = [
  { label: 'Dash', value: 'dash' },
  { label: 'Symbol', value: 'symbol' },
  { label: 'Code', value: 'code' },
]
const languageByLowercase = new Map(
  languageOptions.map((language) => [language.code.toLowerCase(), language.code])
)
const normalizeLanguageCode = (value: unknown) => {
  const language = normalizeString(value).replace(/_/g, '-')
  return languageByLowercase.get(language.toLowerCase()) || language
}
const isTimeValue = (value: unknown) =>
  /^([01]\d|2[0-3]):[0-5]\d$/.test(normalizeString(value))

const invalidOpeningRows = computed(() =>
  weekdays.filter(({ key }) => {
    const row = openingRows[key]
    if (row.closed) return false
    if (!row.start && !row.end) return false
    return !isTimeValue(row.start) || !isTimeValue(row.end)
  })
)
const canSaveOpeningHours = computed(
  () =>
    canWrite.value &&
    !openingHoursSaving.value &&
    invalidOpeningRows.value.length === 0
)
const openingHoursStatus = computed(() => {
  if (openingHoursMessage.value) return openingHoursMessage.value
  if (!invalidOpeningRows.value.length) return ''
  return 'Each open day needs valid start and end times.'
})
const selectedLanguages = computed(() =>
  languageOptions
    .map((language) => language.code)
    .filter((code) => languageSelection[code])
)
const normalizedDefaultLanguage = computed(() =>
  normalizeLanguageCode(languageDefaultLanguage.value)
)
const canSaveLanguageSettings = computed(
  () =>
    canWrite.value &&
    !languageSettingsSaving.value &&
    Boolean(normalizedDefaultLanguage.value) &&
    selectedLanguages.value.includes(normalizedDefaultLanguage.value)
)
const languageSettingsStatus = computed(() => {
  if (languageSettingsMessage.value) return languageSettingsMessage.value
  if (!normalizedDefaultLanguage.value) return 'Default language is required.'
  if (!selectedLanguages.value.includes(normalizedDefaultLanguage.value)) {
    return 'Default language must be selected.'
  }
  return ''
})

const setLanguageSelected = (code: string, value: boolean | 'indeterminate') => {
  languageSelection[code] = value === true
}

watch(
  openingHours,
  (next) => {
    openingTimezone.value = normalizeString(next?.timezone) || 'Europe/Zurich'
    openingNotes.value = normalizeString(next?.notes)

    for (const { key } of weekdays) {
      const [window] = next?.weekly?.[key] ?? []
      const start = normalizeString(window?.start)
      const end = normalizeString(window?.end)

      openingRows[key].start = start
      openingRows[key].end = end
      openingRows[key].closed = !start && !end
    }
  },
  { immediate: true }
)

watch(
  languageSettings,
  (next) => {
    languageSettingsMessage.value = ''
    languageSettingsError.value = false

    const existingSupportedLanguages =
      Array.isArray(next?.supported_languages)
        ? next.supported_languages
        : KITCHEN_STARTER_LANGUAGE_SETTINGS.supported_languages
    const supportedLanguages = existingSupportedLanguages
      .map((language) => normalizeLanguageCode(language))
      .filter(Boolean)

    const defaultLanguage =
      normalizeLanguageCode(next?.default_language) ||
      KITCHEN_STARTER_LANGUAGE_SETTINGS.default_language

    languageDefaultLanguage.value = defaultLanguage

    for (const language of languageOptions) {
      languageSelection[language.code] = supportedLanguages.includes(language.code)
    }

    if (!languageSelection[defaultLanguage]) {
      languageSelection[defaultLanguage] = true
    }
  },
  { immediate: true }
)

const cacheBust = (url: string) => {
  const stamp = Date.now().toString(36)
  return url.includes('?') ? `${url}&v=${stamp}` : `${url}?v=${stamp}`
}

const updateIdentityField = async (
  patch: KitchenUpdateInput,
  successTitle: string,
  failTitle: string
) => {
  if (!canWrite.value) {
    throw new Error('This kitchen is read-only.')
  }

  const id = kitchenId.value
  if (!id) {
    throw new Error('No kitchen selected.')
  }

  if (rootCollection.value !== 'kitchens') {
    throw new Error('Kitchen identity edits are only available for root kitchens.')
  }

  try {
    await updateKitchen(id, patch)
    toast.add({ title: successTitle, icon: 'i-heroicons-check-circle' })
    return 'success'
  } catch (error) {
    const description = error instanceof Error ? error.message : 'Please try again.'
    toast.add({
      title: failTitle,
      description,
      color: 'amber',
      icon: 'i-heroicons-exclamation-triangle',
    })
    throw error
  }
}

const handleName = async (value: string) =>
  updateIdentityField({ name: value }, 'Name updated', 'Failed to update name')

const handleShortName = async (value: string) =>
  updateIdentityField(
    { short_name: value },
    'Short name updated',
    'Failed to update short name'
  )

const handleTagline = async (value: string) =>
  updateIdentityField(
    { tagline: value },
    'Tagline updated',
    'Failed to update tagline'
  )

const formatCurrencyField = (value: string) =>
  normalizeString(value).toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3)

const validateCurrencyField = (value: string) => {
  const code = formatCurrencyField(value)
  const isValid = /^[A-Z]{3}$/.test(code)

  return {
    isValid,
    message: isValid ? '' : 'Use a 3-letter currency code.',
  }
}

const handleCurrencyCode = async (value: string) =>
  updateIdentityField(
    { currency_code: formatCurrencyField(value) || 'CHF' },
    'Currency updated',
    'Failed to update currency'
  )

const currencyFormatOptions = new Set<KitchenCurrencyFormat>(['dash', 'symbol', 'code'])
const formatCurrencyFormatField = (value: string) =>
  normalizeString(value).toLowerCase().replace(/[^a-z]/g, '').slice(0, 12)

const handleCurrencyFormat = async (value: string) => {
  const format = formatCurrencyFormatField(value) as KitchenCurrencyFormat

  return updateIdentityField(
    { currency_format: currencyFormatOptions.has(format) ? format : 'dash' },
    'Currency display updated',
    'Failed to update currency display'
  )
}

const handleCurrencyFormatOption = async (value: KitchenCurrencyFormat) =>
  handleCurrencyFormat(value)

const formatSlugField = (value: string) => normalizeSlug(value, { maxLength: 80 })

const validateSlugField = (value: string) => {
  const validation = validateSlug(formatSlugField(value), {
    label: 'Kitchen slug',
    namespace: 'kitchens',
    reservedScope: 'root',
    maxLength: 80,
  })

  return {
    isValid: validation.isValid,
    message: validation.message,
  }
}

const handleSlug = async (value: string) =>
  updateIdentityField(
    { slug: formatSlugField(value) },
    'Slug updated',
    'Failed to update slug'
  )

const handleShortAddress = async (value: string) =>
  updateIdentityField(
    { short_address: value },
    'Short address updated',
    'Failed to update short address'
  )

const handleFormattedAddress = async (value: string) =>
  updateIdentityField(
    { formatted_address: value },
    'Formatted address updated',
    'Failed to update formatted address'
  )

const handleOpeningHours = async () => {
  if (!canSaveOpeningHours.value) return

  openingHoursSaving.value = true
  openingHoursMessage.value = ''

  try {
    const weekly: KitchenOpeningHours['weekly'] = {}

    for (const { key } of weekdays) {
      const row = openingRows[key]
      if (row.closed || !row.start || !row.end) continue

      weekly[key] = [
        {
          start: normalizeString(row.start),
          end: normalizeString(row.end),
        },
      ]
    }

    const notes = normalizeString(openingNotes.value)
    const nextOpeningHours: KitchenOpeningHours = {
      timezone: normalizeString(openingTimezone.value) || 'Europe/Zurich',
      weekly,
    }

    if (notes) {
      nextOpeningHours.notes = notes
    }

    await updateIdentityField(
      { opening_hours: nextOpeningHours },
      'Opening hours updated',
      'Failed to update opening hours'
    )
    openingHoursMessage.value = 'Opening hours saved.'
  } finally {
    openingHoursSaving.value = false
  }
}

const handleLanguageSettings = async () => {
  if (!canSaveLanguageSettings.value) {
    languageSettingsError.value = true
    languageSettingsMessage.value = languageSettingsStatus.value
    return
  }

  languageSettingsSaving.value = true
  languageSettingsMessage.value = ''
  languageSettingsError.value = false

  try {
    const nextLanguageSettings: KitchenLanguageSettings = {
      default_language: normalizedDefaultLanguage.value,
      supported_languages: selectedLanguages.value,
    }

    await updateIdentityField(
      { language_settings: nextLanguageSettings },
      'Languages updated',
      'Failed to update languages'
    )
    languageSettingsMessage.value = 'Languages saved.'
  } catch {
    languageSettingsError.value = true
  } finally {
    languageSettingsSaving.value = false
  }
}

const handleImageUpload = async (file: File) => {
  if (!canWrite.value) {
    throw new Error('This kitchen is read-only.')
  }

  const id = kitchenId.value
  if (!id) {
    throw new Error('No kitchen selected.')
  }

  imageUploading.value = true
  try {
    const url = await uploadImage(`kitchens/${id}/image/current`, file)
    await updateIdentityField(
      { image_url: cacheBust(url) },
      'Kitchen image updated',
      'Failed to update kitchen image'
    )
  } finally {
    imageUploading.value = false
  }
}
</script>
