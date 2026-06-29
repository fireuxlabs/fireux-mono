<template>
  <UCard>
    <template #header>
      <div class="flex items-start gap-3">
        <UIcon name="i-lucide-palette" class="mt-1 size-5 shrink-0 text-muted" />
        <div class="space-y-1">
          <div class="text-base font-semibold text-highlighted">
            Menu Theme
          </div>
          <p class="text-sm text-dimmed">
            Choose the portable tokens used by this kitchen's public food menus.
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
                  :class="[
                    'h-16 justify-start overflow-hidden',
                    activeTitleFontId === font.id ? 'theme-font-option--selected' : '',
                  ]"
                  :disabled="!canWrite"
                  @click="updateTitleFont(font.id)"
                >
                  <span class="grid w-full min-w-0 text-left">
                    <span
                      class="block truncate text-lg leading-none"
                      :style="{ fontFamily: font.cssFamily }"
                    >
                      {{ font.label }}
                    </span>
                  </span>
                  <UBadge
                    v-if="activeTitleFontId === font.id"
                    size="sm"
                    color="primary"
                    variant="soft"
                  >
                    Selected
                  </UBadge>
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
                  :class="[
                    'h-16 justify-start overflow-hidden',
                    activeMenuFontId === font.id ? 'theme-font-option--selected' : '',
                  ]"
                  :disabled="!canWrite"
                  @click="updateMenuFont(font.id)"
                >
                  <span class="grid w-full min-w-0 text-left">
                    <span
                      class="block truncate text-sm leading-none"
                      :style="{ fontFamily: font.cssFamily }"
                    >
                      {{ font.label }}
                    </span>
                  </span>
                  <UBadge
                    v-if="activeMenuFontId === font.id"
                    size="sm"
                    color="primary"
                    variant="soft"
                  >
                    Selected
                  </UBadge>
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
            <div
              v-for="field in group.fields"
              :key="field.key"
              class="theme-color-row"
            >
              <div class="flex items-center justify-between gap-3">
                <div class="min-w-0">
                  <p class="text-sm font-medium text-highlighted">
                    {{ field.label }}
                  </p>
                  <p class="text-xs text-dimmed">
                    Selected {{ style[field.key] }}
                  </p>
                </div>
                <UBadge
                  v-if="isDefaultColor(field.key)"
                  size="sm"
                  color="neutral"
                  variant="soft"
                >
                  Default
                </UBadge>
                <UBadge
                  v-else
                  size="sm"
                  color="primary"
                  variant="soft"
                >
                  Custom
                </UBadge>
              </div>

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
            </div>
          </section>
        </template>
      </UCollapsible>

      <UAlert
        v-if="!canWrite"
        color="neutral"
        variant="soft"
        title="Theme is read-only"
        description="Select a writable kitchen before editing menu display values."
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
  menuThemeFontFromId,
  menuThemeFontOptions,
  menuThemeDefaultPageStyle,
  resolveMenuPageStyle,
  resolveMenuFont,
  resolveMenuTitleFont,
} from '../../../../composables/fireux/public/menu/useMenuTheme'

type ColorStyleKey = Exclude<
  keyof PageStyle,
  'title_font_source' | 'title_font_family' | 'font_source' | 'font_family'
>

const props = defineProps<{
  style: Partial<PageStyle>
  canWrite: boolean
  saveState: string
}>()

const emit = defineEmits<{
  'update:style': [style: Partial<PageStyle>]
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
      { key: 'background_color_light', label: 'Background', placeholder: '#f8fafc' },
      { key: 'font_color_light', label: 'Text', placeholder: '#0f172a' },
      { key: 'title_color_light', label: 'Title', placeholder: '#0f172a' },
    ],
  },
  {
    title: 'Dark mode colors',
    description: 'Used when the menu is viewed in dark mode.',
    fields: [
      { key: 'background_color_dark', label: 'Background', placeholder: '#0f172a' },
      { key: 'font_color_dark', label: 'Text', placeholder: '#f8fafc' },
      { key: 'title_color_dark', label: 'Title', placeholder: '#f8fafc' },
    ],
  },
  {
    title: 'Menu accents',
    description: 'Portable accent colors for menu labels, actions, and highlighted details.',
    fields: [
      { key: 'primary_color', label: 'Primary accent', placeholder: '#0f766e' },
      { key: 'secondary_color', label: 'Secondary accent', placeholder: '#64748b' },
    ],
  },
]

const normalizeString = (value: unknown) => String(value ?? '').trim()
// Theme editor spine: keep fields aligned with PageStyle and MenuDetailTheme; full tenant app chrome stays outside this editor.
const normalizeStyle = (style: Partial<PageStyle>): Partial<PageStyle> => {
  const resolved = resolveMenuPageStyle(style)
  const fontSource = normalizeString(style.font_source) === 'google' ? 'google' : 'system'
  const titleFontSource =
    normalizeString(style.title_font_source) === 'google' ? 'google' : 'system'
  const hasTitleFont = Boolean(
    normalizeString(style.title_font_source) || normalizeString(style.title_font_family)
  )
  const font = resolveMenuFont({
    font_source: fontSource,
    font_family: normalizeString(style.font_family),
  })
  const titleFont = hasTitleFont
    ? resolveMenuTitleFont({
        title_font_source: titleFontSource,
        title_font_family: normalizeString(style.title_font_family),
      })
    : font

  return {
    ...resolved,
    title_font_source: titleFont.source,
    title_font_family: titleFont.family,
    font_source: font.source,
    font_family: font.family,
  }
}
const style = computed(() => normalizeStyle(props.style))
const activeTitleFont = computed(() => resolveMenuTitleFont(style.value))
const activeMenuFont = computed(() => resolveMenuFont(style.value))
const activeTitleFontId = computed(() => activeTitleFont.value.id)
const activeMenuFontId = computed(() => activeMenuFont.value.id)
const fontChoices = menuThemeFontOptions.map((option) => ({
  ...option,
  ...resolveMenuFont({
    font_source: option.source,
    font_family: option.family,
  }),
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
  const font = menuThemeFontFromId(id)

  emit('update:style', normalizeStyle({
    ...style.value,
    title_font_source: font.source,
    title_font_family: font.family,
  }))
}

function updateMenuFont(id: string) {
  const font = menuThemeFontFromId(id)

  emit('update:style', normalizeStyle({
    ...style.value,
    font_source: font.source,
    font_family: font.family,
  }))
}

function colorInputValue(value: unknown) {
  const color = normalizeString(value)
  return /^#[0-9a-f]{6}$/i.test(color) ? color : '#ffffff'
}

function isDefaultColor(key: ColorStyleKey) {
  return normalizeString(style.value[key]) === normalizeString(resolveMenuPageStyle(menuThemeDefaultPageStyle)[key])
}
</script>

<style scoped>
.theme-font-option--selected {
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--ui-primary) 44%, transparent);
}

.theme-color-row {
  display: grid;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 1px solid color-mix(in srgb, var(--ui-primary) 12%, var(--ui-border));
  border-radius: 0.75rem;
  background: color-mix(in srgb, var(--ui-primary) 3%, transparent);
}
</style>
