<template>
  <!-- Concurrent edit — 2026-07-22 12:13 CEST — Kitchen palette onboarding: choose inheritance or sparse root colour overrides. -->
  <!-- Concurrent edit — 2026-07-22 13:21 CEST — Onboarding spine: present Kitchen colour choices without architecture copy. -->
  <section class="form-stack-sm">
    <MoleculesFormsBrandPalette
      :model-value="modelValue"
      :inherited="inherited"
      :disabled="!editable"
      active-label="Kitchen colour"
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
