<template>
  <ClientOnly>
    <div v-if="selectedKitchen" class="space-y-6">
      <UCard variant="subtle">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div class="flex items-start gap-3">
            <UIcon name="i-lucide-palette" class="mt-1 size-5 shrink-0 text-muted" />
            <div>
              <p class="text-xs font-medium uppercase tracking-wide text-muted">
                Kitchen theme
              </p>
              <h2 class="text-2xl font-semibold text-highlighted">
                Menu Display
              </h2>
              <p class="text-sm text-dimmed">
                Price display and public menu colours for this kitchen.
              </p>
            </div>
          </div>

          <UPopover>
            <UButton
              size="sm"
              color="neutral"
              variant="soft"
              icon="i-lucide-palette"
            >
              Presets
            </UButton>

            <template #content>
              <div class="w-56 space-y-3 p-3">
                <div>
                  <p class="text-sm font-medium text-highlighted">
                    Nuxt UI accents
                  </p>
                  <p class="text-xs text-dimmed">
                    Apply a preset to menu primary and secondary colours.
                  </p>
                </div>

                <div class="grid grid-cols-6 gap-2">
                  <button
                    v-for="preset in colorPresets"
                    :key="preset.name"
                    type="button"
                    class="size-7 rounded-full border border-default ring-offset-2 transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary"
                    :style="{ backgroundColor: preset.primary }"
                    :aria-label="`Use ${preset.name} preset`"
                    @click="handleColorPreset(preset)"
                  />
                </div>
              </div>
            </template>
          </UPopover>
        </div>
      </UCard>

      <div class="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div class="space-y-4">
          <UCard>
            <template #header>
              <div class="flex items-start gap-3">
                <UIcon name="i-lucide-coins" class="mt-1 size-5 shrink-0 text-muted" />
                <div>
                  <div class="text-base font-semibold text-highlighted">
                    Price Display
                  </div>
                  <p class="text-sm text-dimmed">
                    Controls how prices appear on public menus.
                  </p>
                </div>
              </div>
            </template>

            <div class="grid gap-4 md:grid-cols-3">
              <UFormField
                label="Currency"
                description="Default currency is owned by the linked Place."
              >
                <div class="rounded-md border border-default px-3 py-2 text-sm font-medium text-highlighted">
                  {{ currencyCode }}
                </div>
              </UFormField>

              <UFormField
                label="Currency display"
                :description="currencyFormatHelp"
              >
                <UFieldGroup size="sm">
                  <UButton
                    v-for="option in currencyFormatChoices"
                    :key="option.value"
                    color="neutral"
                    :variant="currencyFormat === option.value ? 'solid' : 'ghost'"
                    @click="handleCurrencyFormatOption(option.value)"
                  >
                    {{ option.label }}
                  </UButton>
                </UFieldGroup>
              </UFormField>

              <UFormField
                label="Show currency"
                description="Toggle the currency marker on menu prices."
              >
                <UFieldGroup size="sm">
                  <UButton
                    color="neutral"
                    :variant="showCurrency ? 'solid' : 'ghost'"
                    @click="handleShowCurrency(true)"
                  >
                    Show
                  </UButton>
                  <UButton
                    color="neutral"
                    :variant="!showCurrency ? 'solid' : 'ghost'"
                    @click="handleShowCurrency(false)"
                  >
                    Hide
                  </UButton>
                </UFieldGroup>
              </UFormField>
            </div>
          </UCard>

          <UCard>
            <template #header>
              <div class="flex items-start gap-3">
                <UIcon name="i-lucide-swatch-book" class="mt-1 size-5 shrink-0 text-muted" />
                <div>
                  <div class="text-base font-semibold text-highlighted">
                    Colours
                  </div>
                  <p class="text-sm text-dimmed">
                    Shared page style tokens used by the public menu.
                  </p>
                </div>
              </div>
            </template>

            <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <MoleculesFormsFirestoreSimpleField
                v-for="field in styleFields"
                :key="field.key"
                :label="field.label"
                :firebase-value="field.value"
                :placeholder="field.placeholder"
                :maxlength="7"
                :validation-function="validateColorField"
                :formatting-function="formatColorField"
                :update-function="(value) => handleStyleField(field.key, value)"
              />
            </div>
          </UCard>

          <UCard>
            <ConsoleKitchenIdentityMenuPreview />
          </UCard>
        </div>

        <aside class="space-y-4">
          <UCard>
            <template #header>
              <div class="flex items-start gap-3">
                <UIcon name="i-lucide-eye" class="mt-1 size-5 shrink-0 text-muted" />
                <div>
                  <div class="text-base font-semibold text-highlighted">
                    Current Tokens
                  </div>
                  <p class="text-sm text-dimmed">
                    Quick read of the stored menu theme.
                  </p>
                </div>
              </div>
            </template>

            <div class="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              <div
                v-for="swatch in styleSwatches"
                :key="swatch.label"
                class="min-w-0 rounded-lg border border-default bg-muted p-2"
              >
                <div
                  class="mb-2 h-7 rounded-md border border-default"
                  :style="{ backgroundColor: swatch.value || '#f3f4f6' }"
                />
                <p class="truncate text-[11px] font-medium text-muted">
                  {{ swatch.label }}
                </p>
                <p class="truncate text-xs text-highlighted">
                  {{ swatch.value || 'Unset' }}
                </p>
              </div>
            </div>
          </UCard>
        </aside>
      </div>
    </div>

    <MoleculesStateCard v-else entity="kitchen theme" kind="document" loading />
  </ClientOnly>
</template>

<script setup lang="ts">
import { useToastify } from 'fireux-core/runtime/composables/fireux/app/ui/useToastify'
import type { CurrencyDisplayFormat } from 'fireux-core/runtime/models/core/money.model'
import type { PageStyle } from 'fireux-core/runtime/models/core/style.model'
import { computed } from 'vue'
import { useKitchenConsoleIdentity } from '../../../../composables/fireux/console/kitchen/operations/useKitchenConsoleIdentity'
import { useKitchenUpdate } from '../../../../composables/fireux/firestore/kitchen/mutations/useKitchenUpdate'
import type { KitchenUpdateInput } from '../../../../models/kitchen.model'

type ColorPreset = {
  name: string
  primary: string
  secondary: string
}

const { selectedKitchen, kitchenId, canWrite } = useKitchenConsoleIdentity()
const { updateKitchen } = useKitchenUpdate()
const toast = useToastify()

const kitchen = computed(() => selectedKitchen.value as Record<string, unknown> | null)
const normalizeString = (value: unknown) => String(value ?? '').trim()
const currencyCode = computed(() =>
  String(kitchen.value?.default_currency_code ?? 'CHF')
)
const currencyFormat = computed(() => String(kitchen.value?.menu_currency_format ?? 'dash'))
const showCurrency = computed(() => kitchen.value?.menu_show_currency !== false)
const currencyFormatHelp = computed(() => {
  if (currencyFormat.value === 'symbol') return 'Show symbols such as $27 or £27.'
  if (currencyFormat.value === 'code') return 'Show the currency code beside the price.'
  return 'Show Luna-style prices such as 27.-.'
})
const pageStyle = computed(() => (kitchen.value?.menu_style ?? {}) as Partial<PageStyle>)
const colorPresets: ColorPreset[] = [
  { name: 'rose', primary: '#F43F5E', secondary: '#FDA4AF' },
  { name: 'pink', primary: '#EC4899', secondary: '#F9A8D4' },
  { name: 'violet', primary: '#8B5CF6', secondary: '#C4B5FD' },
  { name: 'indigo', primary: '#6366F1', secondary: '#A5B4FC' },
  { name: 'sky', primary: '#0EA5E9', secondary: '#7DD3FC' },
  { name: 'emerald', primary: '#10B981', secondary: '#6EE7B7' },
]
const currencyFormatChoices: Array<{
  label: string
  value: CurrencyDisplayFormat
}> = [
  { label: 'Dash', value: 'dash' },
  { label: 'Symbol', value: 'symbol' },
  { label: 'Code', value: 'code' },
]
const currencyFormatOptions = new Set<CurrencyDisplayFormat>([
  'dash',
  'symbol',
  'code',
])
const styleFields = computed(() => [
  {
    key: 'background_color_light' as keyof PageStyle,
    label: 'Light background',
    value: pageStyle.value.background_color_light ?? '',
    placeholder: '#F7F1E6',
  },
  {
    key: 'background_color_dark' as keyof PageStyle,
    label: 'Dark background',
    value: pageStyle.value.background_color_dark ?? '',
    placeholder: '#171717',
  },
  {
    key: 'font_color_light' as keyof PageStyle,
    label: 'Light text',
    value: pageStyle.value.font_color_light ?? '',
    placeholder: '#1F1A14',
  },
  {
    key: 'font_color_dark' as keyof PageStyle,
    label: 'Dark text',
    value: pageStyle.value.font_color_dark ?? '',
    placeholder: '#F7F1E6',
  },
  {
    key: 'primary_color' as keyof PageStyle,
    label: 'Primary',
    value: pageStyle.value.primary_color ?? '',
    placeholder: '#F0C84D',
  },
  {
    key: 'secondary_color' as keyof PageStyle,
    label: 'Secondary',
    value: pageStyle.value.secondary_color ?? '',
    placeholder: '#67C96F',
  },
])
const styleSwatches = computed(() =>
  styleFields.value.map(({ label, value }) => ({ label, value }))
)

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

const formatCurrencyFormatField = (value: string) =>
  normalizeString(value).toLowerCase().replace(/[^a-z]/g, '').slice(0, 12)

const handleCurrencyFormat = async (value: string) => {
  const format = formatCurrencyFormatField(value) as CurrencyDisplayFormat

  return updateIdentityField(
    { menu_currency_format: currencyFormatOptions.has(format) ? format : 'dash' },
    'Currency display updated',
    'Failed to update currency display'
  )
}

const handleCurrencyFormatOption = async (value: CurrencyDisplayFormat) =>
  handleCurrencyFormat(value)

const handleShowCurrency = async (value: boolean) =>
  updateIdentityField(
    { menu_show_currency: value },
    value ? 'Currency shown' : 'Currency hidden',
    'Failed to update currency visibility'
  )

const formatColorField = (value: string) => {
  const raw = normalizeString(value)
  if (!raw) return ''
  const compact = raw.replace(/[^0-9a-fA-F]/g, '').slice(0, 6)
  return compact ? `#${compact.toUpperCase()}` : ''
}

const validateColorField = (value: string) => {
  const color = formatColorField(value)
  const isValid = !color || /^#[0-9A-F]{6}$/.test(color)

  return {
    isValid,
    message: isValid ? '' : 'Use a 6-digit hex colour, e.g. #F7F1E6.',
  }
}

const nextStylePatch = (patch: Partial<PageStyle>): PageStyle => ({
  background_color_light: pageStyle.value.background_color_light ?? '',
  background_color_dark: pageStyle.value.background_color_dark ?? '',
  font_color_light: pageStyle.value.font_color_light ?? '',
  font_color_dark: pageStyle.value.font_color_dark ?? '',
  primary_color: pageStyle.value.primary_color ?? '',
  secondary_color: pageStyle.value.secondary_color ?? '',
  ...patch,
})

const handleStyleField = async (field: keyof PageStyle, value: string) => {
  const patch: Partial<PageStyle> = {}
  patch[field] = formatColorField(value)

  return updateIdentityField(
    {
      menu_style: nextStylePatch(patch),
    },
    'Menu style updated',
    'Failed to update menu style'
  )
}

const handleColorPreset = async (preset: ColorPreset) =>
  updateIdentityField(
    {
      menu_style: nextStylePatch({
        primary_color: preset.primary,
        secondary_color: preset.secondary,
      }),
    },
    `${preset.name} preset applied`,
    'Failed to apply colour preset'
  )
</script>
