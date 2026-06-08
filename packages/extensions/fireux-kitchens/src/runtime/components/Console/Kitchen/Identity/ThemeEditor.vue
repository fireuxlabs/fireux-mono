<template>
  <UCard>
    <template #header>
      <div class="flex items-start gap-3">
        <UIcon name="i-lucide-palette" class="mt-1 size-5 shrink-0 text-muted" />
        <div class="space-y-1">
          <div class="text-base font-semibold text-highlighted">
            Pick a Theme
          </div>
          <p class="text-sm text-dimmed">
            Store a small menu color pack on this kitchen.
          </p>
        </div>
      </div>
    </template>

    <div class="space-y-5">
      <div class="grid gap-3 sm:grid-cols-2">
        <UButton
          v-for="preset in presets"
          :key="preset.id"
          color="neutral"
          :variant="activePresetId === preset.id ? 'solid' : 'soft'"
          class="justify-start"
          :disabled="saving"
          @click="applyPreset(preset.style)"
        >
          <span class="flex min-w-0 items-center gap-3">
            <span class="flex shrink-0 overflow-hidden rounded-md border border-default">
              <span
                class="size-5"
                :style="swatchStyle(preset.style.background_color_light || '#ffffff')"
              />
              <span
                class="size-5"
                :style="swatchStyle(preset.style.primary_color || '#111827')"
              />
              <span
                class="size-5"
                :style="swatchStyle(preset.style.secondary_color || '#6b7280')"
              />
            </span>
            <span class="min-w-0 text-left">
              <span class="block truncate">{{ preset.label }}</span>
              <span class="block truncate text-xs opacity-75">{{ preset.description }}</span>
            </span>
          </span>
        </UButton>
      </div>

      <div class="grid gap-3 md:grid-cols-2">
        <UFormField
          v-for="field in fields"
          :key="field.key"
          :label="field.label"
        >
          <div class="flex items-center gap-2">
            <input
              class="size-9 shrink-0 rounded-md border border-default bg-default"
              type="color"
              :value="colorInputValue(style[field.key])"
              :disabled="saving"
              @input="updateField(field.key, ($event.target as HTMLInputElement).value)"
            >
            <UInput
              :model-value="style[field.key]"
              :placeholder="field.placeholder"
              :disabled="saving"
              class="w-full"
              @update:model-value="updateField(field.key, $event)"
            />
          </div>
        </UFormField>
      </div>

      <UAlert
        v-if="!canWrite"
        color="neutral"
        variant="soft"
        title="Theme is read-only"
        description="Select a writable live kitchen before saving menu display values."
      />

      <div class="flex flex-wrap gap-2">
        <UButton
          icon="i-lucide-save"
          :loading="saving"
          :disabled="!canWrite || !hasChanges"
          @click="emit('save')"
        >
          Save theme
        </UButton>

        <UButton
          color="neutral"
          variant="soft"
          icon="i-lucide-rotate-ccw"
          :disabled="saving || !hasChanges"
          @click="emit('reset')"
        >
          Reset changes
        </UButton>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { PageStyle } from 'fireux-core/runtime/models/core/style.model'
import { computed } from 'vue'

type StyleKey = keyof PageStyle
type ThemePreset = {
  id: string
  label: string
  description: string
  style: PageStyle
}

const props = defineProps<{
  style: PageStyle
  canWrite: boolean
  saving: boolean
  hasChanges: boolean
}>()

const emit = defineEmits<{
  'update:style': [style: PageStyle]
  save: []
  reset: []
}>()

const emptyStyle = (): PageStyle => ({
  background_color_light: '',
  background_color_dark: '',
  font_color_light: '',
  font_color_dark: '',
  primary_color: '',
  secondary_color: '',
})

const presets: ThemePreset[] = [
  {
    id: 'out-of-box',
    label: 'Out of box',
    description: 'Use the app UI tokens.',
    style: emptyStyle(),
  },
  {
    id: 'misebox-default',
    label: 'Misebox default',
    description: 'Warm paper and calm ink.',
    style: {
      background_color_light: '#fffaf2',
      background_color_dark: '#171717',
      font_color_light: '#211915',
      font_color_dark: '#f8f1e8',
      primary_color: '#b45309',
      secondary_color: '#166534',
    },
  },
  {
    id: 'piccante',
    label: 'Piccante',
    description: 'Warm tomato and gold.',
    style: {
      background_color_light: '#fff7ed',
      background_color_dark: '#1c1917',
      font_color_light: '#1f1a14',
      font_color_dark: '#fff7ed',
      primary_color: '#dc2626',
      secondary_color: '#f59e0b',
    },
  },
  {
    id: 'alpine',
    label: 'Alpine',
    description: 'Fresh blue and green.',
    style: {
      background_color_light: '#f8fafc',
      background_color_dark: '#0f172a',
      font_color_light: '#0f172a',
      font_color_dark: '#e2e8f0',
      primary_color: '#2563eb',
      secondary_color: '#047857',
    },
  },
]

const fields: { key: StyleKey, label: string, placeholder: string }[] = [
  { key: 'background_color_light', label: 'Light background', placeholder: '#fffaf2' },
  { key: 'font_color_light', label: 'Light text', placeholder: '#211915' },
  { key: 'background_color_dark', label: 'Dark background', placeholder: '#171717' },
  { key: 'font_color_dark', label: 'Dark text', placeholder: '#f8f1e8' },
  { key: 'primary_color', label: 'Primary accent', placeholder: '#b45309' },
  { key: 'secondary_color', label: 'Secondary accent', placeholder: '#166534' },
]

const normalizeString = (value: unknown) => String(value ?? '').trim()
const normalizeStyle = (style: Partial<PageStyle>): PageStyle => ({
  background_color_light: normalizeString(style.background_color_light),
  background_color_dark: normalizeString(style.background_color_dark),
  font_color_light: normalizeString(style.font_color_light),
  font_color_dark: normalizeString(style.font_color_dark),
  primary_color: normalizeString(style.primary_color),
  secondary_color: normalizeString(style.secondary_color),
})
const sameStyle = (a: Partial<PageStyle>, b: Partial<PageStyle>) =>
  JSON.stringify(normalizeStyle(a)) === JSON.stringify(normalizeStyle(b))

const style = computed(() => normalizeStyle(props.style))
const activePresetId = computed(() =>
  presets.find((preset) => sameStyle(preset.style, style.value))?.id || ''
)

function applyPreset(style: PageStyle) {
  emit('update:style', normalizeStyle(style))
}

function updateField(key: StyleKey, value: unknown) {
  emit('update:style', {
    ...style.value,
    [key]: normalizeString(value),
  })
}

function colorInputValue(value: string) {
  const color = normalizeString(value)
  return /^#[0-9a-f]{6}$/i.test(color) ? color : '#ffffff'
}

function swatchStyle(value: string) {
  return {
    backgroundColor: value,
  }
}
</script>
