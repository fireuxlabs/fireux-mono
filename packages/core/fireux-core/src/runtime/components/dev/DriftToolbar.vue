<template>
  <div class="flex flex-wrap items-center gap-2 text-xs text-toned">
    <span class="font-medium">Drift:</span>

    <UButton
      size="xs"
      :variant="driftKind === 'extra' ? 'solid' : 'ghost'"
      color="primary"
      @click="$emit('update:drift-kind', 'extra')"
    >
      Extra
    </UButton>

    <UButton
      v-if="allowMissing"
      size="xs"
      :variant="driftKind === 'missing' ? 'solid' : 'ghost'"
      color="primary"
      @click="$emit('update:drift-kind', 'missing')"
    >
      Missing
    </UButton>

    <span class="font-medium ml-2"> Filter {{ driftKind }}: </span>

    <UButton
      v-for="option in filterOptions"
      :key="option.value"
      size="xs"
      :variant="selectedField === option.value ? 'solid' : 'ghost'"
      color="primary"
      @click="$emit('update:selected-field', option.value)"
    >
      {{ option.label }}
    </UButton>

    <UButton
      size="xs"
      variant="outline"
      :disabled="copyDisabled || copying"
      :icon="
        copying
          ? 'i-heroicons-arrow-path'
          : copyIcon || 'i-heroicons-clipboard-document-check'
      "
      @click="handleCopy"
    >
      {{ copying ? 'Copying…' : copyLabel || 'Copy filtered drift' }}
    </UButton>
  </div>
</template>

<script setup lang="ts">
// Concurrent edit — 2026-07-20 20:46 CEST — Repo Efficiency Pass 3 of 6: keep model-drift copy diagnostic-only.
import { useDevClipboard } from '../../composables/dev/useDevClipboard'

defineOptions({ name: 'DriftToolbar' })

type DriftKind = 'missing' | 'extra'

interface FilterOption {
  label: string
  value: string
}

interface Props {
  driftKind: DriftKind
  allowMissing?: boolean
  selectedField: string
  filterOptions: FilterOption[]
  copyPayload?: unknown
  copyLabel?: string
  copyIcon?: string
  copyDisabled?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (event: 'update:drift-kind', value: DriftKind): void
  (event: 'update:selected-field', value: string): void
  (event: 'copy'): void
}>()

const { copyJSON, copying } = useDevClipboard()

const handleCopy = async () => {
  const payload = props.copyPayload
  if (payload !== undefined) {
    await copyJSON(payload, {
      label: props.copyLabel || 'Copy filtered drift',
    })
  }
  emit('copy')
}
</script>
