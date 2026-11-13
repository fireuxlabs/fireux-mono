<template>
  <!-- Concurrent edit — 2026-07-22 12:13 CEST — Place/Kitchen palette onboarding: provide one sparse inherited colour control. -->
  <!-- Concurrent edit — 2026-07-22 13:22 CEST — Shared palette picker: replace native colour inputs with the Nuxt UI chooser. -->
  <section class="form-stack-sm">
    <UFormField
      v-for="field in fields"
      :key="field.key"
      :label="field.label"
      :hint="modelValue[field.key] ? 'Place colour' : 'Default'"
    >
      <UColorPicker
        :model-value="displayColor(field.key)"
        :disabled="disabled"
        size="sm"
        :aria-label="`${field.label} colour picker`"
        @update:model-value="updateColor(field.key, $event)"
      />

      <UFieldGroup>
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
          :aria-label="`Reset ${field.label.toLowerCase()}`"
          @click="resetColor(field.key)"
        />
      </UFieldGroup>
    </UFormField>
  </section>
</template>

<script setup lang="ts">
import type { Place } from '../../models/place.model'

const props = withDefaults(
  defineProps<{
    modelValue: Place['brand_palette']
    disabled?: boolean
  }>(),
  {
    disabled: false,
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: Place['brand_palette']]
}>()

const fields: { key: keyof Place['brand_palette']; label: string }[] = [
  { key: 'primary_color', label: 'Primary colour' },
  { key: 'secondary_color', label: 'Secondary colour' },
]

const text = (value: unknown) =>
  String(value ?? '')
    .trim()
    .toLowerCase()

const defaults = { primary_color: '#0f766e', secondary_color: '#64748b' }

function displayColor(key: keyof Place['brand_palette']) {
  const selected = text(props.modelValue[key])
  return /^#[0-9a-f]{6}$/.test(selected) ? selected : defaults[key]
}

function updateColor(key: keyof Place['brand_palette'], value: unknown) {
  if (props.disabled) return
  const color = text(value)
  const next = { ...props.modelValue }
  if (!color) delete next[key]
  else next[key] = color
  emit('update:modelValue', next)
}

function resetColor(key: keyof Place['brand_palette']) {
  const next = { ...props.modelValue }
  delete next[key]
  emit('update:modelValue', next)
}
</script>
