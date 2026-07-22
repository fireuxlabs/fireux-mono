<template>
  <!-- Concurrent edit — 2026-07-22 12:13 CEST — Kitchen palette onboarding: choose inheritance or sparse root colour overrides. -->
  <section class="form-stack-sm">
    <UAlert
      color="neutral"
      variant="soft"
      icon="i-lucide-layers-3"
      title="Place colours are the default"
      description="Leave these unchanged to inherit the Place. Only Kitchen differences are stored."
    />

    <MoleculesFormsBrandPalette
      :model-value="modelValue"
      :inherited="inherited"
      :disabled="!editable"
      active-label="Kitchen override"
      inherit-label="Place colour"
      @update:model-value="emit('update:modelValue', $event)"
    />
  </section>
</template>

<script setup lang="ts">
import type { SparseBrandPalette } from 'fireux-core/runtime/models/core/style.model'

defineProps<{
  modelValue: SparseBrandPalette
  inherited: SparseBrandPalette
  editable: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: SparseBrandPalette]
}>()
</script>
