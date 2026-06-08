<template>
  <UCard>
    <template #header>
      <div class="flex items-start gap-3">
        <UIcon name="i-lucide-palette" class="mt-1 size-5 shrink-0 text-muted" />
        <div class="space-y-1">
          <div class="text-base font-semibold text-highlighted">
            Menu Style
          </div>
          <p class="text-sm text-dimmed">
            Choose the basic tokens used by this kitchen's public menus.
          </p>
        </div>
      </div>
    </template>

    <div class="space-y-3">
      <UCollapsible :default-open="false">
        <UButton
          color="neutral"
          variant="soft"
          block
          trailing-icon="i-lucide-chevron-down"
        >
          Fonts
        </UButton>

        <template #content>
          <div class="mt-3 grid gap-4 lg:grid-cols-2">
            <UFormField label="Main title font">
              <div class="grid gap-2">
                <UButton
                  v-for="font in fontChoices"
                  :key="`title-${font.id}`"
                  color="neutral"
                  :variant="activeTitleFontId === font.id ? 'solid' : 'soft'"
                  class="h-16 justify-start overflow-hidden"
                  :disabled="!canWrite"
                  @click="updateTitleFont(font.id)"
                >
                  <span class="grid w-full min-w-0 gap-1 text-left">
                    <span
                      class="block truncate text-lg leading-none"
                      :style="{ fontFamily: font.cssFamily }"
                    >
                      {{ font.sample }}
                    </span>
                    <span class="truncate text-xs opacity-75">
                      {{ font.label }}
                    </span>
                  </span>
                </UButton>
              </div>
            </UFormField>

            <UFormField label="Menu font">
              <div class="grid gap-2">
                <UButton
                  v-for="font in fontChoices"
                  :key="`menu-${font.id}`"
                  color="neutral"
                  :variant="activeMenuFontId === font.id ? 'solid' : 'soft'"
                  class="h-16 justify-start overflow-hidden"
                  :disabled="!canWrite"
                  @click="updateMenuFont(font.id)"
                >
                  <span class="grid w-full min-w-0 gap-1 text-left">
                    <span
                      class="block truncate text-sm leading-none"
                      :style="{ fontFamily: font.cssFamily }"
                    >
                      {{ font.sample }}
                    </span>
                    <span class="truncate text-xs opacity-75">
                      {{ font.label }}
                    </span>
                  </span>
                </UButton>
              </div>
            </UFormField>
          </div>
        </template>
      </UCollapsible>

      <UCollapsible
        v-for="group in colorGroups"
        :key="group.title"
        :default-open="false"
      >
        <UButton
          color="neutral"
          variant="soft"
          block
          trailing-icon="i-lucide-chevron-down"
        >
          <span class="grid min-w-0 text-left">
            <span class="truncate">
              {{ group.title }}
            </span>
            <span class="truncate text-xs font-normal text-dimmed">
              {{ group.description }}
            </span>
          </span>
        </UButton>

        <template #content>
          <section class="mt-3 grid gap-3 rounded-md border border-default p-3">
            <UFormField
              v-for="field in group.fields"
              :key="field.key"
              :label="field.label"
            >
              <div class="flex items-center gap-2">
                <input
                  class="size-9 shrink-0 rounded-md border border-default bg-default"
                  type="color"
                  :value="colorInputValue(style[field.key])"
                  :disabled="!canWrite"
                  @input="updateField(field.key, ($event.target as HTMLInputElement).value)"
                >
                <UInput
                  :model-value="style[field.key]"
                  :placeholder="field.placeholder"
                  :disabled="!canWrite"
                  class="w-full"
                  @update:model-value="updateField(field.key, $event)"
                />
              </div>
            </UFormField>
          </section>
        </template>
      </UCollapsible>

      <UAlert
        v-if="!canWrite"
        color="neutral"
        variant="soft"
        title="Theme is read-only"
        description="Select a writable live kitchen before editing menu display values."
      />

      <p v-else-if="saveState" class="text-xs text-dimmed">
        {{ saveState }}
      </p>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import type { PageStyle } from 'fireux-core/runtime/models/core/style.model'
import { computed } from 'vue'
import {
  kitchenPublicMenuFontFromId,
  kitchenPublicMenuFontOptions,
  resolveKitchenPublicMenuFont,
  resolveKitchenPublicMenuTitleFont,
} from '../../../../composables/fireux/public/kitchen/menu/useKitchenPublicMenuTheme'

type ColorStyleKey = Exclude<
  keyof PageStyle,
  'title_font_source' | 'title_font_family' | 'font_source' | 'font_family'
  | 'primary_color' | 'secondary_color'
>

const props = defineProps<{
  style: PageStyle
  canWrite: boolean
  saveState: string
}>()

const emit = defineEmits<{
  'update:style': [style: PageStyle]
}>()

type ColorField = {
  key: ColorStyleKey
  label: string
  placeholder: string
}

const colorGroups: { title: string, description: string, fields: ColorField[] }[] = [
  {
    title: 'Light mode colors',
    description: 'Used when the menu is viewed in light mode.',
    fields: [
      { key: 'background_color_light', label: 'Background', placeholder: '#fffaf2' },
      { key: 'font_color_light', label: 'Text', placeholder: '#211915' },
      { key: 'title_color_light', label: 'Title', placeholder: '#7c2d12' },
    ],
  },
  {
    title: 'Dark mode colors',
    description: 'Used when the menu is viewed in dark mode.',
    fields: [
      { key: 'background_color_dark', label: 'Background', placeholder: '#171717' },
      { key: 'font_color_dark', label: 'Text', placeholder: '#f8f1e8' },
      { key: 'title_color_dark', label: 'Title', placeholder: '#fbbf24' },
    ],
  },
]

const normalizeString = (value: unknown) => String(value ?? '').trim()
const normalizeStyle = (style: Partial<PageStyle>): PageStyle => {
  const fontSource = normalizeString(style.font_source) === 'google' ? 'google' : 'system'
  const titleFontSource =
    normalizeString(style.title_font_source) === 'google' ? 'google' : 'system'
  const hasTitleFont = Boolean(
    normalizeString(style.title_font_source) || normalizeString(style.title_font_family)
  )
  const font = resolveKitchenPublicMenuFont({
    font_source: fontSource,
    font_family: normalizeString(style.font_family),
  })
  const titleFont = hasTitleFont
    ? resolveKitchenPublicMenuTitleFont({
        title_font_source: titleFontSource,
        title_font_family: normalizeString(style.title_font_family),
      })
    : font

  return {
    background_color_light: normalizeString(style.background_color_light),
    background_color_dark: normalizeString(style.background_color_dark),
    font_color_light: normalizeString(style.font_color_light),
    font_color_dark: normalizeString(style.font_color_dark),
    title_color_light: normalizeString(style.title_color_light),
    title_color_dark: normalizeString(style.title_color_dark),
    primary_color: '',
    secondary_color: '',
    title_font_source: titleFont.source,
    title_font_family: titleFont.family,
    font_source: font.source,
    font_family: font.family,
  }
}
const style = computed(() => normalizeStyle(props.style))
const activeTitleFont = computed(() => resolveKitchenPublicMenuTitleFont(style.value))
const activeMenuFont = computed(() => resolveKitchenPublicMenuFont(style.value))
const activeTitleFontId = computed(() => activeTitleFont.value.id)
const activeMenuFontId = computed(() => activeMenuFont.value.id)
const fontChoices = kitchenPublicMenuFontOptions.map((option) => ({
  ...option,
  ...resolveKitchenPublicMenuFont({
    font_source: option.source,
    font_family: option.family,
  }),
  sample: option.id === 'system' ? 'Sample menu' : option.label,
}))
const fontStylesheetLinks = [
  ...new Set(fontChoices.map((font) => font.stylesheetUrl).filter(Boolean)),
].map((href) => ({
  rel: 'stylesheet',
  href,
}))

useHead({
  link: fontStylesheetLinks,
})

function updateField(key: ColorStyleKey, value: unknown) {
  emit('update:style', {
    ...style.value,
    [key]: normalizeString(value),
  })
}

function updateTitleFont(id: string) {
  const font = kitchenPublicMenuFontFromId(id)

  emit('update:style', normalizeStyle({
    ...style.value,
    title_font_source: font.source,
    title_font_family: font.family,
  }))
}

function updateMenuFont(id: string) {
  const font = kitchenPublicMenuFontFromId(id)

  emit('update:style', normalizeStyle({
    ...style.value,
    font_source: font.source,
    font_family: font.family,
  }))
}

function colorInputValue(value: string) {
  const color = normalizeString(value)
  return /^#[0-9a-f]{6}$/i.test(color) ? color : '#ffffff'
}
</script>
