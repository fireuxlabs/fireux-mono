<template>
  <div class="flex flex-wrap items-center gap-2 text-xs text-gray-600">
    <span class="font-medium">Drift:</span>

    <UButton
      size="xs"
      :variant="driftKind === 'missing' ? 'solid' : 'ghost'"
      color="primary"
      @click="$emit('update:drift-kind', 'missing')"
    >
      Missing
    </UButton>

    <UButton
      size="xs"
      :variant="driftKind === 'extra' ? 'solid' : 'ghost'"
      color="primary"
      @click="$emit('update:drift-kind', 'extra')"
    >
      Extra
    </UButton>

    <span class="font-medium ml-2">
      Filter {{ driftKind }}:
    </span>

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
      :disabled="copyDisabled"
      :icon="copyIcon || 'i-heroicons-clipboard-document-check'"
      @click="$emit('copy')"
    >
      {{ copyLabel || 'Copy filtered drift' }}
    </UButton>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'DriftToolbar' })

type DriftKind = 'missing' | 'extra'

interface FilterOption {
  label: string
  value: string
}

interface Props {
  driftKind: DriftKind
  selectedField: string
  filterOptions: FilterOption[]
  copyLabel?: string
  copyIcon?: string
  copyDisabled?: boolean
}

defineProps<Props>()

defineEmits<{
  (event: 'update:drift-kind', value: DriftKind): void
  (event: 'update:selected-field', value: string): void
  (event: 'copy'): void
}>()
</script>
