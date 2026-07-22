<template>
  <!-- Concurrent edit — 2026-07-22 12:13 CEST — Place/Kitchen palette onboarding: provide one sparse inherited colour control. -->
  <section class="form-stack-sm">
    <UFormField
      v-for="field in fields"
      :key="field.key"
      :label="field.label"
      :hint="modelValue[field.key] ? activeLabel : inheritLabel"
    >
      <UFieldGroup>
        <UInput
          type="color"
          :model-value="displayColor(field.key)"
          :disabled="disabled"
          :aria-label="`${field.label} colour picker`"
          @update:model-value="updateColor(field.key, $event)"
        />
        <UInput
          :model-value="modelValue[field.key] || ''"
          :placeholder="displayColor(field.key)"
          :disabled="disabled"
          maxlength="7"
          :aria-label="`${field.label} hex colour`"
          @update:model-value="updateColor(field.key, $event)"
        />
        <UButton
          v-if="modelValue[field.key] && !disabled"
          type="button"
          color="neutral"
          variant="soft"
          icon="i-lucide-rotate-ccw"
          :aria-label="`Use inherited ${field.label.toLowerCase()}`"
          @click="resetColor(field.key)"
        />
      </UFieldGroup>
    </UFormField>
  </section>
</template>

<script setup lang="ts">
import {
  type BrandPaletteKey,
  type SparseBrandPalette,
} from '../../../models/core/style.model'
import { DEFAULT_BRAND_PALETTE } from '../../../utils/brand-palette'

const props = withDefaults(defineProps<{
  modelValue: SparseBrandPalette
  inherited?: SparseBrandPalette
  disabled?: boolean
  activeLabel?: string
  inheritLabel?: string
}>(), {
  inherited: () => ({}),
  disabled: false,
  activeLabel: 'Selected',
  inheritLabel: 'Inherited',
})

const emit = defineEmits<{
  'update:modelValue': [value: SparseBrandPalette]
}>()

const fields: { key: BrandPaletteKey; label: string }[] = [
  { key: 'primary_color', label: 'Primary colour' },
  { key: 'secondary_color', label: 'Secondary colour' },
]

const text = (value: unknown) => String(value ?? '').trim().toLowerCase()

function inheritedColor(key: BrandPaletteKey) {
  return text(props.inherited[key]) || DEFAULT_BRAND_PALETTE[key]
}

function displayColor(key: BrandPaletteKey) {
  const selected = text(props.modelValue[key])
  return /^#[0-9a-f]{6}$/.test(selected)
    ? selected
    : inheritedColor(key)
}

function updateColor(key: BrandPaletteKey, value: unknown) {
  if (props.disabled) return
  const color = text(value)
  const next = { ...props.modelValue }
  if (!color || color === inheritedColor(key)) delete next[key]
  else next[key] = color
  emit('update:modelValue', next)
}

function resetColor(key: BrandPaletteKey) {
  const next = { ...props.modelValue }
  delete next[key]
  emit('update:modelValue', next)
}
</script>
